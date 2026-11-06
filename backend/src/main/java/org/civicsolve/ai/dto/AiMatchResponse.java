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
public class AiMatchResponse {

    private List<MatchedInstitution> matches;

    @JsonProperty("total_matches")
    private Integer totalMatches;

    @JsonProperty("target_domain")
    private String targetDomain;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatchedInstitution {
        @JsonProperty("institution_id")
        private Object institutionId;
        private String name;
        private String type;
        private String district;
        private Double score;

        @JsonProperty("match_percentage")
        private Double matchPercentage;

        @JsonProperty("distance_km")
        private Double distanceKm;

        @JsonProperty("match_reasons")
        private List<String> matchReasons;
    }
}
