package com.sandeep.eventrabackend.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response payload containing notification details")
public class NotificationResponse {

    @Schema(description = "Unique ID of the notification", example = "1")
    private Long id;

    @Schema(description = "Notification title", example = "Welcome to Eventra")
    private String title;

    @Schema(description = "Notification message content", example = "Thank you for joining our platform!")
    private String message;

    @Schema(description = "Whether the notification has been read", example = "false")
    private boolean read;

    @Schema(description = "Timestamp when the notification was created")
    private LocalDateTime createdAt;
}
