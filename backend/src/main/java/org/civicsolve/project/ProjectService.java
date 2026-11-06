package org.civicsolve.project;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.civicsolve.challenge.Challenge;
import org.civicsolve.challenge.ChallengeRepository;
import org.civicsolve.challenge.ChallengeStatus;
import org.civicsolve.institution.Institution;
import org.civicsolve.institution.InstitutionRepository;
import org.civicsolve.project.dto.*;
import org.civicsolve.user.Role;
import org.civicsolve.user.User;
import org.civicsolve.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * CivicSolve — Project Service
 * Handles challenge claiming by universities, project creation in 'PROPOSAL' stage,
 * status transitions to 'MATCHED', team member assignment, milestone management,
 * and stage gate progression.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final MilestoneRepository milestoneRepository;
    private final ChallengeRepository challengeRepository;
    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;

    @Value("${application.upload.dir:uploads}")
    private String uploadDir;

    /**
     * University claims challenge:
     *  - Creates a new Project in stage 'PROPOSAL'.
     *  - Adds accepting faculty as FACULTY_LEAD.
     *  - Transitions Challenge status to 'MATCHED'.
     */
    @Transactional
    public ProjectResponseDTO acceptChallenge(Long challengeId, AcceptProjectRequest request, String authenticatedEmail) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new NoSuchElementException("Challenge not found with ID: " + challengeId));

        if (projectRepository.existsByChallengeId(challengeId)) {
            throw new IllegalStateException("Challenge " + challengeId + " has already been claimed by a project.");
        }

        // Resolve claiming institution
        Long institutionId = null;
        if (request != null && request.getInstitutionId() != null) {
            institutionId = request.getInstitutionId();
        } else if (authenticatedEmail != null) {
            Optional<User> authUser = userRepository.findByEmail(authenticatedEmail);
            if (authUser.isPresent() && authUser.get().getInstitutionId() != null) {
                institutionId = authUser.get().getInstitutionId();
            }
        }

        if (institutionId == null) {
            // Default to first registered university/institution or 1L
            institutionId = institutionRepository.findAll().stream()
                    .map(Institution::getInstitutionId)
                    .findFirst()
                    .orElse(1L);
        }

        // Resolve faculty lead
        Long facultyUserId = null;
        if (request != null && request.getFacultyUserId() != null) {
            facultyUserId = request.getFacultyUserId();
        } else if (authenticatedEmail != null) {
            Optional<User> authUser = userRepository.findByEmail(authenticatedEmail);
            if (authUser.isPresent() && (authUser.get().getRole() == Role.FACULTY || authUser.get().getRole() == Role.ADMIN)) {
                facultyUserId = authUser.get().getUserId();
            }
        }

        if (facultyUserId == null) {
            facultyUserId = userRepository.findByEmail("faculty@aitr.ac.in")
                    .map(User::getUserId)
                    .orElse(2L);
        }

        Project project = Project.builder()
                .challengeId(challengeId)
                .institutionId(institutionId)
                .stage(ProjectStage.PROPOSAL)
                .startDate(LocalDate.now())
                .build();

        if (facultyUserId != null && userRepository.existsById(facultyUserId)) {
            ProjectMember facultyLead = ProjectMember.builder()
                    .project(project)
                    .userId(facultyUserId)
                    .roleInProject(ProjectRole.FACULTY_LEAD)
                    .build();
            project.addMember(facultyLead);
        }

        Project savedProject = projectRepository.save(project);

        // Update challenge status to MATCHED
        challenge.setStatus(ChallengeStatus.MATCHED);
        challengeRepository.save(challenge);

        log.info("Challenge {} accepted by institution {}. Project {} created in stage PROPOSAL, challenge status updated to MATCHED",
                challengeId, institutionId, savedProject.getProjectId());

        return mapToResponseDTO(savedProject);
    }

    /**
     * Adds faculty guide, student researchers, and industry mentors to a project team.
     */
    @Transactional
    public ProjectResponseDTO addTeamMembers(Long projectId, TeamAssignmentRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NoSuchElementException("Project not found with ID: " + projectId));

        List<AddMemberItem> itemsToAdd = new ArrayList<>();
        if (request.getMembers() != null && !request.getMembers().isEmpty()) {
            itemsToAdd.addAll(request.getMembers());
        }
        if (request.getUserId() != null && request.getRole() != null) {
            itemsToAdd.add(new AddMemberItem(request.getUserId(), request.getRole()));
        }

        if (itemsToAdd.isEmpty()) {
            throw new IllegalArgumentException("No team member specified in the request");
        }

        for (AddMemberItem item : itemsToAdd) {
            if (!userRepository.existsById(item.getUserId())) {
                throw new NoSuchElementException("User not found with ID: " + item.getUserId());
            }

            Optional<ProjectMember> existingMember = projectMemberRepository
                    .findByProjectProjectIdAndUserId(projectId, item.getUserId());

            if (existingMember.isPresent()) {
                existingMember.get().setRoleInProject(item.getRole());
                projectMemberRepository.save(existingMember.get());
                log.info("Updated role of user {} in project {} to {}", item.getUserId(), projectId, item.getRole());
            } else {
                ProjectMember newMember = ProjectMember.builder()
                        .project(project)
                        .userId(item.getUserId())
                        .roleInProject(item.getRole())
                        .build();
                projectMemberRepository.save(newMember);
                project.addMember(newMember);
                log.info("Added user {} to project {} with role {}", item.getUserId(), projectId, item.getRole());
            }
        }

        return mapToResponseDTO(project);
    }

    /**
     * Adds a new milestone to a project.
     */
    @Transactional
    public MilestoneResponseDTO addMilestone(Long projectId, AddMilestoneRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NoSuchElementException("Project not found with ID: " + projectId));

        Milestone milestone = Milestone.builder()
                .project(project)
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .status(MilestoneStatus.PENDING)
                .deliverableUrl(request.getDeliverableUrl())
                .build();

        Milestone saved = milestoneRepository.save(milestone);
        project.addMilestone(saved);

        log.info("Added milestone '{}' (ID: {}) to project {}", saved.getTitle(), saved.getMilestoneId(), projectId);
        return MilestoneResponseDTO.fromEntity(saved);
    }

    /**
     * Submits proof/deliverable for a milestone and transitions status to SUBMITTED.
     */
    @Transactional
    public MilestoneResponseDTO submitMilestone(Long projectId, Long milestoneId, String deliverableUrl, MultipartFile file) {
        Milestone milestone = milestoneRepository.findByMilestoneIdAndProjectProjectId(milestoneId, projectId)
                .orElseThrow(() -> new NoSuchElementException("Milestone " + milestoneId + " not found in project " + projectId));

        if (file != null && !file.isEmpty()) {
            Path uploadPath = Paths.get(uploadDir);
            try {
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "deliverable.pdf";
                String sanitized = originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_");
                String uniqueFilename = UUID.randomUUID() + "_" + sanitized;
                Path targetFile = uploadPath.resolve(uniqueFilename);

                Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);
                milestone.setDeliverableUrl("uploads/" + uniqueFilename);
            } catch (IOException e) {
                log.error("Failed to store milestone deliverable file", e);
                throw new RuntimeException("Failed to upload deliverable file", e);
            }
        } else if (deliverableUrl != null && !deliverableUrl.isBlank()) {
            milestone.setDeliverableUrl(deliverableUrl.trim());
        }

        milestone.setStatus(MilestoneStatus.SUBMITTED);
        Milestone saved = milestoneRepository.save(milestone);

        log.info("Submitted milestone deliverable for milestone {} (project {}). Status is SUBMITTED", milestoneId, projectId);
        return MilestoneResponseDTO.fromEntity(saved);
    }

    /**
     * Approves a milestone deliverable.
     */
    @Transactional
    public MilestoneResponseDTO approveMilestone(Long projectId, Long milestoneId) {
        Milestone milestone = milestoneRepository.findByMilestoneIdAndProjectProjectId(milestoneId, projectId)
                .orElseThrow(() -> new NoSuchElementException("Milestone " + milestoneId + " not found in project " + projectId));

        milestone.setStatus(MilestoneStatus.APPROVED);
        Milestone saved = milestoneRepository.save(milestone);

        log.info("Approved milestone {} for project {}", milestoneId, projectId);
        return MilestoneResponseDTO.fromEntity(saved);
    }

    /**
     * Advances project stage:
     * Enforces stage gate progression: only advances when ALL milestones in project are APPROVED.
     * Sequence: PROPOSAL -> PROTOTYPE -> FIELD_TEST -> PILOT -> DEPLOYED -> COMPLETED
     */
    @Transactional
    public ProjectResponseDTO advanceStage(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NoSuchElementException("Project not found with ID: " + projectId));

        List<Milestone> milestones = milestoneRepository.findByProjectProjectId(projectId);

        if (milestones.isEmpty()) {
            throw new IllegalStateException("Cannot advance stage: Project has no defined milestones.");
        }

        List<Milestone> unapproved = milestones.stream()
                .filter(m -> m.getStatus() != MilestoneStatus.APPROVED)
                .collect(Collectors.toList());

        if (!unapproved.isEmpty()) {
            throw new IllegalStateException("Cannot advance stage: All milestones in current stage must be APPROVED. Found "
                    + unapproved.size() + " unapproved milestone(s).");
        }

        ProjectStage currentStage = project.getStage();
        ProjectStage nextStage = currentStage.nextStage();

        if (nextStage == null) {
            throw new IllegalStateException("Project has already reached the final stage (COMPLETED).");
        }

        project.setStage(nextStage);

        if (nextStage == ProjectStage.COMPLETED) {
            project.setEndDate(LocalDate.now());
            challengeRepository.findById(project.getChallengeId()).ifPresent(c -> {
                c.setStatus(ChallengeStatus.RESOLVED);
                challengeRepository.save(c);
                log.info("Challenge {} marked RESOLVED following project completion", c.getChallengeId());
            });
        }

        Project savedProject = projectRepository.save(project);
        log.info("Project {} successfully advanced stage from {} to {}", projectId, currentStage, nextStage);

        return mapToResponseDTO(savedProject);
    }

    /**
     * Returns project team, current stage, milestones, and challenge information.
     */
    @Transactional(readOnly = true)
    public ProjectResponseDTO getProjectById(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NoSuchElementException("Project not found with ID: " + projectId));
        return mapToResponseDTO(project);
    }

    private ProjectResponseDTO mapToResponseDTO(Project project) {
        String challengeTitle = challengeRepository.findById(project.getChallengeId())
                .map(Challenge::getTitle)
                .orElse("Challenge #" + project.getChallengeId());

        String institutionName = institutionRepository.findById(project.getInstitutionId())
                .map(Institution::getName)
                .orElse("Institution #" + project.getInstitutionId());

        List<ProjectMember> members = projectMemberRepository.findByProjectProjectId(project.getProjectId());
        List<ProjectMemberDTO> memberDTOs = members.stream().map(m -> {
            Optional<User> user = userRepository.findById(m.getUserId());
            return ProjectMemberDTO.builder()
                    .memberId(m.getMemberId())
                    .userId(m.getUserId())
                    .name(user.map(User::getName).orElse("User #" + m.getUserId()))
                    .email(user.map(User::getEmail).orElse(null))
                    .roleInProject(m.getRoleInProject())
                    .joinedAt(m.getJoinedAt())
                    .build();
        }).collect(Collectors.toList());

        List<MilestoneResponseDTO> milestoneDTOs = milestoneRepository.findByProjectProjectId(project.getProjectId())
                .stream()
                .map(MilestoneResponseDTO::fromEntity)
                .collect(Collectors.toList());

        return ProjectResponseDTO.builder()
                .projectId(project.getProjectId())
                .challengeId(project.getChallengeId())
                .challengeTitle(challengeTitle)
                .institutionId(project.getInstitutionId())
                .institutionName(institutionName)
                .stage(project.getStage())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .createdAt(project.getCreatedAt())
                .teamMembers(memberDTOs)
                .milestones(milestoneDTOs)
                .build();
    }
}
