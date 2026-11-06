package org.civicsolve.project;

import org.civicsolve.challenge.Challenge;
import org.civicsolve.challenge.ChallengeRepository;
import org.civicsolve.challenge.ChallengeStatus;
import org.civicsolve.institution.Institution;
import org.civicsolve.institution.InstitutionRepository;
import org.civicsolve.project.dto.*;
import org.civicsolve.user.Role;
import org.civicsolve.user.User;
import org.civicsolve.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ProjectMemberRepository projectMemberRepository;

    @Mock
    private MilestoneRepository milestoneRepository;

    @Mock
    private ChallengeRepository challengeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private InstitutionRepository institutionRepository;

    @InjectMocks
    private ProjectService projectService;

    @Test
    void testAcceptChallengeCreatesProposalAndSetsMatchedStatus() {
        Long challengeId = 101L;
        Challenge challenge = Challenge.builder()
                .challengeId(challengeId)
                .title("Contaminated canal in Sanwer")
                .status(ChallengeStatus.VALIDATED)
                .build();

        Institution institution = Institution.builder()
                .institutionId(1L)
                .name("Acropolis Institute of Technology and Research")
                .build();

        User facultyUser = User.builder()
                .userId(2L)
                .name("Prof. Aaquib Multani")
                .email("faculty@aitr.ac.in")
                .role(Role.FACULTY)
                .institutionId(1L)
                .build();

        when(challengeRepository.findById(challengeId)).thenReturn(Optional.of(challenge));
        when(projectRepository.existsByChallengeId(challengeId)).thenReturn(false);
        when(userRepository.findByEmail("faculty@aitr.ac.in")).thenReturn(Optional.of(facultyUser));
        when(userRepository.existsById(2L)).thenReturn(true);
        when(institutionRepository.findById(1L)).thenReturn(Optional.of(institution));

        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project p = invocation.getArgument(0);
            p.setProjectId(55L);
            return p;
        });

        AcceptProjectRequest request = AcceptProjectRequest.builder()
                .institutionId(1L)
                .facultyUserId(2L)
                .build();

        ProjectResponseDTO response = projectService.acceptChallenge(challengeId, request, "faculty@aitr.ac.in");

        assertNotNull(response);
        assertEquals(55L, response.getProjectId());
        assertEquals(ProjectStage.PROPOSAL, response.getStage());
        assertEquals(ChallengeStatus.MATCHED, challenge.getStatus());
        assertEquals("Contaminated canal in Sanwer", response.getChallengeTitle());
        assertEquals("Acropolis Institute of Technology and Research", response.getInstitutionName());

        verify(challengeRepository).save(challenge);
        verify(projectRepository).save(any(Project.class));
    }

    @Test
    void testAcceptChallengeThrowsExceptionWhenAlreadyClaimed() {
        Long challengeId = 102L;
        Challenge challenge = Challenge.builder()
                .challengeId(challengeId)
                .title("Low voltage fluctuations")
                .status(ChallengeStatus.VALIDATED)
                .build();

        when(challengeRepository.findById(challengeId)).thenReturn(Optional.of(challenge));
        when(projectRepository.existsByChallengeId(challengeId)).thenReturn(true);

        assertThrows(IllegalStateException.class, () ->
                projectService.acceptChallenge(challengeId, null, "faculty@aitr.ac.in")
        );

        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    void testAddTeamMembersAssignsRolesSuccessfully() {
        Long projectId = 55L;
        Project project = Project.builder()
                .projectId(projectId)
                .challengeId(101L)
                .institutionId(1L)
                .stage(ProjectStage.PROPOSAL)
                .startDate(LocalDate.now())
                .build();

        User student = User.builder()
                .userId(3L)
                .name("Priya Sharma")
                .email("priya@aitr.ac.in")
                .role(Role.STUDENT)
                .build();

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(userRepository.existsById(3L)).thenReturn(true);
        when(projectMemberRepository.findByProjectProjectIdAndUserId(projectId, 3L)).thenReturn(Optional.empty());

        TeamAssignmentRequest request = TeamAssignmentRequest.builder()
                .userId(3L)
                .role(ProjectRole.STUDENT_RESEARCHER)
                .build();

        when(challengeRepository.findById(101L)).thenReturn(Optional.empty());
        when(institutionRepository.findById(1L)).thenReturn(Optional.empty());

        ProjectResponseDTO response = projectService.addTeamMembers(projectId, request);

        assertNotNull(response);
        verify(projectMemberRepository).save(any(ProjectMember.class));
    }

    @Test
    void testAddMilestoneSavesWithPendingStatus() {
        Long projectId = 55L;
        Project project = Project.builder()
                .projectId(projectId)
                .stage(ProjectStage.PROPOSAL)
                .build();

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(milestoneRepository.save(any(Milestone.class))).thenAnswer(invocation -> {
            Milestone m = invocation.getArgument(0);
            m.setMilestoneId(10L);
            return m;
        });

        AddMilestoneRequest request = AddMilestoneRequest.builder()
                .title("Preliminary Water Quality Lab Analysis")
                .description("Sample water from 5 tube-wells across Sanwer")
                .dueDate(LocalDate.of(2026, 12, 1))
                .build();

        MilestoneResponseDTO result = projectService.addMilestone(projectId, request);

        assertNotNull(result);
        assertEquals(10L, result.getMilestoneId());
        assertEquals("Preliminary Water Quality Lab Analysis", result.getTitle());
        assertEquals(MilestoneStatus.PENDING, result.getStatus());
        verify(milestoneRepository).save(any(Milestone.class));
    }

    @Test
    void testSubmitMilestoneSetsStatusToSubmitted() {
        Long projectId = 55L;
        Long milestoneId = 10L;

        Milestone milestone = Milestone.builder()
                .milestoneId(milestoneId)
                .title("Preliminary Water Quality Lab Analysis")
                .status(MilestoneStatus.PENDING)
                .dueDate(LocalDate.of(2026, 12, 1))
                .build();

        when(milestoneRepository.findByMilestoneIdAndProjectProjectId(milestoneId, projectId))
                .thenReturn(Optional.of(milestone));
        when(milestoneRepository.save(any(Milestone.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MilestoneResponseDTO result = projectService.submitMilestone(projectId, milestoneId, "https://reports.aitr.ac.in/water-lab-1.pdf", null);

        assertNotNull(result);
        assertEquals(MilestoneStatus.SUBMITTED, result.getStatus());
        assertEquals("https://reports.aitr.ac.in/water-lab-1.pdf", result.getDeliverableUrl());
    }

    @Test
    void testApproveMilestoneSetsStatusToApproved() {
        Long projectId = 55L;
        Long milestoneId = 10L;

        Milestone milestone = Milestone.builder()
                .milestoneId(milestoneId)
                .title("Preliminary Water Quality Lab Analysis")
                .status(MilestoneStatus.SUBMITTED)
                .dueDate(LocalDate.of(2026, 12, 1))
                .build();

        when(milestoneRepository.findByMilestoneIdAndProjectProjectId(milestoneId, projectId))
                .thenReturn(Optional.of(milestone));
        when(milestoneRepository.save(any(Milestone.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MilestoneResponseDTO result = projectService.approveMilestone(projectId, milestoneId);

        assertNotNull(result);
        assertEquals(MilestoneStatus.APPROVED, result.getStatus());
    }

    @Test
    void testAdvanceStageAdvancesFromProposalToPrototypeWhenAllApproved() {
        Long projectId = 55L;
        Project project = Project.builder()
                .projectId(projectId)
                .challengeId(101L)
                .institutionId(1L)
                .stage(ProjectStage.PROPOSAL)
                .startDate(LocalDate.now())
                .build();

        Milestone m1 = Milestone.builder()
                .milestoneId(1L)
                .title("Milestone 1")
                .status(MilestoneStatus.APPROVED)
                .build();

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(milestoneRepository.findByProjectProjectId(projectId)).thenReturn(List.of(m1));
        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProjectResponseDTO result = projectService.advanceStage(projectId);

        assertNotNull(result);
        assertEquals(ProjectStage.PROTOTYPE, result.getStage());
        verify(projectRepository).save(project);
    }

    @Test
    void testAdvanceStageThrowsExceptionWhenMilestoneNotApproved() {
        Long projectId = 55L;
        Project project = Project.builder()
                .projectId(projectId)
                .stage(ProjectStage.PROPOSAL)
                .build();

        Milestone m1 = Milestone.builder()
                .milestoneId(1L)
                .title("Milestone 1")
                .status(MilestoneStatus.SUBMITTED)
                .build();

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(milestoneRepository.findByProjectProjectId(projectId)).thenReturn(List.of(m1));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                projectService.advanceStage(projectId)
        );

        assertTrue(ex.getMessage().contains("must be APPROVED"));
        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    void testAdvanceStageThrowsExceptionWhenNoMilestonesExist() {
        Long projectId = 55L;
        Project project = Project.builder()
                .projectId(projectId)
                .stage(ProjectStage.PROPOSAL)
                .build();

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(milestoneRepository.findByProjectProjectId(projectId)).thenReturn(Collections.emptyList());

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                projectService.advanceStage(projectId)
        );

        assertTrue(ex.getMessage().contains("no defined milestones"));
        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    void testGetProjectByIdReturnsStageAndTeam() {
        Long projectId = 55L;
        Project project = Project.builder()
                .projectId(projectId)
                .challengeId(101L)
                .institutionId(1L)
                .stage(ProjectStage.PROPOSAL)
                .startDate(LocalDate.now())
                .build();

        ProjectMember member = ProjectMember.builder()
                .memberId(1L)
                .project(project)
                .userId(2L)
                .roleInProject(ProjectRole.FACULTY_LEAD)
                .build();

        User user = User.builder()
                .userId(2L)
                .name("Prof. Aaquib Multani")
                .email("faculty@aitr.ac.in")
                .build();

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(projectMemberRepository.findByProjectProjectId(projectId)).thenReturn(List.of(member));
        when(userRepository.findById(2L)).thenReturn(Optional.of(user));

        ProjectResponseDTO response = projectService.getProjectById(projectId);

        assertNotNull(response);
        assertEquals(projectId, response.getProjectId());
        assertEquals(ProjectStage.PROPOSAL, response.getStage());
        assertEquals(1, response.getTeamMembers().size());
        assertEquals("Prof. Aaquib Multani", response.getTeamMembers().get(0).getName());
        assertEquals(ProjectRole.FACULTY_LEAD, response.getTeamMembers().get(0).getRoleInProject());
    }
}
