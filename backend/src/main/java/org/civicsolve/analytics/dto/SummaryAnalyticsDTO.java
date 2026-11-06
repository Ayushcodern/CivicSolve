package org.civicsolve.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * CivicSolve — Landing Page Live Analytics Summary
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SummaryAnalyticsDTO {
    private long totalChallenges;
    private long activeProjects;
    private long deployedSolutions;
    private long districts;
    private OffsetDateTime timestamp;
}
