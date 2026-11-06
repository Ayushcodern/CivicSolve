package org.civicsolve.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiPriorityRequest {

    private Double severity;

    private Integer population;

    @JsonProperty("recurrence_count")
    private Integer recurrenceCount;

    @JsonProperty("health_hazard")
    private Boolean healthHazard;

    private String text;
}
