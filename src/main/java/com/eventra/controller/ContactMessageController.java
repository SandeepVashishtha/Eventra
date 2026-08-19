package com.eventra.controller;

import com.eventra.dto.ContactMessageDTO;
import com.eventra.service.ContactMessageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
public class ContactMessageController {

    @Autowired
    private ContactMessageService contactMessageService;

    @PostMapping
    public ResponseEntity<String> submitContactMessage(@RequestBody ContactMessageDTO dto, HttpServletRequest request) {
        String clientIp = extractClientIp(request);
        contactMessageService.processContactMessage(dto, clientIp);
        return ResponseEntity.ok("Message submitted successfully.");
    }

    private String extractClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
