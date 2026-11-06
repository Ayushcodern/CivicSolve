package org.civicsolve.impact.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * CivicSolve — Submit Impact Metric Request DTO
 * Supports single metric submission or batch metrics list.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitImpactMetricRequest {

    private String metricName;
    private Double beforeValue;
    private Double afterValue;
    private String unit;

    // Optional batch support
    private List<SubmitImpactMetricRequest> metrics;
}
