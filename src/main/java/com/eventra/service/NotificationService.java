package com.eventra.service;

import com.eventra.model.Notification;
import com.eventra.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

@Service
public class NotificationService {

    private static final Logger logger = Logger.getLogger(NotificationService.class.getName());
    private static final int BATCH_SIZE = 500;

    @Autowired
    private NotificationRepository notificationRepository;

    /**
     * Asynchronously dispatches in-app notifications in batch chunks to attendee user IDs
     * when an organizer publishes an event status update.
     */
    @Async
    @Transactional
    public void dispatchBulkEventNotifications(Long eventId, List<String> userIds, String title, String message) {
        if (userIds == null || userIds.isEmpty()) {
            logger.info("No recipients provided for bulk notification event ID: " + eventId);
            return;
        }

        logger.info("Starting asynchronous bulk notification dispatch for event ID: " + eventId + " to " + userIds.size() + " recipients.");

        List<Notification> batch = new ArrayList<>();
        for (int i = 0; i < userIds.size(); i++) {
            batch.add(new Notification(userIds.get(i), title, message, eventId));

            if (batch.size() >= BATCH_SIZE || i == userIds.size() - 1) {
                notificationRepository.saveAll(batch);
                logger.info("Persisted notification batch of size " + batch.size() + " for event ID: " + eventId);
                batch.clear();
            }
        }

        logger.info("Completed bulk notification queuing for event ID: " + eventId);
    }
}
