package org.civicsolve.institution.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.civicsolve.institution.Capability;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CapabilityDTO {

    private Long capabilityId;

    @NotBlank(message = "Domain is required")
    private String domain;

    @NotBlank(message = "Expertise details are required")
    private String expertise;

    @PositiveOrZero(message = "Capacity must be zero or positive")
    private Integer capacity;

    public static CapabilityDTO fromEntity(Capability cap) {
        if (cap == null) return null;
        return CapabilityDTO.builder()
                .capabilityId(cap.getCapabilityId())
                .domain(cap.getDomain())
                .expertise(cap.getExpertise())
                .capacity(cap.getCapacity())
                .build();
    }
}
