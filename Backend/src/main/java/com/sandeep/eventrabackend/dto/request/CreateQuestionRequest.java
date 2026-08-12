package com.sandeep.eventrabackend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to submit a live-audience Q&A question")
public class CreateQuestionRequest {

    @NotBlank(message = "Question text is required")
    @Size(max = 500, message = "Question text must not exceed 500 characters")
    @Schema(description = "Question text", example = "Will there be a networking session?")
    private String text;
}
