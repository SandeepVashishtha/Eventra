package com.eventra.service;

import com.eventra.model.PushSubscription;
import com.eventra.repository.PushSubscriptionRepository;
import nl.martijndwarf.webpush.Notification;
import nl.martijndwarf.webpush.PushService;
import org.jose4j.lang.JoseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class PushNotificationService {

    private static final Logger logger = Logger.getLogger(PushNotificationService.class.getName());

    @Autowired
    private PushSubscriptionRepository subscriptionRepository;

    @Autowired(required = false)
    private PushService pushService;

    @Transactional
    public void sendPushNotification(String userId, String payload) {
        List<PushSubscription> subscriptions = subscriptionRepository.findByUserId(userId);

        for (PushSubscription sub : subscriptions) {
            try {
                if (pushService == null) {
                    logger.warning("PushService bean not configured; skipping push dispatch.");
                    return;
                }

                Notification notification = new Notification(
                        sub.getEndpoint(),
                        sub.getP256dh(),
                        sub.getAuth(),
                        payload
                );

                var response = pushService.send(notification);
                int statusCode = response.getStatusLine().getStatusCode();

                if (statusCode == 410 || statusCode == 404) {
                    logger.warning("Push subscription endpoint expired or invalid (" + statusCode + "). Purging endpoint: " + sub.getEndpoint());
                    subscriptionRepository.deleteByEndpoint(sub.getEndpoint());
                }

            } catch (ExecutionException e) {
                Throwable cause = e.getCause();
                String message = (cause != null) ? cause.getMessage() : e.getMessage();
                
                if (message != null && (message.contains("410") || message.contains("404") || message.contains("Gone"))) {
                    logger.warning("Caught WebPush exception indicating stale subscription. Purging endpoint: " + sub.getEndpoint());
                    subscriptionRepository.deleteByEndpoint(sub.getEndpoint());
                } else {
                    logger.log(Level.SEVERE, "Failed to send push notification to endpoint: " + sub.getEndpoint(), e);
                }
            } catch (IOException | GeneralSecurityException | JoseException e) {
                logger.log(Level.SEVERE, "Security or I/O error during push dispatch to endpoint: " + sub.getEndpoint(), e);
            }
        }
    }
}
