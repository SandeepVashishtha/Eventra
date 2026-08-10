package com.sandeep.eventrabackend.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Paginated registrant page for {@code GET /api/events/{id}/registrants}.
 *
 * <p>Shape matches the contract consumed by {@code EventDetails.js}, which reads
 * {@code response.data.data} and {@code response.data.totalPages}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Paginated event registrants for organizer/admin export")
public class RegistrantsPageResponse {

    @Schema(description = "Registrant rows for the requested page")
    private List<EventRegistrantResponse> data;

    @Schema(description = "Total number of pages (1-based page numbering)", example = "3")
    private int totalPages;
}
