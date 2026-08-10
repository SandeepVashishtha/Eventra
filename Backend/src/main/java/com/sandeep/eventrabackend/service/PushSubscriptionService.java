package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.request.PushSubscriptionRequest;
import com.sandeep.eventrabackend.model.PushSubscription;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.PushSubscriptionRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class PushSubscriptionService {

    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final UserRepository userRepository;

    @Transactional
    public void subscribe(String userEmail, PushSubscriptionRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Map<String, String> keys = request.getKeys();
        String p256dh = keys != null ? keys.get("p256dh") : null;
        String auth = keys != null ? keys.get("auth") : null;
        if (p256dh == null || p256dh.isBlank() || auth == null || auth.isBlank()) {
            throw new IllegalArgumentException("Push subscription keys.p256dh and keys.auth are required");
        }

        PushSubscription subscription = pushSubscriptionRepository
                .findByUser_IdAndEndpoint(user.getId(), request.getEndpoint())
                .orElseGet(PushSubscription::new);

        subscription.setUser(user);
        subscription.setEndpoint(request.getEndpoint());
        subscription.setP256dh(p256dh);
        subscription.setAuth(auth);
        pushSubscriptionRepository.save(subscription);
    }

    @Transactional
    public void unsubscribe(String userEmail, String endpoint) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        if (endpoint != null && !endpoint.isBlank()) {
            pushSubscriptionRepository.deleteByUser_IdAndEndpoint(user.getId(), endpoint);
            return;
        }
        pushSubscriptionRepository.deleteByUser_Id(user.getId());
    }
}
