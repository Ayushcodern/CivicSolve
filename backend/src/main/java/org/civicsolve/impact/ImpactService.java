package org.civicsolve.impact;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.civicsolve.challenge.Challenge;
import org.civicsolve.challenge.ChallengeRepository;
import org.civicsolve.impact.dto.ImpactLedgerEntryDTO;
import org.civicsolve.impact.dto.ImpactMetricDTO;
import org.civicsolve.impact.dto.SubmitImpactMetricRequest;
import org.civicsolve.institution.Institution;
import org.civicsolve.institution.InstitutionRepository;
import org.civicsolve.project.Project;
import org.civicsolve.project.ProjectRepository;
import org.civicsolve.project.ProjectStage;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

/**
 * CivicSolve — Impact Service
 * Records before/after verification metrics and publishes the public impact ledger.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ImpactService {

    private final ImpactMetricRepository impactMetricRepository;
    private final ProjectRepository projectRepository;
    private final ChallengeRepository challengeRepository;
    private final InstitutionRepository institutionRepository;

    /**
     * Records one or more verified before-and-after metrics for a project.
     * Example: Turbidity: 85 NTU -> 4.2 NTU.
     */
    @Transactional
    public List<ImpactMetricDTO> submitMetrics(Long projectId, SubmitImpactMetricRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NoSuchElementException("Project not found with ID: " + projectId));

        List<SubmitImpactMetricRequest> items = new ArrayList<>();
        if (request.getMetrics() != null && !request.getMetrics().isEmpty()) {
            items.addAll(request.getMetrics());
        }
        if (request.getMetricName() != null && !request.getMetricName().isBlank()) {
            items.add(request);
        }

        if (items.isEmpty()) {
            throw new IllegalArgumentException("At least one impact metric (metricName, beforeValue, afterValue, unit) must be provided");
        }

        List<ImpactMetricDTO> results = new ArrayList<>();

        for (SubmitImpactMetricRequest item : items) {
            if (item.getMetricName() == null || item.getMetricName().isBlank()) {
                throw new IllegalArgumentException("Metric name cannot be blank");
            }
            if (item.getBeforeValue() == null || item.getAfterValue() == null) {
                throw new IllegalArgumentException("Both beforeValue and afterValue are required for metric: " + item.getMetricName());
            }
            if (item.getUnit() == null || item.getUnit().isBlank()) {
                throw new IllegalArgumentException("Unit cannot be blank for metric: " + item.getMetricName());
            }

            ImpactMetric metric = ImpactMetric.builder()
                    .project(project)
                    .metricName(item.getMetricName().trim())
                    .beforeValue(item.getBeforeValue())
                    .afterValue(item.getAfterValue())
                    .unit(item.getUnit().trim())
                    .build();

            ImpactMetric saved = impactMetricRepository.save(metric);
            project.addImpactMetric(saved);
            results.add(ImpactMetricDTO.fromEntity(saved));

            log.info("Recorded impact metric for project {}: {} ({} -> {} {})",
                    projectId, saved.getMetricName(), saved.getBeforeValue(), saved.getAfterValue(), saved.getUnit());
        }

        return results;
    }

    /**
     * Public Impact Ledger:
     * Returns verified community outcomes for completed/field-deployed civic projects.
     */
    @Transactional(readOnly = true)
    public List<ImpactLedgerEntryDTO> getPublicLedger() {
        List<Project> allProjects = projectRepository.findAll();

        return allProjects.stream()
                .filter(p -> {
                    boolean hasMetrics = impactMetricRepository.existsByProjectProjectId(p.getProjectId());
                    boolean isAdvanced = p.getStage() == ProjectStage.COMPLETED || p.getStage() == ProjectStage.DEPLOYED || p.getStage() == ProjectStage.PILOT;
                    return hasMetrics || isAdvanced;
                })
                .map(p -> {
                    Challenge challenge = challengeRepository.findById(p.getChallengeId()).orElse(null);
                    Institution institution = institutionRepository.findById(p.getInstitutionId()).orElse(null);
                    List<ImpactMetric> metrics = impactMetricRepository.findByProjectProjectId(p.getProjectId());

                    return ImpactLedgerEntryDTO.builder()
                            .projectId(p.getProjectId())
                            .challengeId(p.getChallengeId())
                            .challengeTitle(challenge != null ? challenge.getTitle() : "Challenge #" + p.getChallengeId())
                            .domain(challenge != null ? challenge.getDomain() : null)
                            .district(institution != null ? institution.getDistrict() : null)
                            .institutionId(p.getInstitutionId())
                            .institutionName(institution != null ? institution.getName() : "Institution #" + p.getInstitutionId())
                            .stage(p.getStage())
                            .startDate(p.getStartDate())
                            .endDate(p.getEndDate())
                            .metrics(metrics.stream().map(ImpactMetricDTO::fromEntity).collect(Collectors.toList()))
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * Returns impact metrics for a specific project.
     */
    @Transactional(readOnly = true)
    public List<ImpactMetricDTO> getMetricsByProject(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new NoSuchElementException("Project not found with ID: " + projectId);
        }
        return impactMetricRepository.findByProjectProjectId(projectId)
                .stream()
                .map(ImpactMetricDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
