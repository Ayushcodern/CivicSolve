package org.civicsolve.project.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.civicsolve.project.ProjectRole;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddMemberItem {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Project role is required")
    private ProjectRole role;
}
