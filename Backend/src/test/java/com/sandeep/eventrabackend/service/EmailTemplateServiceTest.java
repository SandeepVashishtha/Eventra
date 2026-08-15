package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.request.TestEmailRequest;
import com.sandeep.eventrabackend.dto.request.SaveTemplateRequest;
import com.sandeep.eventrabackend.dto.response.TestEmailResponse;
import com.sandeep.eventrabackend.dto.response.TemplateResponse;
import com.sandeep.eventrabackend.model.EmailTemplate;
import com.sandeep.eventrabackend.repository.EmailTemplateRepository;
import com.sandeep.eventrabackend.util.EmailSender;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Test class for EmailTemplateService
 * Tests the functionality for sending test emails and managing custom templates.
 * Feature: #12139 - "Send Test Email" button for custom notifications
 */
@ExtendWith(MockitoExtension.class)
class EmailTemplateServiceTest {

    @Mock
    private EmailTemplateRepository emailTemplateRepository;

    @Mock
    private EmailSender emailSender;

    @InjectMocks
    private EmailTemplateService emailTemplateService;

    private TestEmailRequest testEmailRequest;
    private SaveTemplateRequest saveTemplateRequest;
    private String organizerEmail = "organizer@test.com";

    @BeforeEach
    void setUp() {
        // Setup test data
        Map<String, Object> event = new HashMap<>();
        event.put("id", "123");
        event.put("title", "Test Event");
        event.put("eventDate", "2026-12-25");
        event.put("eventTime", "10:00 AM");
        event.put("location", "Conference Center");
        event.put("organizerEmail", "organizer@test.com");
        event.put("refundDeadline", "2027-01-10");

        Map<String, Object> attendee = new HashMap<>();
        attendee.put("firstName", "John");
        attendee.put("lastName", "Doe");
        attendee.put("email", "john.doe@test.com");

        testEmailRequest = new TestEmailRequest(
                "123",
                "cancellation",
                event,
                attendee,
                "Dear {attendeeName}, the event {eventTitle} has been cancelled.",
                organizerEmail
        );

        saveTemplateRequest = new SaveTemplateRequest(
                "123",
                "cancellation",
                "Custom template content"
        );
    }

    @Test
    @DisplayName("Send test email successfully")
    void sendTestEmail_Success() {
        // Mock email sender to return a message ID
        when(emailSender.sendEmail(any(), any(), any(), anyBoolean()))
                .thenReturn("test-msg-12345");

        TestEmailResponse response = emailTemplateService.sendTestEmail(
                testEmailRequest, organizerEmail);

        assertTrue(response.isSuccess());
        assertEquals("test-msg-12345", response.getMessageId());
        assertEquals(organizerEmail, response.getRecipient());
        assertEquals("cancellation", response.getTemplateType());
        assertEquals("123", response.getEventId());
        assertNotNull(response.getTimestamp());
    }

    @Test
    @DisplayName("Send test email with template rendering")
    void sendTestEmail_TemplateRendering() {
        // Create a request with placeholders
        Map<String, Object> event = new HashMap<>();
        event.put("title", "Test Event");
        event.put("organizerEmail", "organizer@test.com");

        Map<String, Object> attendee = new HashMap<>();
        attendee.put("firstName", "Jane");
        attendee.put("lastName", "Smith");

        TestEmailRequest request = new TestEmailRequest(
                "456",
                "cancellation",
                event,
                attendee,
                "Hello {attendeeName}, the event {eventTitle} is cancelled. Contact {organizerEmail}",
                organizerEmail
        );

        when(emailSender.sendEmail(any(), any(), any(), anyBoolean()))
                .thenAnswer(invocation -> {
                    String subject = invocation.getArgument(1);
                    String body = invocation.getArgument(2);
                    
                    // Verify that placeholders are replaced
                    assertTrue(body.contains("Jane Smith"));
                    assertTrue(body.contains("Test Event"));
                    assertTrue(body.contains("organizer@test.com"));
                    
                    return "test-msg-67890";
                });

        TestEmailResponse response = emailTemplateService.sendTestEmail(request, organizerEmail);

        assertTrue(response.isSuccess());
        assertEquals("test-msg-67890", response.getMessageId());
    }

    @Test
    @DisplayName("Send test email failure")
    void sendTestEmail_Failure() {
        // Mock email sender to throw an exception
        when(emailSender.sendEmail(any(), any(), any(), anyBoolean()))
                .thenThrow(new RuntimeException("Email service unavailable"));

        TestEmailResponse response = emailTemplateService.sendTestEmail(
                testEmailRequest, organizerEmail);

        assertFalse(response.isSuccess());
        assertNull(response.getMessageId());
        assertEquals(organizerEmail, response.getRecipient());
        assertTrue(response.getMessage().contains("Failed to send test email"));
    }

    @Test
    @DisplayName("Test email recipient is pinned to the authenticated organizer (#16253)")
    void sendTestEmail_IgnoresCallerSuppliedRecipient() {
        when(emailSender.sendEmail(any(), any(), any(), anyBoolean()))
                .thenAnswer(invocation -> {
                    String to = invocation.getArgument(0);
                    assertEquals(organizerEmail, to, "recipient must be the organizer's own email");
                    return "msg-16253";
                });

        // Caller supplies a victim address; it must be ignored.
        TestEmailRequest request = new TestEmailRequest(
                "123",
                "cancellation",
                testEmailRequest.getEvent(),
                testEmailRequest.getAttendee(),
                "Dear {attendeeName}",
                "victim@evil.example"
        );

        TestEmailResponse response = emailTemplateService.sendTestEmail(request, organizerEmail);

        assertTrue(response.isSuccess());
        assertEquals(organizerEmail, response.getRecipient());
    }

    @Test
    @DisplayName("Save new template successfully")
    void saveTemplate_NewTemplate() {
        // Mock repository to return null (no existing template)
        when(emailTemplateRepository.findByEventIdAndTemplateTypeAndOrganizerEmail(
                any(), any(), any()))
                .thenReturn(Optional.empty());

        // Mock repository save
        when(emailTemplateRepository.save(any(EmailTemplate.class)))
                .thenAnswer(invocation -> {
                    EmailTemplate template = invocation.getArgument(0);
                    template.setId(1L);
                    return template;
                });

        TemplateResponse response = emailTemplateService.saveTemplate(
                saveTemplateRequest, organizerEmail);

        assertTrue(response.isSuccess());
        assertEquals("123", response.getEventId());
        assertEquals("cancellation", response.getTemplateType());
        assertEquals("Custom template content", response.getTemplate());
        assertTrue(response.getMessage().contains("Template saved successfully"));
    }

    @Test
    @DisplayName("Update existing template")
    void saveTemplate_UpdateExisting() {
        // Create existing template
        EmailTemplate existingTemplate = new EmailTemplate(
                "123", organizerEmail, "cancellation", "Old template content");
        existingTemplate.setId(1L);

        // Mock repository to return existing template
        when(emailTemplateRepository.findByEventIdAndTemplateTypeAndOrganizerEmail(
                eq("123"), eq("cancellation"), eq(organizerEmail)))
                .thenReturn(Optional.of(existingTemplate));

        // Mock repository save
        when(emailTemplateRepository.save(any(EmailTemplate.class)))
                .thenReturn(existingTemplate);

        TemplateResponse response = emailTemplateService.saveTemplate(
                saveTemplateRequest, organizerEmail);

        assertTrue(response.isSuccess());
        assertEquals("123", response.getEventId());
        assertEquals("cancellation", response.getTemplateType());
        assertEquals("Custom template content", response.getTemplate());
    }

    @Test
    @DisplayName("Save template failure")
    void saveTemplate_Failure() {
        // Mock repository to throw an exception
        when(emailTemplateRepository.findByEventIdAndTemplateTypeAndOrganizerEmail(
                any(), any(), any()))
                .thenThrow(new RuntimeException("Database error"));

        TemplateResponse response = emailTemplateService.saveTemplate(
                saveTemplateRequest, organizerEmail);

        assertFalse(response.isSuccess());
        assertTrue(response.getMessage().contains("Failed to save template"));
    }

    @Test
    @DisplayName("Get existing template")
    void getTemplate_Existing() {
        // Create existing template
        EmailTemplate existingTemplate = new EmailTemplate(
                "123", organizerEmail, "cancellation", "Saved template content");

        // Mock repository to return existing template
        when(emailTemplateRepository.findByEventIdAndTemplateTypeAndOrganizerEmail(
                eq("123"), eq("cancellation"), eq(organizerEmail)))
                .thenReturn(Optional.of(existingTemplate));

        TemplateResponse response = emailTemplateService.getTemplate(
                "123", "cancellation", organizerEmail);

        assertTrue(response.isSuccess());
        assertEquals("123", response.getEventId());
        assertEquals("cancellation", response.getTemplateType());
        assertEquals("Saved template content", response.getTemplate());
    }

    @Test
    @DisplayName("Get non-existing template")
    void getTemplate_NotFound() {
        // Mock repository to return empty
        when(emailTemplateRepository.findByEventIdAndTemplateTypeAndOrganizerEmail(
                any(), any(), any()))
                .thenReturn(Optional.empty());

        TemplateResponse response = emailTemplateService.getTemplate(
                "999", "cancellation", organizerEmail);

        assertFalse(response.isSuccess());
        assertEquals("999", response.getEventId());
        assertEquals("cancellation", response.getTemplateType());
        assertNull(response.getTemplate());
        assertTrue(response.getMessage().contains("Template not found"));
    }

    @Test
    @DisplayName("renderTemplate HTML-escapes user data and neutralizes javascript: URLs (Closes #16236)")
    void sendTestEmail_HtmlEscaping() {
        Map<String, Object> event = new HashMap<>();
        event.put("title", "<script>alert(1)</script>");
        event.put("location", "<img src=x onerror=alert(1)>");
        event.put("organizerEmail", "javascript:alert(1)");

        Map<String, Object> attendee = new HashMap<>();
        attendee.put("firstName", "<b>x</b>");
        attendee.put("lastName", "\"><script>evil()</script>");

        TestEmailRequest request = new TestEmailRequest(
                "789",
                "cancellation",
                event,
                attendee,
                "Event {eventTitle} at {location} by {attendeeName} contact {organizerEmail}",
                organizerEmail
        );

        when(emailSender.sendEmail(any(), any(), any(), anyBoolean()))
                .thenAnswer(invocation -> {
                    String body = invocation.getArgument(2);
                    assertFalse(body.contains("<script>"), "raw <script> must be escaped");
                    assertFalse(body.contains("onerror="), "raw HTML attributes must be escaped");
                    assertFalse(body.contains("javascript:alert(1)"), "javascript: URL must be neutralized");
                    assertTrue(body.contains("&lt;script&gt;"), "script payload must be escaped to entities");
                    assertTrue(body.contains("#"), "unsafe URL should fall back to safe value");
                    return "msg-xss";
                });

        TestEmailResponse response = emailTemplateService.sendTestEmail(request, organizerEmail);
        assertTrue(response.isSuccess());
    }

    @Test
    @DisplayName("Get default template for cancellation")
    void getDefaultTemplate_Cancellation() {
        String template = emailTemplateService.getDefaultTemplate("cancellation");
        
        assertNotNull(template);
        assertTrue(template.contains("Dear {attendeeName}"));
        assertTrue(template.contains("Event Cancelled"));
        assertTrue(template.contains("{eventTitle}"));
        assertTrue(template.contains("{refundDeadline}"));
    }

    @Test
    @DisplayName("Get default template for waitlist promotion")
    void getDefaultTemplate_WaitlistPromotion() {
        String template = emailTemplateService.getDefaultTemplate("waitlist_promotion");
        
        assertNotNull(template);
        assertTrue(template.contains("Dear {attendeeName}"));
        assertTrue(template.contains("promoted from the waitlist"));
        assertTrue(template.contains("{eventTitle}"));
    }
}
