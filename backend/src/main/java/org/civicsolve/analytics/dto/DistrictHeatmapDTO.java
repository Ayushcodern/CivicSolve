package org.civicsolve.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * CivicSolve — District Heatmap Distribution Data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DistrictHeatmapDTO {
    private String district;
    private long challengeCount;
    private double avgPriorityScore;
    private double centerLat;
    private double centerLon;
}
