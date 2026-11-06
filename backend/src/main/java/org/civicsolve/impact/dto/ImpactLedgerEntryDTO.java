package org.civicsolve.impact.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.civicsolve.project.ProjectStage;

import java.time.LocalDate;
import java.util.List;

/**
 * CivicSolve — Public Impact Ledger Entry DTO
 * Represents a community challenge solved by an institution, including verified outcome metrics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImpactLedgerEntryDTO {

    private Long projectId;
    private Long challengeId;
    private String challengeTitle;
    private String domain;
    private String district;
    private Long institutionId;
    private String institutionName;
    private ProjectStage stage;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<ImpactMetricDTO> metrics;
}
