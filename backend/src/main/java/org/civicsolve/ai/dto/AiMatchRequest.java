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
public class AiMatchRequest {

    private String domain;
    private Double lat;
    private Double lon;

    @JsonProperty("challenge_description")
    private String challengeDescription;

    private List<InstitutionPayload> institutions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InstitutionPayload {
        private Object id;
        private String name;
        private String type;
        private String district;
        private Double lat;
        private Double lon;
        private List<CapabilityPayload> capabilities;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CapabilityPayload {
        private Object id;
        private String domain;
        private String expertise;
        private Integer capacity;
    }
}
