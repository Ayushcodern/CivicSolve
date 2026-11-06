package org.civicsolve.project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.civicsolve.project.Milestone;
import org.civicsolve.project.MilestoneStatus;

import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * CivicSolve — Milestone Response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MilestoneResponseDTO {
    private Long milestoneId;
    private Long projectId;
    private String title;
    private String description;
    private LocalDate dueDate;
    private MilestoneStatus status;
    private String deliverableUrl;
    private OffsetDateTime updatedAt;

    public static MilestoneResponseDTO fromEntity(Milestone m) {
        if (m == null) {
            return null;
        }
        return MilestoneResponseDTO.builder()
                .milestoneId(m.getMilestoneId())
                .projectId(m.getProject() != null ? m.getProject().getProjectId() : null)
                .title(m.getTitle())
                .description(m.getDescription())
                .dueDate(m.getDueDate())
                .status(m.getStatus())
                .deliverableUrl(m.getDeliverableUrl())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}
