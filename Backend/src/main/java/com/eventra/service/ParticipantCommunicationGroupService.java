package com.eventra.service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@Service
public class ParticipantCommunicationGroupService {

    private static final Logger logger = Logger.getLogger(ParticipantCommunicationGroupService.class.getName());

    public List<String> filterTargetRecipients(String eventId, Map<String, String> criteria) {
        if (eventId == null || eventId.isBlank()) {
            throw new IllegalArgumentException("Event ID must not be null or empty.");
        }
        if (criteria == null) {
            throw new IllegalArgumentException("Criteria map must not be null.");
        }
        String team = criteria.get("team");
        String registrationStatus = criteria.get("registrationStatus");
        String attendanceStatus = criteria.get("attendanceStatus");
        String submissionStatus = criteria.get("submissionStatus");
        String session = criteria.get("session");

        logger.info(String.format("Filtering recipients for event %s with criteria: team=%s, regStatus=%s, submissionStatus=%s",
                eventId, team, registrationStatus, submissionStatus));

        // Query participant repository matching criteria
        return List.of("participant1@example.com", "participant2@example.com");
    }

    public void sendTargetedAnnouncement(String eventId, Map<String, String> criteria, String messageTitle, String messageBody) {
        List<String> recipients = filterTargetRecipients(eventId, criteria);
        logger.info("Sending targeted announcement to " + recipients.size() + " filtered participants.");
        // Dispatch notification / email pipeline
    }
}
