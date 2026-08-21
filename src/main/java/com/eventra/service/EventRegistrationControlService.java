package com.eventra.service;

import com.eventra.dto.EventRegistrationStatusDTO;
import com.eventra.model.Event;
import com.eventra.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.logging.Logger;

@Service
public class EventRegistrationControlService {

    private static final Logger logger = Logger.getLogger(EventRegistrationControlService.class.getName());

    @Autowired
    private EventRepository eventRepository;

    @Transactional
    public Event togglePauseRegistration(Long eventId, boolean pause, String reason, LocalDateTime resumeDate) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with ID: " + eventId));

        event.setRegistrationPaused(pause);
        event.setPauseReason(pause ? reason : null);
        event.setResumeDate(pause ? resumeDate : null);

        Event updated = eventRepository.save(event);
        logger.info("Event ID " + eventId + " registration pause status updated to: " + pause);
        return updated;
    }

    @Transactional(readOnly = true)
    public EventRegistrationStatusDTO getRegistrationStatus(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with ID: " + eventId));

        return new EventRegistrationStatusDTO(
                event.getId(),
                event.isRegistrationPaused(),
                event.getPauseReason(),
                event.getResumeDate()
        );
    }
}
