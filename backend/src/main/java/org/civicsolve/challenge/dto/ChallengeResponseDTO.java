package org.civicsolve.challenge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.civicsolve.challenge.Challenge;
import org.civicsolve.challenge.ChallengeStatus;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * CivicSolve — Challenge Response Data Transfer Object
 * Serializes challenge data with latitude and longitude for client consumers.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeResponseDTO {

    private Long challengeId;
    private Long userId;
    private String title;
    private String description;
    private String domain;
    private String subDomain;
    private Double priorityScore;
    private String priorityExplanation;
    private ChallengeStatus status;
    private Double lat;
    private Double lon;
    private String district;
    private String villageOrWard;
    private Integer reportedPopulation;
    private Long duplicateOfId;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    @Builder.Default
    private List<String> evidenceUrls = new ArrayList<>();

    public static ChallengeResponseDTO fromEntity(Challenge challenge) {
        if (challenge == null) {
            return null;
        }

        Double lat = null;
        Double lon = null;
        if (challenge.getLocation() != null) {
            lon = challenge.getLocation().getX();
            lat = challenge.getLocation().getY();
        }

        return ChallengeResponseDTO.builder()
                .challengeId(challenge.getChallengeId())
                .userId(challenge.getUserId())
                .title(challenge.getTitle())
                .description(challenge.getDescription())
                .domain(challenge.getDomain())
                .subDomain(challenge.getSubDomain())
                .priorityScore(challenge.getPriorityScore())
                .priorityExplanation(challenge.getPriorityExplanation())
                .status(challenge.getStatus())
                .lat(lat)
                .lon(lon)
                .district(challenge.getDistrict())
                .villageOrWard(challenge.getVillageOrWard())
                .reportedPopulation(challenge.getReportedPopulation())
                .duplicateOfId(challenge.getDuplicateOfId())
                .createdAt(challenge.getCreatedAt())
                .updatedAt(challenge.getUpdatedAt())
                .evidenceUrls(new ArrayList<>())
                .build();
    }
}
