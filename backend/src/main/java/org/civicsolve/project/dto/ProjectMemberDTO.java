package org.civicsolve.project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.civicsolve.project.ProjectRole;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMemberDTO {
    private Long memberId;
    private Long userId;
    private String name;
    private String email;
    private ProjectRole roleInProject;
    private OffsetDateTime joinedAt;
}
