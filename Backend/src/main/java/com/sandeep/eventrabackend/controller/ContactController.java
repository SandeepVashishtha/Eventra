package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.dto.request.ContactRequest;
import com.sandeep.eventrabackend.dto.response.ContactResponse;
import com.sandeep.eventrabackend.dto.response.ErrorResponse;
import com.sandeep.eventrabackend.service.ContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
@Tag(name = "Contact", description = "Endpoint for the public Contact Us form")
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    @Operation(
            summary = "Submit a Contact Us message",
            description = "Accepts a name, email, subject and message from the public Contact Us form."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Message submitted successfully",
                    content = @Content(schema = @Schema(implementation = ContactResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validation error",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "429", description = "Too many requests",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ContactResponse> submitContactMessage(
            @Valid @RequestBody(required = false) ContactRequest request) {
        if (request == null) {
            return ResponseEntity.badRequest().build();
        }
        ContactResponse response = contactService.submitContactMessage(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
