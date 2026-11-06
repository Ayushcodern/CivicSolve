package org.civicsolve.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiDuplicateRequest {

    @JsonProperty("new_challenge")
    private AiChallengeItem newChallenge;

    private List<AiChallengeItem> candidates;

    private Double threshold;
}
