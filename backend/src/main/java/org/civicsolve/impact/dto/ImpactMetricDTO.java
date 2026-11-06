package org.civicsolve.impact.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.civicsolve.impact.ImpactMetric;

import java.time.OffsetDateTime;

/**
 * CivicSolve — Impact Metric DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImpactMetricDTO {

    private Long metricId;
    private Long projectId;
    private String metricName;
    private Double beforeValue;
    private Double afterValue;
    private String unit;
    private Double percentageChange;
    private OffsetDateTime verifiedAt;

    public static ImpactMetricDTO fromEntity(ImpactMetric metric) {
        if (metric == null) {
            return null;
        }

        Double pctChange = null;
        if (metric.getBeforeValue() != null && metric.getAfterValue() != null && metric.getBeforeValue() != 0.0) {
            pctChange = Math.round(((metric.getAfterValue() - metric.getBeforeValue()) / metric.getBeforeValue()) * 1000.0) / 10.0;
        }

        return ImpactMetricDTO.builder()
                .metricId(metric.getMetricId())
                .projectId(metric.getProject() != null ? metric.getProject().getProjectId() : null)
                .metricName(metric.getMetricName())
                .beforeValue(metric.getBeforeValue())
                .afterValue(metric.getAfterValue())
                .unit(metric.getUnit())
                .percentageChange(pctChange)
                .verifiedAt(metric.getVerifiedAt())
                .build();
    }
}
