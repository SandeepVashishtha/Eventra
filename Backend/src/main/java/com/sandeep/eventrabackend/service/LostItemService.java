package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.model.LostItem;
import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.LostItemRepository;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import com.sandeep.eventrabackend.dto.request.CreateLostItemRequest;
import com.sandeep.eventrabackend.dto.request.UpdateLostItemRequest;
import com.sandeep.eventrabackend.dto.response.LostItemResponse;
import com.sandeep.eventrabackend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LostItemService {

    private final LostItemRepository lostItemRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public List<LostItemResponse> getAllLostItemsByEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));
        
        List<LostItem> lostItems = lostItemRepository.findByEventOrderByCreatedAtDesc(event);
        return mapToResponseList(lostItems);
    }

    public List<LostItemResponse> getUnclaimedLostItemsByEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));
        
        List<LostItem> lostItems = lostItemRepository.findByEventAndIsClaimedFalseOrderByCreatedAtDesc(event);
        return mapToResponseList(lostItems);
    }

    public List<LostItemResponse> searchLostItemsByEvent(Long eventId, String query) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));
        
        List<LostItem> lostItems = lostItemRepository.searchByKeyword(event, query);
        return mapToResponseList(lostItems);
    }

    public List<LostItemResponse> searchByTag(Long eventId, String tag) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));
        
        List<LostItem> lostItems = lostItemRepository.findByEventAndAiTag(event, tag);
        return mapToResponseList(lostItems);
    }

    public List<LostItemResponse> getLostItemsByCategory(Long eventId, String category) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));
        
        List<LostItem> lostItems = lostItemRepository.findByEventAndCategoryOrderByCreatedAtDesc(event, category);
        return mapToResponseList(lostItems);
    }

    @Transactional
    public LostItemResponse createLostItem(CreateLostItemRequest request, Long userId) {
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + request.getEventId()));
        
        User foundBy = userId != null ? userRepository.findById(userId).orElse(null) : null;
        
        LostItem lostItem = new LostItem();
        lostItem.setEvent(event);
        lostItem.setFoundBy(foundBy);
        lostItem.setTitle(request.getTitle());
        lostItem.setDescription(request.getDescription());
        lostItem.setImageUrl(request.getImageUrl());
        lostItem.setThumbnailUrl(request.getThumbnailUrl());
        lostItem.setTags(request.getTags());
        lostItem.setAiGeneratedTags(request.getAiGeneratedTags());
        lostItem.setCategory(request.getCategory());
        lostItem.setLocationFound(request.getLocationFound());
        lostItem.setContactEmail(request.getContactEmail());
        lostItem.setContactPhone(request.getContactPhone());
        lostItem.setStatus(LostItem.LostItemStatus.FOUND);
        lostItem.setClaimed(false);
        
        LostItem savedLostItem = lostItemRepository.save(lostItem);
        return mapToResponse(savedLostItem);
    }

    @Transactional
    public LostItemResponse updateLostItem(Long id, UpdateLostItemRequest request, Long userId) {
        LostItem lostItem = lostItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lost item not found with id: " + id));
        
        // Only allow update by the user who found the item or admin
        if (lostItem.getFoundBy() != null && !Objects.equals(lostItem.getFoundBy().getId(), userId)) {
            throw new RuntimeException("You are not authorized to update this lost item");
        }
        
        if (request.getTitle() != null) {
            lostItem.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            lostItem.setDescription(request.getDescription());
        }
        if (request.getImageUrl() != null) {
            lostItem.setImageUrl(request.getImageUrl());
        }
        if (request.getThumbnailUrl() != null) {
            lostItem.setThumbnailUrl(request.getThumbnailUrl());
        }
        if (request.getTags() != null) {
            lostItem.setTags(request.getTags());
        }
        if (request.getAiGeneratedTags() != null) {
            lostItem.setAiGeneratedTags(request.getAiGeneratedTags());
        }
        if (request.getCategory() != null) {
            lostItem.setCategory(request.getCategory());
        }
        if (request.getLocationFound() != null) {
            lostItem.setLocationFound(request.getLocationFound());
        }
        if (request.getContactEmail() != null) {
            lostItem.setContactEmail(request.getContactEmail());
        }
        if (request.getContactPhone() != null) {
            lostItem.setContactPhone(request.getContactPhone());
        }
        if (request.getStatus() != null) {
            try {
                LostItem.LostItemStatus status = LostItem.LostItemStatus.valueOf(request.getStatus());
                lostItem.setStatus(status);
                
                if (status == LostItem.LostItemStatus.CLAIMED) {
                    lostItem.setClaimed(true);
                    lostItem.setClaimedAt(LocalDateTime.now());
                }
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid status value: " + request.getStatus());
            }
        }
        
        LostItem updatedLostItem = lostItemRepository.save(lostItem);
        return mapToResponse(updatedLostItem);
    }

    @Transactional
    public void markAsClaimed(Long id, Long claimedById) {
        LostItem lostItem = lostItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lost item not found with id: " + id));
        
        lostItem.setClaimed(true);
        lostItem.setClaimedById(claimedById);
        lostItem.setClaimedAt(LocalDateTime.now());
        lostItem.setStatus(LostItem.LostItemStatus.CLAIMED);
        
        lostItemRepository.save(lostItem);
    }

    @Transactional
    public void deleteLostItem(Long id, Long userId) {
        LostItem lostItem = lostItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lost item not found with id: " + id));
        
        // Only allow deletion by the user who found the item or admin
        if (lostItem.getFoundBy() != null && !Objects.equals(lostItem.getFoundBy().getId(), userId)) {
            throw new RuntimeException("You are not authorized to delete this lost item");
        }
        
        lostItemRepository.delete(lostItem);
    }

    public LostItemResponse getLostItemById(Long id) {
        LostItem lostItem = lostItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lost item not found with id: " + id));
        
        return mapToResponse(lostItem);
    }

    public long getLostItemCountByEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));
        
        return lostItemRepository.countByEvent(event);
    }

    public long getUnclaimedLostItemCountByEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));
        
        return lostItemRepository.countByEventAndIsClaimedFalse(event);
    }

    // Helper method to map LostItem to LostItemResponse
    private LostItemResponse mapToResponse(LostItem lostItem) {
        LostItemResponse response = new LostItemResponse();
        response.setId(lostItem.getId());
        
        if (lostItem.getEvent() != null) {
            response.setEventId(lostItem.getEvent().getId());
            response.setEventTitle(lostItem.getEvent().getTitle());
        }
        
        if (lostItem.getFoundBy() != null) {
            response.setFoundById(lostItem.getFoundBy().getId());
            response.setFoundByName((lostItem.getFoundBy().getFirstName() + " " + lostItem.getFoundBy().getLastName()).trim());
            response.setFoundByEmail(lostItem.getFoundBy().getEmail());
        }

        response.setTitle(lostItem.getTitle());
        response.setDescription(lostItem.getDescription());
        response.setImageUrl(lostItem.getImageUrl());
        response.setThumbnailUrl(lostItem.getThumbnailUrl());
        response.setTags(lostItem.getTags());
        response.setAiGeneratedTags(lostItem.getAiGeneratedTags());
        response.setCategory(lostItem.getCategory());
        response.setLocationFound(lostItem.getLocationFound());
        response.setContactEmail(lostItem.getContactEmail());
        response.setContactPhone(lostItem.getContactPhone());

        if (lostItem.getStatus() != null) {
            response.setStatus(lostItem.getStatus().name());
        }

        response.setClaimed(lostItem.isClaimed());
        response.setClaimedById(lostItem.getClaimedById());

        if (lostItem.getClaimedById() != null) {
            try {
                User claimedBy = userRepository.findById(lostItem.getClaimedById()).orElse(null);
                if (claimedBy != null) {
                    response.setClaimedByName((claimedBy.getFirstName() + " " + claimedBy.getLastName()).trim());
                }
            } catch (Exception e) {
                // Ignore if user not found
            }
        }
        
        response.setClaimedAt(lostItem.getClaimedAt());
        response.setCreatedAt(lostItem.getCreatedAt());
        response.setUpdatedAt(lostItem.getUpdatedAt());
        
        return response;
    }

    private List<LostItemResponse> mapToResponseList(List<LostItem> lostItems) {
        return lostItems.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}