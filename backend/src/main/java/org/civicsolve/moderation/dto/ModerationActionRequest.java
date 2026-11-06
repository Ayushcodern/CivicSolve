package org.civicsolve.moderation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModerationActionRequest {

    @NotBlank(message = "Reason is mandatory for moderator audit trail")
    private String reason;
}
