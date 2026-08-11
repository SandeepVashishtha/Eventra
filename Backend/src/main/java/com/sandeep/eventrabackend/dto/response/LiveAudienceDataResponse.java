package com.sandeep.eventrabackend.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@Schema(description = "Initial snapshot of the live audience board for an event")
public class LiveAudienceDataResponse {

    @Schema(description = "All Q&A questions for the event")
    private List<LiveAudienceQuestionResponse> questions;

    @Schema(description = "Most recently created poll for the event (may be null)")
    private LiveAudiencePollResponse activePoll;
}
