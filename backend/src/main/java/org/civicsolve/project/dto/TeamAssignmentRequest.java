package org.civicsolve.project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.civicsolve.project.ProjectRole;

import java.util.List;

/**
 * CivicSolve — Team Assignment Request
 * Supports assigning either a single member (userId + role) or a list of members.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamAssignmentRequest {

    // Single member payload format
    private Long userId;
    private ProjectRole role;

    // Batch member payload format
    private List<AddMemberItem> members;
}
