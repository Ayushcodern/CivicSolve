package org.civicsolve.project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.civicsolve.project.ProjectStage;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponseDTO {
    private Long projectId;
    private Long challengeId;
    private String challengeTitle;
    private Long institutionId;
    private String institutionName;
    private ProjectStage stage;
    private LocalDate startDate;
    private LocalDate endDate;
    private OffsetDateTime createdAt;
    private List<ProjectMemberDTO> teamMembers;
    private List<MilestoneResponseDTO> milestones;
}
