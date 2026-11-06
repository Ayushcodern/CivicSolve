package org.civicsolve.moderation;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.civicsolve.challenge.dto.ChallengeResponseDTO;
import org.civicsolve.moderation.dto.MergeRequest;
import org.civicsolve.moderation.dto.ModerationActionRequest;
import org.civicsolve.user.User;
import org.civicsolve.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.NoSuchElementException;

/**
 * CivicSolve — Moderator REST Controller
 * Guarded by @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')").
 * Handles review queue, challenge validation, rejection, and duplicate merging.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/moderator")
@PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
@RequiredArgsConstructor
public class ModerationController {

    private final ModerationService moderationService;
    private final UserRepository userRepository;

    /**
     * List challenges pending review in 'AI_ANALYZED' status or flagged duplicates.
     */
    @GetMapping("/queue")
    public ResponseEntity<Page<ChallengeResponseDTO>> getModerationQueue(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "priorityScore,desc") String sort
    ) {
        String[] sortParams = sort.split(",");
        Sort.Direction direction = (sortParams.length > 1 && "asc".equalsIgnoreCase(sortParams[1]))
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        String property = sortParams[0];

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, property));
        Page<ChallengeResponseDTO> queue = moderationService.getModerationQueue(pageable);
        return ResponseEntity.ok(queue);
    }

    /**
     * Approves challenge, setting status to 'VALIDATED' and writing an audit log.
     */
    @PostMapping("/{id}/validate")
    public ResponseEntity<?> validateChallenge(
            @PathVariable("id") Long id,
            @RequestBody(required = false) ModerationActionRequest request,
            Authentication authentication
    ) {
        try {
            Long moderatorId = resolveModeratorId(authentication);
            String reason = request != null ? request.getReason() : "Approved by moderator.";
            ChallengeResponseDTO response = moderationService.validateChallenge(id, moderatorId, reason);
            return ResponseEntity.ok(response);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Not Found", "message", ex.getMessage()));
        }
    }

    /**
     * Rejects challenge with mandatory reason and writes an audit log.
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectChallenge(
            @PathVariable("id") Long id,
            @Valid @RequestBody ModerationActionRequest request,
            Authentication authentication
    ) {
        try {
            Long moderatorId = resolveModeratorId(authentication);
            ChallengeResponseDTO response = moderationService.rejectChallenge(id, moderatorId, request.getReason());
            return ResponseEntity.ok(response);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Not Found", "message", ex.getMessage()));
        }
    }

    /**
     * Merges a duplicate challenge into a parent challenge, aggregating report counts.
     */
    @PostMapping("/{id}/merge")
    public ResponseEntity<?> mergeChallenge(
            @PathVariable("id") Long id,
            @Valid @RequestBody MergeRequest request,
            Authentication authentication
    ) {
        try {
            Long moderatorId = resolveModeratorId(authentication);
            ChallengeResponseDTO response = moderationService.mergeChallenge(
                    id,
                    request.getParentChallengeId(),
                    moderatorId,
                    request.getReason()
            );
            return ResponseEntity.ok(response);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Not Found", "message", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Bad Request", "message", ex.getMessage()));
        }
    }

    private Long resolveModeratorId(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            return userRepository.findByEmail(authentication.getName())
                    .map(User::getUserId)
                    .orElse(4L);
        }
        return 4L; // Default to seeded State Review Moderator
    }
}
