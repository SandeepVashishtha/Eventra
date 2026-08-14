package com.sandeep.eventrabackend.event;

import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.EventRegistration;
import com.sandeep.eventrabackend.model.EventWaitlist;
import com.sandeep.eventrabackend.model.Notification;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.EventWaitlistRepository;
import com.sandeep.eventrabackend.repository.NotificationRepository;
import com.sandeep.eventrabackend.service.StripeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;

@Service
public class CancellationProcessor {

    private static final Logger log = LoggerFactory.getLogger(CancellationProcessor.class);

    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final EventWaitlistRepository eventWaitlistRepository;
    private final NotificationRepository notificationRepository;
    private final StripeService stripeService;
    private final TransactionTemplate transactionTemplate;

    public CancellationProcessor(
            EventRepository eventRepository,
            EventRegistrationRepository eventRegistrationRepository,
            EventWaitlistRepository eventWaitlistRepository,
            NotificationRepository notificationRepository,
            StripeService stripeService,
            PlatformTransactionManager transactionManager) {
        this.eventRepository = eventRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.eventWaitlistRepository = eventWaitlistRepository;
        this.notificationRepository = notificationRepository;
        this.stripeService = stripeService;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void processCancellation(EventCancelledEvent cancelled) {
        Long eventId = cancelled.eventId();
        Event event = transactionTemplate.execute(s -> eventRepository.findById(eventId).orElse(null));
        if (event == null) {
            log.warn("Cancellation side-effects skipped: event {} not found after commit", eventId);
            return;
        }

        String message = event.getTitle() + " has been cancelled. Reason: " + cancelled.reason();
        String refundPolicy = event.getRefundPolicy();
        Integer refundPercent = event.getRefundPercent();
        boolean refundDue = refundPolicy != null && !"NONE".equalsIgnoreCase(refundPolicy);

        List<EventRegistration> confirmed = transactionTemplate.execute(s ->
                eventRegistrationRepository.findByEvent_IdAndStatus(eventId, "CONFIRMED"));

        if (confirmed != null && refundDue) {
            refundConfirmedRegistrations(eventId, confirmed, refundPolicy, refundPercent);
        }

        if (confirmed != null) {
            persistNotificationsAndWaitlist(eventId, message);
        }
    }

    private void refundConfirmedRegistrations(
            Long eventId,
            List<EventRegistration> confirmed,
            String refundPolicy,
            Integer refundPercent) {
        for (EventRegistration registration : confirmed) {
            if (registration.isPaymentCompleted() && registration.getStripePaymentIntentId() != null) {
                try {
                    stripeService.refundPayment(
                            registration.getStripePaymentIntentId(),
                            refundPolicy,
                            refundPercent);
                    transactionTemplate.execute(s -> {
                        EventRegistration current = eventRegistrationRepository
                                .findById(registration.getId())
                                .orElse(null);
                        if (current != null) {
                            current.setPaymentStatus("REFUNDED");
                            eventRegistrationRepository.save(current);
                        }
                        return null;
                    });
                } catch (Exception e) {
                    log.error("Refund FAILED for registration {} on cancelled event {} (policy={}, pct={}): {}",
                            registration.getId(), eventId, refundPolicy, refundPercent, e.getMessage(), e);
                }
            }
        }
    }

    private void persistNotificationsAndWaitlist(Long eventId, String message) {
        transactionTemplate.execute(s -> {
            List<EventRegistration> fresh = eventRegistrationRepository
                    .findByEvent_IdAndStatus(eventId, "CONFIRMED");
            for (EventRegistration registration : fresh) {
                notificationRepository.save(Notification.builder()
                        .user(registration.getUser())
                        .title("Event cancelled")
                        .message(message)
                        .build());
            }
            List<EventWaitlist> waitlist = eventWaitlistRepository
                    .findByEvent_IdAndStatusOrderByPositionAscJoinedAtAsc(eventId,
                            EventWaitlist.STATUS_WAITING);
            for (EventWaitlist entry : waitlist) {
                notificationRepository.save(Notification.builder()
                        .user(entry.getUser())
                        .title("Event cancelled")
                        .message(message)
                        .build());
                entry.setStatus(EventWaitlist.STATUS_EVENT_CANCELLED);
                eventWaitlistRepository.save(entry);
            }
            return null;
        });
    }
}
