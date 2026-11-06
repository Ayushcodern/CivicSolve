package org.civicsolve.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiPriorityResponse {

    @JsonProperty("priority_score")
    private Double priorityScore;

    private String tier;

    private String explanation;

    private Map<String, Object> breakdown;
}
