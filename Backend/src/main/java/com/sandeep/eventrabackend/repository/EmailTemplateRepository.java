package com.sandeep.eventrabackend.repository;

import com.sandeep.eventrabackend.model.EmailTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repository for managing custom email templates.
 * Feature: #12139 - "Send Test Email" button for custom notifications
 */
@Repository
public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, Long> {

    /**
     * Find a template by event ID, template type, and organizer email
     */
    Optional<EmailTemplate> findByEventIdAndTemplateTypeAndOrganizerEmail(
            String eventId, String templateType, String organizerEmail);

    /**
     * Find all templates for a specific event and organizer
     */
    List<EmailTemplate> findByEventIdAndOrganizerEmail(String eventId, String organizerEmail);

    /**
     * Find all templates by organizer email
     */
    List<EmailTemplate> findByOrganizerEmail(String organizerEmail);

    /**
     * Find all templates by template type
     */
    List<EmailTemplate> findByTemplateType(String templateType);

    void deleteByEventId(String eventId);

    /**
     * Delete templates by event ID and organizer email
     */
    void deleteByEventIdAndOrganizerEmail(String eventId, String organizerEmail);

    /**
     * Delete a specific template by event ID, template type, and organizer email
     */
    void deleteByEventIdAndTemplateTypeAndOrganizerEmail(
            String eventId, String templateType, String organizerEmail);
}
