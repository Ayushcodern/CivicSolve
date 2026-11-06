package org.civicsolve.moderation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.civicsolve.challenge.Challenge;
import org.civicsolve.challenge.ChallengeEvidence;
import org.civicsolve.challenge.ChallengeEvidenceRepository;
import org.civicsolve.challenge.ChallengeRepository;
import org.civicsolve.challenge.ChallengeStatus;
import org.civicsolve.challenge.dto.ChallengeResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

/**
 * CivicSolve — Moderation Service
 * Business logic for approving, rejecting, or merging challenges with an immutable audit log.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ModerationService {

    private final ChallengeRepository challengeRepository;
    private final ModeratorAuditRepository auditRepository;
    private final ChallengeEvidenceRepository evidenceRepository;

    /**
     * Retrieve challenges pending human moderation (AI_ANALYZED or flagged duplicates).
     */
    @Transactional(readOnly = true)
    public Page<ChallengeResponseDTO> getModerationQueue(Pageable pageable) {
        Page<Challenge> queue = challengeRepository.findModerationQueue(pageable);

        return queue.map(c -> {
            ChallengeResponseDTO dto = ChallengeResponseDTO.fromEntity(c);
            List<String> urls = evidenceRepository.findByChallengeId(c.getChallengeId())
                    .stream()
                    .map(ChallengeEvidence::getFilePath)
                    .collect(Collectors.toList());
            dto.setEvidenceUrls(urls);
            return dto;
        });
    }

    /**
     * Validates a challenge, moving status to 'VALIDATED' and writing an audit log.
     */
    @Transactional
    public ChallengeResponseDTO validateChallenge(Long challengeId, Long moderatorId, String reason) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new NoSuchElementException("Challenge not found with ID: " + challengeId));

        challenge.setStatus(ChallengeStatus.VALIDATED);
        Challenge saved = challengeRepository.save(challenge);

        ModeratorAudit audit = ModeratorAudit.builder()
                .challengeId(challengeId)
                .moderatorId(moderatorId)
                .action(ModerationAction.VALIDATE)
                .reason(reason != null && !reason.isBlank() ? reason.trim() : "Approved by state review moderator.")
                .build();
        auditRepository.save(audit);

        log.info("Moderator ID={} validated challenge ID={}. Audit ID={}",
                moderatorId, challengeId, audit.getAuditId());

        return toDtoWithEvidence(saved);
    }

    /**
     * Rejects a challenge (spam, invalid, out of scope) with audit log.
     */
    @Transactional
    public ChallengeResponseDTO rejectChallenge(Long challengeId, Long moderatorId, String reason) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new NoSuchElementException("Challenge not found with ID: " + challengeId));

        challenge.setStatus(ChallengeStatus.REJECTED);
        Challenge saved = challengeRepository.save(challenge);

        ModeratorAudit audit = ModeratorAudit.builder()
                .challengeId(challengeId)
                .moderatorId(moderatorId)
                .action(ModerationAction.REJECT)
                .reason(reason != null && !reason.isBlank() ? reason.trim() : "Rejected by moderator.")
                .build();
        auditRepository.save(audit);

        log.info("Moderator ID={} rejected challenge ID={}. Reason: '{}'",
                moderatorId, challengeId, audit.getReason());

        return toDtoWithEvidence(saved);
    }

    /**
     * Merges a duplicate challenge into a parent challenge.
     * Sets child status to 'MERGED', links duplicateOfId, and aggregates population counts.
     */
    @Transactional
    public ChallengeResponseDTO mergeChallenge(Long childId, Long parentId, Long moderatorId, String reason) {
        if (childId.equals(parentId)) {
            throw new IllegalArgumentException("Cannot merge a challenge into itself.");
        }

        Challenge child = challengeRepository.findById(childId)
                .orElseThrow(() -> new NoSuchElementException("Duplicate challenge not found with ID: " + childId));

        Challenge parent = challengeRepository.findById(parentId)
                .orElseThrow(() -> new NoSuchElementException("Parent challenge not found with ID: " + parentId));

        // Link child to parent
        child.setStatus(ChallengeStatus.MERGED);
        child.setDuplicateOfId(parentId);

        // Aggregate reported population into parent
        int childPop = child.getReportedPopulation() != null ? child.getReportedPopulation() : 0;
        int parentPop = parent.getReportedPopulation() != null ? parent.getReportedPopulation() : 0;
        parent.setReportedPopulation(parentPop + childPop);

        challengeRepository.save(parent);
        Challenge savedChild = challengeRepository.save(child);

        ModeratorAudit audit = ModeratorAudit.builder()
                .challengeId(childId)
                .moderatorId(moderatorId)
                .action(ModerationAction.MERGE)
                .reason(String.format("Merged into parent challenge #%d: %s", parentId, reason))
                .build();
        auditRepository.save(audit);

        log.info("Moderator ID={} merged challenge ID={} into parent ID={}",
                moderatorId, childId, parentId);

        return toDtoWithEvidence(savedChild);
    }

    private ChallengeResponseDTO toDtoWithEvidence(Challenge challenge) {
        ChallengeResponseDTO dto = ChallengeResponseDTO.fromEntity(challenge);
        List<String> urls = evidenceRepository.findByChallengeId(challenge.getChallengeId())
                .stream()
                .map(ChallengeEvidence::getFilePath)
                .collect(Collectors.toList());
        dto.setEvidenceUrls(urls);
        return dto;
    }
}
