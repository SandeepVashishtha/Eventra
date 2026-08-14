package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.request.ContactRequest;
import com.sandeep.eventrabackend.dto.response.ContactResponse;
import com.sandeep.eventrabackend.model.ContactMessage;
import com.sandeep.eventrabackend.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContactService {

    private static final Logger log = LoggerFactory.getLogger(ContactService.class);

    private final ContactMessageRepository contactMessageRepository;

    @Transactional
    public ContactResponse submitContactMessage(ContactRequest request) {
        if (request.getName() == null || request.getName().trim().length() < 2 || request.getName().trim().length() > 100) {
            throw new IllegalArgumentException("Name must be between 2 and 100 characters.");
        if (request.getEmail() == null || !request.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) { throw new IllegalArgumentException("Invalid email format."); }
        }
        ContactMessage contactMessage = new ContactMessage();
        contactMessage.setName(request.getName().trim());
        contactMessage.setEmail(request.getEmail() != null ? request.getEmail().trim() : "");
        contactMessage.setSubject(request.getSubject() != null ? request.getSubject().trim() : "");
        contactMessage.setMessage(request.getMessage() != null ? request.getMessage().trim() : "");

        ContactMessage saved = contactMessageRepository.save(contactMessage);

        log.info("Contact message received from {} (id={})", saved.getEmail(), saved.getId());

        return ContactResponse.builder()
                .id(saved.getId())
                .message("Thank you for reaching out. We will get back to you soon.")
                .submittedAt(saved.getSubmittedAt())
                .build();
    }
}
