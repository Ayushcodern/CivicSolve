package org.civicsolve.impact;

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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ImpactServiceTest {

    @Mock
    private ImpactMetricRepository impactMetricRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ChallengeRepository challengeRepository;

    @Mock
    private InstitutionRepository institutionRepository;

    @InjectMocks
    private ImpactService impactService;

    @Test
    void testSubmitMetricsCalculatesPercentageChangeAndSaves() {
        Long projectId = 10L;
        Project project = Project.builder()
                .projectId(projectId)
                .stage(ProjectStage.PILOT)
                .build();

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(impactMetricRepository.save(any(ImpactMetric.class))).thenAnswer(invocation -> {
            ImpactMetric m = invocation.getArgument(0);
            m.setMetricId(101L);
            m.setVerifiedAt(OffsetDateTime.now());
            return m;
        });

        SubmitImpactMetricRequest request = SubmitImpactMetricRequest.builder()
                .metricName("Turbidity")
                .beforeValue(85.0)
                .afterValue(4.2)
                .unit("NTU")
                .build();

        List<ImpactMetricDTO> results = impactService.submitMetrics(projectId, request);

        assertNotNull(results);
        assertEquals(1, results.size());
        ImpactMetricDTO metric = results.get(0);
        assertEquals("Turbidity", metric.getMetricName());
        assertEquals(85.0, metric.getBeforeValue());
        assertEquals(4.2, metric.getAfterValue());
        assertEquals("NTU", metric.getUnit());
        assertEquals(-95.1, metric.getPercentageChange());

        verify(impactMetricRepository).save(any(ImpactMetric.class));
    }

    @Test
    void testSubmitMetricsThrowsNotFoundWhenProjectDoesNotExist() {
        Long projectId = 999L;
        when(projectRepository.findById(projectId)).thenReturn(Optional.empty());

        SubmitImpactMetricRequest request = SubmitImpactMetricRequest.builder()
                .metricName("BOD")
                .beforeValue(12.0)
                .afterValue(2.0)
                .unit("mg/L")
                .build();

        assertThrows(NoSuchElementException.class, () ->
                impactService.submitMetrics(projectId, request)
        );

        verify(impactMetricRepository, never()).save(any(ImpactMetric.class));
    }

    @Test
    void testGetPublicLedgerReturnsCompletedProjectsWithOutcomes() {
        Long projectId = 10L;
        Project project = Project.builder()
                .projectId(projectId)
                .challengeId(100L)
                .institutionId(1L)
                .stage(ProjectStage.COMPLETED)
                .startDate(LocalDate.of(2026, 1, 15))
                .endDate(LocalDate.of(2026, 4, 10))
                .build();

        Challenge challenge = Challenge.builder()
                .challengeId(100L)
                .title("Contaminated canal in Sanwer")
                .domain("WATER")
                .build();

        Institution institution = Institution.builder()
                .institutionId(1L)
                .name("Acropolis Institute of Technology and Research")
                .district("Indore")
                .build();

        ImpactMetric metric = ImpactMetric.builder()
                .metricId(101L)
                .project(project)
                .metricName("Turbidity")
                .beforeValue(85.0)
                .afterValue(4.2)
                .unit("NTU")
                .verifiedAt(OffsetDateTime.now())
                .build();

        when(projectRepository.findAll()).thenReturn(List.of(project));
        when(impactMetricRepository.existsByProjectProjectId(projectId)).thenReturn(true);
        when(challengeRepository.findById(100L)).thenReturn(Optional.of(challenge));
        when(institutionRepository.findById(1L)).thenReturn(Optional.of(institution));
        when(impactMetricRepository.findByProjectProjectId(projectId)).thenReturn(List.of(metric));

        List<ImpactLedgerEntryDTO> ledger = impactService.getPublicLedger();

        assertNotNull(ledger);
        assertEquals(1, ledger.size());
        ImpactLedgerEntryDTO entry = ledger.get(0);
        assertEquals(projectId, entry.getProjectId());
        assertEquals("Contaminated canal in Sanwer", entry.getChallengeTitle());
        assertEquals("WATER", entry.getDomain());
        assertEquals("Indore", entry.getDistrict());
        assertEquals("Acropolis Institute of Technology and Research", entry.getInstitutionName());
        assertEquals(ProjectStage.COMPLETED, entry.getStage());
        assertEquals(1, entry.getMetrics().size());
        assertEquals(-95.1, entry.getMetrics().get(0).getPercentageChange());
    }
}
