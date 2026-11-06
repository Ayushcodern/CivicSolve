package org.civicsolve.moderation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MergeRequest {

    @NotNull(message = "Parent challenge ID is required")
    private Long parentChallengeId;

    @NotBlank(message = "Reason is mandatory for moderator audit trail")
    private String reason;
}
