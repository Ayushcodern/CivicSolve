package org.civicsolve.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiChallengeItem {
    private Object id;
    private String title;
    private String description;
    private Double lat;
    private Double lon;
}
