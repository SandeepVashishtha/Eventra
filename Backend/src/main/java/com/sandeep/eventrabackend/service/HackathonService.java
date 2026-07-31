package com.sandeep.eventrabackend.service;

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
import com.sandeep.eventrabackend.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HackathonService {

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
    public List<HackathonResponse> getAllHackathons() {
        return hackathonRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HackathonResponse getHackathonById(Long id) {
        return hackathonRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new HackathonNotFoundException("Hackathon not found with id: " + id));
    }

    @Transactional
    public HackathonResponse createHackathon(HackathonCreateRequest request) {
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
                .build();

        Hackathon saved = hackathonRepository.save(hackathon);
        return mapToResponse(saved);
    }

    @Transactional
    public HackathonResponse updateHackathon(Long id, com.sandeep.eventrabackend.dto.request.HackathonUpdateRequest request) {
        Hackathon hackathon = hackathonRepository.findById(id)
                .orElseThrow(() -> new HackathonNotFoundException("Hackathon not found with id: " + id));

        hackathon.setTitle(request.getTitle());
        hackathon.setDescription(request.getDescription());
        hackathon.setOrganizer(request.getOrganizer());
        hackathon.setStartDate(request.getStartDate());
        hackathon.setEndDate(request.getEndDate());
        hackathon.setLocation(request.getLocation());
        hackathon.setMode(request.getMode());
        hackathon.setPrizePool(request.getPrizePool());
        hackathon.setRegistrationDeadline(request.getRegistrationDeadline());
        hackathon.setImageUrl(request.getImageUrl());

        Hackathon updated = hackathonRepository.save(hackathon);
        return mapToResponse(updated);
    }

    @Transactional
    public HackathonRegistrationResponse registerUserForHackathon(Long id, String userEmail) {
        Hackathon hackathon = hackathonRepository.findById(id)
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

        HackathonRegistration registration = HackathonRegistration.builder()
                .hackathon(hackathon)
                .user(user)
                .status("CONFIRMED")
                .build();

        registration = hackathonRegistrationRepository.save(registration);

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
    public void deleteHackathon(Long id) {
        if (!hackathonRepository.existsById(id)) {
            throw new HackathonNotFoundException("Hackathon not found with id: " + id);
        }
        hackathonRegistrationRepository.deleteByHackathonId(id);
        hackathonRepository.deleteById(id);
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
                .build();
    }
}
