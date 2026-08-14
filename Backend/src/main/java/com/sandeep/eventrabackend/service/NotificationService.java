package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.response.NotificationResponse;
import com.sandeep.eventrabackend.exception.NotificationNotFoundException;
import com.sandeep.eventrabackend.model.Notification;
import com.sandeep.eventrabackend.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final int MAX_BUFFER_CAPACITY = 5000;
    private final Queue<Notification> notificationBuffer = new ConcurrentLinkedQueue<>();
    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /**
     * Enqueues an outgoing notification into the bounded in-memory buffer.
     * Evicts the oldest notification when maximum capacity is reached to prevent
     * unbounded heap growth and OutOfMemoryError crashes.
     */
    public void enqueue(Notification notification) {
        if (notification == null) return;

        while (notificationBuffer.size() >= MAX_BUFFER_CAPACITY) {
            notificationBuffer.poll(); // Evict oldest entry (FIFO)
        }
        notificationBuffer.offer(notification);
    }

    public List<Notification> getBufferedNotifications() {
        return new ArrayList<>(notificationBuffer);
    }

    public void clearBuffer() {
        notificationBuffer.clear();
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsForUser(String email) {
        if (email == null || email.isBlank()) {
            return List.of();
        }
        List<Notification> notifications = notificationRepository.findByUserEmailOrderByCreatedAtDesc(email);
        return notifications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public NotificationResponse markAsRead(Long id, String email) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Notification ID must be positive");
        }
        Notification notification = notificationRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new NotificationNotFoundException("Notification not found with id: " + id));

        notification.setRead(true);
        Notification updatedNotification = notificationRepository.save(notification);
        return mapToResponse(updatedNotification);
    }

    @Transactional
    public List<NotificationResponse> markAllAsRead(String email) {
        notificationRepository.markAllAsReadByUserEmail(email);
        return getNotificationsForUser(email);
    }

    @Transactional
    public void deleteNotification(Long id, String email) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Notification ID must be positive");
        }
        Notification notification = notificationRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new NotificationNotFoundException("Notification not found with id: " + id));
        notificationRepository.delete(notification);
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
