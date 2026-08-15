package com.sandeep.eventrabackend.scheduler;

import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.UUID;

@Component
public class GdprAnonymizationJob {

    private final UserRepository userRepository;

    public GdprAnonymizationJob(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Scheduled(cron = "0 0 2 * * *") // Runs every day at 2:00 AM
    public void runAnonymization() {
        System.out.println("Executing daily GDPR-compliant user profile anonymization task...");

        // Honor pending deletion/anonymization requests instead of being a no-op.
        List<User> pendingDeletion = userRepository.findByDeletionRequestedTrueAndAnonymizedFalse();
        for (User user : pendingDeletion) {
            anonymizeUser(user);
        }

        if (!pendingDeletion.isEmpty()) {
            userRepository.saveAll(pendingDeletion);
            System.out.println("Anonymized " + pendingDeletion.size()
                    + " user profile(s) per GDPR deletion request.");
        }
    }

    private void anonymizeUser(User user) {
        String anonToken = anonymizeString(user.getEmail());
        user.setFirstName(anonToken);
        user.setLastName(anonToken);
        // Scope the anonymous value to the user id to keep unique columns (email/username) valid.
        user.setEmail("anon_" + user.getId() + "@deleted.invalid");
        user.setUsername("anon_" + user.getId());
        user.setProfileHeadline(null);
        user.setLinkedinUrl(null);
        user.setGithubUrl(null);
        user.setAnonymized(true);
    }

    public String anonymizeString(String input) {
        if (input == null) return null;
        return "anon_" + UUID.randomUUID().toString().substring(0, 8);
    }
}
