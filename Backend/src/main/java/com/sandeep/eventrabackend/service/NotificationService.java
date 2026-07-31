package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.response.NotificationResponse;
import com.sandeep.eventrabackend.exception.NotificationNotFoundException;
import com.sandeep.eventrabackend.model.Notification;
import com.sandeep.eventrabackend.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<NotificationResponse> getNotificationsForUser(String email) {
        List<Notification> notifications = notificationRepository.findByUserEmailOrderByCreatedAtDesc(email);
        return notifications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public NotificationResponse markAsRead(Long id, String email) {
        Notification notification = notificationRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new NotificationNotFoundException("Notification not found with id: " + id));

        notification.setRead(true);
        Notification updatedNotification = notificationRepository.save(notification);
        return mapToResponse(updatedNotification);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
