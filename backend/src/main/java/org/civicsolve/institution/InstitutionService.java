package org.civicsolve.institution;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.civicsolve.institution.dto.CapabilityDTO;
import org.civicsolve.institution.dto.InstitutionDetailDTO;
import org.civicsolve.institution.dto.InstitutionProjectDTO;
import org.civicsolve.institution.dto.InstitutionSummaryDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

/**
 * CivicSolve — Institution & Capability Service
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InstitutionService {

    private final InstitutionRepository institutionRepository;
    private final CapabilityRepository capabilityRepository;
    private final JdbcTemplate jdbcTemplate;

    /**
     * Lists all institutions with their capabilities, with optional type and district filters.
     */
    @Transactional(readOnly = true)
    public List<InstitutionSummaryDTO> getAllInstitutions(String type, String district) {
        String cleanType = (type != null && !type.trim().isEmpty()) ? type.trim() : null;
        String cleanDistrict = (district != null && !district.trim().isEmpty()) ? district.trim() : null;

        List<Institution> institutions = institutionRepository.findWithFilters(cleanType, cleanDistrict);
        return institutions.stream()
                .map(InstitutionSummaryDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Fetches detailed profile of an institution including active claimed projects.
     */
    @Transactional(readOnly = true)
    public InstitutionDetailDTO getInstitutionDetail(Long institutionId) {
        Institution institution = institutionRepository.findByIdWithCapabilities(institutionId)
                .orElseThrow(() -> new NoSuchElementException("Institution not found with ID: " + institutionId));

        List<InstitutionProjectDTO> activeProjects = findActiveProjects(institutionId);

        return InstitutionDetailDTO.fromEntity(institution, activeProjects);
    }

    /**
     * Adds a new capability or updates an existing capability for the institution.
     */
    @Transactional
    public CapabilityDTO addOrUpdateCapability(Long institutionId, CapabilityDTO dto) {
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new NoSuchElementException("Institution not found with ID: " + institutionId));

        Capability capability;

        if (dto.getCapabilityId() != null) {
            capability = capabilityRepository.findById(dto.getCapabilityId())
                    .orElseThrow(() -> new NoSuchElementException("Capability not found with ID: " + dto.getCapabilityId()));

            if (!capability.getInstitution().getInstitutionId().equals(institutionId)) {
                throw new IllegalArgumentException("Capability does not belong to institution ID: " + institutionId);
            }

            capability.setDomain(dto.getDomain().trim());
            capability.setExpertise(dto.getExpertise().trim());
            if (dto.getCapacity() != null) {
                capability.setCapacity(dto.getCapacity());
            }
        } else {
            capability = Capability.builder()
                    .domain(dto.getDomain().trim())
                    .expertise(dto.getExpertise().trim())
                    .capacity(dto.getCapacity() != null ? dto.getCapacity() : 5)
                    .build();

            institution.addCapability(capability);
        }

        Capability saved = capabilityRepository.save(capability);
        log.info("Saved capability ID={} for institution ID={}: domain='{}'",
                saved.getCapabilityId(), institutionId, saved.getDomain());

        return CapabilityDTO.fromEntity(saved);
    }

    private List<InstitutionProjectDTO> findActiveProjects(Long institutionId) {
        try {
            String sql = "SELECT p.project_id, p.challenge_id, c.title, p.stage, p.start_date " +
                    "FROM projects p " +
                    "LEFT JOIN challenges c ON p.challenge_id = c.challenge_id " +
                    "WHERE p.institution_id = ? " +
                    "ORDER BY p.start_date DESC";

            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                Date startDateSql = rs.getDate("start_date");
                return InstitutionProjectDTO.builder()
                        .projectId(rs.getLong("project_id"))
                        .challengeId(rs.getLong("challenge_id"))
                        .challengeTitle(rs.getString("title"))
                        .stage(rs.getString("stage"))
                        .startDate(startDateSql != null ? startDateSql.toLocalDate() : null)
                        .build();
            }, institutionId);
        } catch (Exception ex) {
            log.warn("Could not query projects table for institution ID={}: {}", institutionId, ex.getMessage());
            return new ArrayList<>();
        }
    }
}
