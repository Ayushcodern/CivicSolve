package org.civicsolve.institution.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstitutionProjectDTO {

    private Long projectId;
    private Long challengeId;
    private String challengeTitle;
    private String stage;
    private LocalDate startDate;
}
