package org.civicsolve.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * CivicSolve — Domain Breakdown Percentage Distribution Data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DomainBreakdownDTO {
    private String domain;
    private long count;
    private double percentage;
}
