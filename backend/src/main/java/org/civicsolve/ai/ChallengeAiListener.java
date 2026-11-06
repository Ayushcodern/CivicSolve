package org.civicsolve.ai;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.civicsolve.ai.dto.AiChallengeItem;
import org.civicsolve.ai.dto.AiClassifyResponse;
import org.civicsolve.ai.dto.AiDuplicateResponse;
import org.civicsolve.ai.dto.AiPriorityResponse;
import org.civicsolve.challenge.Challenge;
import org.civicsolve.challenge.ChallengeRepository;
import org.civicsolve.challenge.ChallengeStatus;
import org.civicsolve.challenge.event.ChallengeSubmittedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * CivicSolve — Asynchronous AI Pipeline Listener
 *
 * Listens for ChallengeSubmittedEvent, invokes FastAPI AI microservice endpoints:
 *   1. Classify: domain and sub-domain prediction
 *   2. Duplicate: nearby duplicate detection
 *   3. Priority: explainable priority score calculation
 *
 * Updates challenge status to 'AI_ANALYZED'.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ChallengeAiListener {

    private final ChallengeRepository challengeRepository;
    private final AiGatewayService aiGatewayService;

    @Async
    @EventListener
    @Transactional
    public void onChallengeSubmitted(ChallengeSubmittedEvent event) {
        Long challengeId = event.getChallengeId();
        log.info("Starting background AI analysis for challenge ID={}", challengeId);

        Challenge challenge = challengeRepository.findById(challengeId).orElse(null);
        if (challenge == null) {
            log.warn("Challenge ID={} not found during async AI analysis", challengeId);
            return;
        }

        try {
            // ── 1. Domain Classification ──────────────────────────
            String title = challenge.getTitle();
            String description = challenge.getDescription();

            AiClassifyResponse classifyRes = aiGatewayService.classify(title, description);
            if (classifyRes != null && classifyRes.getDomain() != null) {
                if (challenge.getDomain() == null || challenge.getDomain().isBlank()) {
                    challenge.setDomain(classifyRes.getDomain());
                }
                if (challenge.getSubDomain() == null || challenge.getSubDomain().isBlank()) {
                    challenge.setSubDomain(classifyRes.getSubDomain());
                }
                log.info("AI classified challenge ID={}: domain={}, subDomain={}",
                        challengeId, challenge.getDomain(), challenge.getSubDomain());
            }

            // ── 2. Duplicate Detection ────────────────────────────
            List<Challenge> nearbyCandidates = challengeRepository.findNearbyCandidates(
                    challenge.getChallengeId(),
                    challenge.getLocation(),
                    5000.0 // 5km search radius
            );

            int recurrenceCount = 1;
            if (nearbyCandidates != null && !nearbyCandidates.isEmpty()) {
                recurrenceCount += nearbyCandidates.size();

                AiChallengeItem newChItem = AiChallengeItem.builder()
                        .id(challenge.getChallengeId())
                        .title(challenge.getTitle())
                        .description(challenge.getDescription())
                        .lat(challenge.getLocation().getY())
                        .lon(challenge.getLocation().getX())
                        .build();

                List<AiChallengeItem> candidateItems = nearbyCandidates.stream()
                        .map(c -> AiChallengeItem.builder()
                                .id(c.getChallengeId())
                                .title(c.getTitle())
                                .description(c.getDescription())
                                .lat(c.getLocation().getY())
                                .lon(c.getLocation().getX())
                                .build())
                        .collect(Collectors.toList());

                AiDuplicateResponse dupRes = aiGatewayService.checkDuplicates(newChItem, candidateItems, 0.75);
                if (dupRes != null && dupRes.getMatches() != null && !dupRes.getMatches().isEmpty()) {
                    Object primaryDuplicateId = dupRes.getMatches().get(0).getId();
                    if (primaryDuplicateId instanceof Number) {
                        challenge.setDuplicateOfId(((Number) primaryDuplicateId).longValue());
                        log.info("Flagged challenge ID={} as duplicate of challenge ID={}",
                                challengeId, challenge.getDuplicateOfId());
                    }
                }
            }

            // ── 3. Priority Scoring ───────────────────────────────
            boolean healthHazard = checkHealthHazard(title, description, challenge.getDomain());
            double severity = estimateSeverity(description, healthHazard, recurrenceCount);
            int population = challenge.getReportedPopulation() != null ? challenge.getReportedPopulation() : 0;
            String contextText = title + ". " + description;

            AiPriorityResponse priorityRes = aiGatewayService.calculatePriority(
                    severity,
                    population,
                    recurrenceCount,
                    healthHazard,
                    contextText
            );

            if (priorityRes != null && priorityRes.getPriorityScore() != null) {
                challenge.setPriorityScore(priorityRes.getPriorityScore());
                challenge.setPriorityExplanation(priorityRes.getExplanation());
            } else {
                // Fallback priority calculation if AI microservice offline
                applyFallbackPriority(challenge, severity, population, recurrenceCount, healthHazard);
            }

            // ── 4. Transition to AI_ANALYZED ──────────────────────
            challenge.setStatus(ChallengeStatus.AI_ANALYZED);
            challengeRepository.save(challenge);
            log.info("Challenge ID={} successfully updated to AI_ANALYZED with priority={}",
                    challengeId, challenge.getPriorityScore());

        } catch (Exception ex) {
            log.error("AI analysis encountered error for challenge ID={}: {}", challengeId, ex.getMessage(), ex);
            applyFullFallback(challenge);
        }
    }

    private boolean checkHealthHazard(String title, String description, String domain) {
        String combined = (title + " " + description + " " + (domain != null ? domain : "")).toLowerCase();
        List<String> hazardKeywords = List.of(
                "muddy", "yellowish", "contamination", "illness", "sick", "vomit",
                "cholera", "dengue", "malaria", "poison", "deadly", "stench",
                "hospital", "vaccine", "spoiled", "fever", "diarrhea"
        );
        return hazardKeywords.stream().anyMatch(combined::contains);
    }

    private double estimateSeverity(String description, boolean healthHazard, int recurrenceCount) {
        double sev = 0.60;
        if (healthHazard) {
            sev += 0.25;
        }
        if (recurrenceCount >= 5) {
            sev += 0.10;
        }
        return Math.min(1.0, sev);
    }

    private void applyFallbackPriority(
            Challenge challenge,
            double severity,
            int population,
            int recurrenceCount,
            boolean healthHazard
    ) {
        double popTerm = Math.min(1.0, Math.log10(population + 1) / 4.0);
        double recFactor = Math.min(1.0, recurrenceCount / 10.0);
        double hhFactor = healthHazard ? 1.0 : 0.0;

        double score = Math.min(100.0, 100.0 * (0.35 * severity + 0.25 * popTerm + 0.20 * recFactor + 0.20 * hhFactor));
        challenge.setPriorityScore(Math.round(score * 100.0) / 100.0);
        challenge.setPriorityExplanation(String.format(
                "Rule-based fallback priority: severity=%.2f, pop=%d, recurrence=%d, healthHazard=%b",
                severity, population, recurrenceCount, healthHazard
        ));
    }

    private void applyFullFallback(Challenge challenge) {
        if (challenge.getDomain() == null || challenge.getDomain().isBlank()) {
            challenge.setDomain("Civic Infrastructure");
        }
        if (challenge.getPriorityScore() == null) {
            challenge.setPriorityScore(50.0);
            challenge.setPriorityExplanation("Default priority score applied during fallback.");
        }
        challenge.setStatus(ChallengeStatus.AI_ANALYZED);
        challengeRepository.save(challenge);
    }
}
