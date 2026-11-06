package org.civicsolve.project;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.civicsolve.project.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.NoSuchElementException;

/**
 * CivicSolve — Project REST Controller
 *
 * Endpoints:
 *  - POST /api/v1/projects/{challengeId}/accept: University claims challenge. Creates Project in stage 'PROPOSAL' and updates challenge status to 'MATCHED'.
 *  - POST /api/v1/projects/{projectId}/team: Adds faculty guide, student researchers, and industry mentors.
 *  - GET /api/v1/projects/{id}: Returns project team, milestones, and current stage.
 *  - POST /api/v1/projects/{id}/milestones: Add milestone.
 *  - POST /api/v1/projects/{id}/milestones/{milestoneId}/submit: Upload milestone proof.
 *  - POST /api/v1/projects/{id}/milestones/{milestoneId}/approve: Approve milestone.
 *  - POST /api/v1/projects/{id}/advance-stage: Advances stage only when all milestones in current stage are APPROVED.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    /**
     * University claims challenge. Creates Project in stage 'PROPOSAL' and updates challenge status to 'MATCHED'.
     */
    @PostMapping("/{challengeId}/accept")
    public ResponseEntity<?> acceptChallenge(
            @PathVariable Long challengeId,
            @RequestBody(required = false) AcceptProjectRequest request,
            Authentication authentication
    ) {
        try {
            String email = (authentication != null) ? authentication.getName() : null;
            ProjectResponseDTO project = projectService.acceptChallenge(challengeId, request, email);
            return ResponseEntity.status(HttpStatus.CREATED).body(project);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Not Found", "message", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Conflict", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to accept challenge ID: {}", challengeId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal Server Error", "message", e.getMessage()));
        }
    }

    /**
     * Adds faculty guide, student researchers, and industry mentors to a project team.
     */
    @PostMapping("/{projectId}/team")
    public ResponseEntity<?> addTeamMembers(
            @PathVariable Long projectId,
            @Valid @RequestBody TeamAssignmentRequest request
    ) {
        try {
            ProjectResponseDTO project = projectService.addTeamMembers(projectId, request);
            return ResponseEntity.ok(project);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Not Found", "message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Bad Request", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to update team for project ID: {}", projectId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal Server Error", "message", e.getMessage()));
        }
    }

    /**
     * Returns project team, milestones, and current stage.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getProjectById(@PathVariable Long id) {
        try {
            ProjectResponseDTO project = projectService.getProjectById(id);
            return ResponseEntity.ok(project);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Not Found", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to fetch project ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal Server Error", "message", e.getMessage()));
        }
    }

    /**
     * Adds a milestone to a project.
     */
    @PostMapping("/{id}/milestones")
    public ResponseEntity<?> addMilestone(
            @PathVariable Long id,
            @Valid @RequestBody AddMilestoneRequest request
    ) {
        try {
            MilestoneResponseDTO response = projectService.addMilestone(id, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Not Found", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to add milestone for project ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal Server Error", "message", e.getMessage()));
        }
    }

    /**
     * Submits proof/deliverable for a milestone (JSON payload).
     */
    @PostMapping(value = "/{id}/milestones/{milestoneId}/submit", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> submitMilestoneJson(
            @PathVariable Long id,
            @PathVariable Long milestoneId,
            @RequestBody(required = false) SubmitMilestoneRequest request
    ) {
        try {
            String deliverableUrl = (request != null) ? request.getDeliverableUrl() : null;
            MilestoneResponseDTO response = projectService.submitMilestone(id, milestoneId, deliverableUrl, null);
            return ResponseEntity.ok(response);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Not Found", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to submit milestone {} for project {}", milestoneId, id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal Server Error", "message", e.getMessage()));
        }
    }

    /**
     * Submits proof/deliverable for a milestone (multipart file upload).
     */
    @PostMapping(value = "/{id}/milestones/{milestoneId}/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> submitMilestoneMultipart(
            @PathVariable Long id,
            @PathVariable Long milestoneId,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "deliverableUrl", required = false) String deliverableUrl
    ) {
        try {
            MilestoneResponseDTO response = projectService.submitMilestone(id, milestoneId, deliverableUrl, file);
            return ResponseEntity.ok(response);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Not Found", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to upload deliverable for milestone {} (project {})", milestoneId, id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal Server Error", "message", e.getMessage()));
        }
    }

    /**
     * Submits proof/deliverable for a milestone (fallback / query param).
     */
    @PostMapping(value = "/{id}/milestones/{milestoneId}/submit")
    public ResponseEntity<?> submitMilestoneDefault(
            @PathVariable Long id,
            @PathVariable Long milestoneId,
            @RequestParam(value = "deliverableUrl", required = false) String deliverableUrl
    ) {
        try {
            MilestoneResponseDTO response = projectService.submitMilestone(id, milestoneId, deliverableUrl, null);
            return ResponseEntity.ok(response);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Not Found", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to submit deliverable for milestone {} (project {})", milestoneId, id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal Server Error", "message", e.getMessage()));
        }
    }

    /**
     * Approves a milestone deliverable.
     */
    @PostMapping("/{id}/milestones/{milestoneId}/approve")
    public ResponseEntity<?> approveMilestone(
            @PathVariable Long id,
            @PathVariable Long milestoneId
    ) {
        try {
            MilestoneResponseDTO response = projectService.approveMilestone(id, milestoneId);
            return ResponseEntity.ok(response);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Not Found", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to approve milestone {} for project {}", milestoneId, id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal Server Error", "message", e.getMessage()));
        }
    }

    /**
     * Advances stage only when all milestones in current stage are APPROVED.
     */
    @PostMapping("/{id}/advance-stage")
    public ResponseEntity<?> advanceStage(@PathVariable Long id) {
        try {
            ProjectResponseDTO project = projectService.advanceStage(id);
            return ResponseEntity.ok(project);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Not Found", "message", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
                    .body(Map.of("error", "Precondition Failed", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to advance stage for project ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal Server Error", "message", e.getMessage()));
        }
    }
}
