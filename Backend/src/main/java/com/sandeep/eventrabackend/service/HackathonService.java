package com.sandeep.eventrabackend.service;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.sandeep.eventrabackend.dto.request.HackathonCreateRequest;
import com.sandeep.eventrabackend.dto.response.HackathonRegistrationResponse;
import com.sandeep.eventrabackend.dto.response.HackathonResponse;
import com.sandeep.eventrabackend.exception.HackathonNotFoundException;
import com.sandeep.eventrabackend.exception.RegistrationClosedException;
import com.sandeep.eventrabackend.exception.RegistrationConflictException;
import com.sandeep.eventrabackend.model.Hackathon;
import com.sandeep.eventrabackend.model.HackathonRegistration;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.HackathonRegistrationRepository;
import com.sandeep.eventrabackend.repository.HackathonRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.sandeep.eventrabackend.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;
import com.sandeep.eventrabackend.model.Role;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HackathonService {

    private static final Logger log = LoggerFactory.getLogger(HackathonService.class);

    private final HackathonRepository hackathonRepository;
    private final HackathonRegistrationRepository hackathonRegistrationRepository;
    private final UserRepository userRepository;

    public HackathonService(HackathonRepository hackathonRepository,
                            HackathonRegistrationRepository hackathonRegistrationRepository,
                            UserRepository userRepository) {
        this.hackathonRepository = hackathonRepository;
        this.hackathonRegistrationRepository = hackathonRegistrationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Page<HackathonResponse> getAllHackathons(Pageable pageable) {
        return hackathonRepository.findByIsDeletedFalse(pageable)
                .map(this::mapToResponse);
    }

    public List<HackathonResponse> getAllHackathons() {
        return hackathonRepository.findByIsDeletedFalse().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "hackathons", key = "#id")
    public HackathonResponse getHackathonById(Long id) {
        return hackathonRepository.findByIdAndIsDeletedFalse(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new HackathonNotFoundException("Hackathon not found with id: " + id));
    }

    @Transactional
    public HackathonResponse createHackathon(HackathonCreateRequest request, String userEmail) {
        User creator = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));

        if (request.getMaxParticipants() != null && request.getMaxParticipants() < 2) {
            throw new IllegalArgumentException("Maximum participants capacity must be at least 2.");
        }

        // FIX (#14532): reject inverted date ranges on create, same as update.
        validateDateRanges(request.getStartDate(), request.getEndDate(), request.getRegistrationDeadline());
        if (request.getTitle() != null && (request.getTitle().trim().length() < 3 || request.getTitle().trim().length() > 100)) {
            throw new IllegalArgumentException("Title must be between 3 and 100 characters.");
        }
        if (request.getDescription() != null && (request.getDescription().trim().length() < 10 || request.getDescription().trim().length() > 2000)) {
            throw new IllegalArgumentException("Description must be between 10 and 2000 characters.");
        }

        Hackathon hackathon = Hackathon.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .organizer(request.getOrganizer())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .location(request.getLocation())
                .mode(request.getMode())
                .prizePool(request.getPrizePool())
                .registrationDeadline(request.getRegistrationDeadline())
                .imageUrl(request.getImageUrl())
                .ownerId(creator.getId())
                .build();

        if (request.getOrganizer() != null && (request.getOrganizer().trim().length() < 2 || request.getOrganizer().trim().length() > 100)) {
            throw new IllegalArgumentException("Organizer name must be between 2 and 100 characters.");
        }
        if (request.getLocation() != null && (request.getLocation().trim().length() < 3 || request.getLocation().trim().length() > 150)) {
            throw new IllegalArgumentException("Location must be between 3 and 150 characters.");
        }
        Hackathon saved = hackathonRepository.save(hackathon);
        log.info("[AUDIT LOG] Administrative Action: HACKATHON_CREATE | HackathonID: {} | Title: {}", saved.getId(), saved.getTitle());
        return mapToResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "hackathons", key = "#id")
    public HackathonResponse updateHackathon(Long id, com.sandeep.eventrabackend.dto.request.HackathonUpdateRequest request, String userEmail) {
        Hackathon hackathon = hackathonRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new HackathonNotFoundException("Hackathon not found with id: " + id));

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));

        boolean isAdmin = currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.SUPER_ADMIN;
        Long ownerId = hackathon.getOwnerId();
        // Null ownerId must not open the event to any authenticated organizer.
        if (!isAdmin && (ownerId == null || !ownerId.equals(currentUser.getId()))) {
            throw new AccessDeniedException(
                    "Only the hackathon's own organizer (or an administrator) can manage this hackathon.");
        }

        // FIX (#14532): shared chronological validation, null-safe for partial updates.
        validateDateRanges(request.getStartDate(), request.getEndDate(), request.getRegistrationDeadline());
        if (request.getTitle() != null && (request.getTitle().trim().length() < 3 || request.getTitle().trim().length() > 100)) {
            throw new IllegalArgumentException("Title must be between 3 and 100 characters.");
        }
        if (request.getDescription() != null && (request.getDescription().trim().length() < 10 || request.getDescription().trim().length() > 2000)) {
            throw new IllegalArgumentException("Description must be between 10 and 2000 characters.");
        }
        if (request.getMaxParticipants() != null && request.getMaxParticipants() < 2) {
            throw new IllegalArgumentException("Maximum participants capacity must be at least 2.");
        }

        // FIX (#14532): partial update — only apply fields present in the request,
        // so a single-field payload cannot wipe the other columns.
        if (request.getTitle() != null) {
            if (request.getTitle().trim().length() < 3 || request.getTitle().trim().length() > 100) {
                throw new IllegalArgumentException("Title must be between 3 and 100 characters.");
            }
            hackathon.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            if (request.getDescription().trim().length() < 10 || request.getDescription().trim().length() > 2000) {
                throw new IllegalArgumentException("Description must be between 10 and 2000 characters.");
            }
            hackathon.setDescription(request.getDescription());
        }
        if (request.getOrganizer() != null) {
            if (request.getOrganizer().trim().length() < 2 || request.getOrganizer().trim().length() > 100) {
                throw new IllegalArgumentException("Organizer name must be between 2 and 100 characters.");
            }
            hackathon.setOrganizer(request.getOrganizer());
        }
        if (request.getStartDate() != null) hackathon.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) hackathon.setEndDate(request.getEndDate());
        if (request.getLocation() != null) {
            if (request.getLocation().trim().length() < 3 || request.getLocation().trim().length() > 150) {
                throw new IllegalArgumentException("Location must be between 3 and 150 characters.");
            }
            hackathon.setLocation(request.getLocation());
        }
        if (request.getMode() != null) hackathon.setMode(request.getMode());
        if (request.getPrizePool() != null) hackathon.setPrizePool(request.getPrizePool());
        if (request.getRegistrationDeadline() != null) hackathon.setRegistrationDeadline(request.getRegistrationDeadline());
        if (request.getImageUrl() != null) hackathon.setImageUrl(request.getImageUrl());

        Hackathon updated = hackathonRepository.save(hackathon);
        log.info("[AUDIT LOG] Administrative Action: HACKATHON_UPDATE | HackathonID: {} | UpdatedTitle: {}", updated.getId(), updated.getTitle());
        return mapToResponse(updated);
    }

    private void validateDateRanges(LocalDateTime startDate, LocalDateTime endDate, LocalDateTime registrationDeadline) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date.");
        }
        if (registrationDeadline != null && endDate != null && registrationDeadline.isAfter(endDate)) {
            throw new IllegalArgumentException("Registration deadline cannot be after end date.");
        }
        if (registrationDeadline != null && startDate != null && registrationDeadline.isAfter(startDate)) {
            throw new IllegalArgumentException("Registration deadline cannot be after start date.");
        }
        if (startDate != null && startDate.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Start date must be in the future.");
        }
        if (registrationDeadline != null && registrationDeadline.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Registration deadline must be in the future.");
        }
    }

    @Transactional
    public HackathonRegistrationResponse registerUserForHackathon(Long id, String userEmail) {
        Hackathon hackathon = hackathonRepository.findByIdWithLock(id)
                .orElseThrow(() -> new HackathonNotFoundException("Hackathon not found with id: " + id));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));

        // Duplicate registration check
        if (hackathonRegistrationRepository.existsByHackathon_IdAndUser_Email(id, userEmail)) {
            throw new RegistrationConflictException("You are already registered for this hackathon.");
        }

        // Deadline check
        if (hackathon.getRegistrationDeadline() != null && LocalDateTime.now().isAfter(hackathon.getRegistrationDeadline())) {
            throw new RegistrationClosedException("Registration deadline has passed for this hackathon.");
        }

        // Capacity check (atomic under pessimistic write lock)
        if (hackathon.getMaxParticipants() != null) {
            long currentCount = hackathonRegistrationRepository.countByHackathon_Id(id);
            if (currentCount >= hackathon.getMaxParticipants()) {
                throw new RegistrationClosedException("Hackathon has reached maximum participant capacity.");
            }
        }

        HackathonRegistration registration = HackathonRegistration.builder()
                .hackathon(hackathon)
                .user(user)
                .status("CONFIRMED")
                .build();

        try {
            registration = hackathonRegistrationRepository.saveAndFlush(registration);
        } catch (DataIntegrityViolationException ex) {
            throw new RegistrationConflictException("You are already registered for this hackathon.");
        }

        return HackathonRegistrationResponse.builder()
                .registrationId(registration.getId())
                .hackathonId(hackathon.getId())
                .hackathonTitle(hackathon.getTitle())
                .userEmail(user.getEmail())
                .registeredAt(registration.getRegisteredAt())
                .status(registration.getStatus())
                .build();
    }

    @Transactional
    public void deleteHackathon(Long id, String userEmail) {
        Hackathon hackathon = hackathonRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new HackathonNotFoundException("Hackathon not found with id: " + id));

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));

        boolean isAdmin = currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.SUPER_ADMIN;
        Long ownerId = hackathon.getOwnerId();
        if (!isAdmin && (ownerId == null || !ownerId.equals(currentUser.getId()))) {
            throw new AccessDeniedException(
                    "Only the hackathon's own organizer (or an administrator) can delete this hackathon.");
        }

        hackathon.setDeleted(true);
        hackathonRepository.save(hackathon);
        log.info("[AUDIT LOG] Administrative Action: HACKATHON_SOFT_DELETE | HackathonID: {} | Title: {} | DeletedBy: {}", hackathon.getId(), hackathon.getTitle(), userEmail);
    }

    private HackathonResponse mapToResponse(Hackathon hackathon) {
        return HackathonResponse.builder()
                .id(hackathon.getId())
                .title(hackathon.getTitle())
                .description(hackathon.getDescription())
                .organizer(hackathon.getOrganizer())
                .startDate(hackathon.getStartDate())
                .endDate(hackathon.getEndDate())
                .location(hackathon.getLocation())
                .mode(hackathon.getMode())
                .prizePool(hackathon.getPrizePool())
                .registrationDeadline(hackathon.getRegistrationDeadline())
                .imageUrl(hackathon.getImageUrl())
                .ownerId(hackathon.getOwnerId())
                .build();
    }
}
