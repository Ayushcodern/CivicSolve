package org.civicsolve.challenge;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.civicsolve.challenge.dto.ChallengeIntakeDTO;
import org.civicsolve.challenge.dto.ChallengeResponseDTO;
import org.civicsolve.user.User;
import org.civicsolve.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

/**
 * CivicSolve — Challenge REST Controller
 * Endpoints for submitting civic problems with photo evidence and querying challenges.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/challenges")
@RequiredArgsConstructor
public class ChallengeController {

    private final ChallengeService challengeService;
    private final UserRepository userRepository;

    /**
     * Submit a challenge with multipart metadata and up to 5 photos.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> submitChallengeMultipart(
            @RequestPart("challenge") @Valid ChallengeIntakeDTO intakeDTO,
            @RequestPart(value = "photos", required = false) List<MultipartFile> photos,
            Authentication authentication
    ) {
        try {
            Long userId = resolveUserId(authentication);
            ChallengeResponseDTO response = challengeService.submitChallenge(intakeDTO, photos, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", "Bad Request", "message", ex.getMessage()));
        }
    }

    /**
     * Submit a challenge via pure JSON (convenience for programmatic / API clients without files).
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> submitChallengeJson(
            @Valid @RequestBody ChallengeIntakeDTO intakeDTO,
            Authentication authentication
    ) {
        try {
            Long userId = resolveUserId(authentication);
            ChallengeResponseDTO response = challengeService.submitChallenge(intakeDTO, null, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", "Bad Request", "message", ex.getMessage()));
        }
    }

    /**
     * Browse paginated challenges with optional domain, status, and district filters.
     */
    @GetMapping
    public ResponseEntity<Page<ChallengeResponseDTO>> getChallenges(
            @RequestParam(required = false) String domain,
            @RequestParam(required = false) ChallengeStatus status,
            @RequestParam(required = false) String district,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        String[] sortParams = sort.split(",");
        Sort.Direction direction = (sortParams.length > 1 && "asc".equalsIgnoreCase(sortParams[1]))
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        String property = sortParams[0];

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, property));
        Page<ChallengeResponseDTO> result = challengeService.getChallenges(domain, status, district, pageable);
        return ResponseEntity.ok(result);
    }

    /**
     * Get complete details of a specific challenge by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getChallengeById(@PathVariable("id") Long id) {
        try {
            ChallengeResponseDTO response = challengeService.getChallengeById(id);
            return ResponseEntity.ok(response);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Not Found", "message", ex.getMessage()));
        }
    }

    private Long resolveUserId(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            return userRepository.findByEmail(authentication.getName())
                    .map(User::getUserId)
                    .orElse(1L);
        }
        return 1L; // Fallback to Citizen 1 (Ramesh Patel)
    }
}
