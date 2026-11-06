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
public class AiDuplicateResponse {

    private List<AiDuplicateMatch> matches;

    @JsonProperty("total_matches")
    private Integer totalMatches;

    @JsonProperty("threshold_used")
    private Double thresholdUsed;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiDuplicateMatch {
        private Object id;
        private String title;
        private Double similarity;

        @JsonProperty("similarity_percentage")
        private Double similarityPercentage;

        @JsonProperty("distance_km")
        private Double distanceKm;

        @JsonProperty("is_duplicate")
        private Boolean isDuplicate;
    }
}
