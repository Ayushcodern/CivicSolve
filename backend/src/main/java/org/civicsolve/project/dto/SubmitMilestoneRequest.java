package org.civicsolve.project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * CivicSolve — Submit Milestone Deliverable Request DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitMilestoneRequest {
    private String deliverableUrl;
}
