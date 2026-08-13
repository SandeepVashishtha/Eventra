package com.sandeep.eventrabackend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Contact Us form submission payload")
public class ContactRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Schema(description = "Sender's full name", example = "Jane Doe")
    private String name;

    @NotBlank(message = "Email address is required")
    @Email(message = "Please provide a valid email address")
    @Size(max = 254, message = "Email must not exceed 254 characters")
    @Schema(description = "Sender's email address", example = "jane@example.com")
    private String email;

    @NotBlank(message = "Subject is required")
    @Size(min = 2, max = 150, message = "Subject must be between 2 and 150 characters")
    @Schema(description = "Subject of the message", example = "Question about registration")
    private String subject;

    @NotBlank(message = "Message is required")
    @Size(min = 10, max = 2000, message = "Message must be between 10 and 2000 characters")
    @Schema(description = "Body of the message", example = "I have a question about...")
    private String message;
}
