package com.sandeep.eventrabackend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Standard API error response")
public class ErrorResponse {

    @Schema(description = "HTTP status code")
    private int status;

    @Schema(description = "Short error type", example = "Bad Request")
    private String error;

    @Schema(description = "Detailed error message")
    private String message;

    @Schema(description = "Request path that triggered the error")
    private String path;

    @Schema(description = "Timestamp when the error occurred")
    private LocalDateTime timestamp;
}
