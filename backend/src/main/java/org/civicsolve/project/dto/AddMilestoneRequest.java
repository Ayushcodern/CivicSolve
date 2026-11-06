package org.civicsolve.project.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * CivicSolve — Add Milestone Request DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddMilestoneRequest {

    @NotBlank(message = "Milestone title is required")
    @Size(max = 200, message = "Milestone title must not exceed 200 characters")
    private String title;

    private String description;

    @NotNull(message = "Due date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dueDate;

    private String deliverableUrl;
}
