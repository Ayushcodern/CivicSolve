package org.civicsolve.institution.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.civicsolve.institution.Institution;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstitutionDetailDTO {

    private Long institutionId;
    private String name;
    private String type;
    private String district;
    private Double lat;
    private Double lon;

    @Builder.Default
    private List<CapabilityDTO> capabilities = new ArrayList<>();

    @Builder.Default
    private List<InstitutionProjectDTO> activeProjects = new ArrayList<>();

    public static InstitutionDetailDTO fromEntity(Institution inst, List<InstitutionProjectDTO> activeProjects) {
        if (inst == null) return null;

        Double lat = null;
        Double lon = null;
        if (inst.getLocation() != null) {
            lon = inst.getLocation().getX();
            lat = inst.getLocation().getY();
        }

        List<CapabilityDTO> caps = inst.getCapabilities() != null
                ? inst.getCapabilities().stream().map(CapabilityDTO::fromEntity).collect(Collectors.toList())
                : new ArrayList<>();

        return InstitutionDetailDTO.builder()
                .institutionId(inst.getInstitutionId())
                .name(inst.getName())
                .type(inst.getType())
                .district(inst.getDistrict())
                .lat(lat)
                .lon(lon)
                .capabilities(caps)
                .activeProjects(activeProjects != null ? activeProjects : new ArrayList<>())
                .build();
    }
}
