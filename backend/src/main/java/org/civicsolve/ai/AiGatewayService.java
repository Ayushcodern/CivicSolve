package org.civicsolve.ai;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.civicsolve.ai.dto.*;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;

/**
 * Gateway client service for interacting with the FastAPI AI microservice endpoints:
 *   - POST /api/v1/ai/classify
 *   - POST /api/v1/ai/duplicates
 *   - POST /api/v1/ai/priority
 *   - POST /api/v1/ai/match
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiGatewayService {

    private final RestClient aiRestClient;

    /**
     * Classifies a challenge into domain and sub-domain with confidence and keywords.
     */
    public AiClassifyResponse classify(String title, String description) {
        try {
            AiClassifyRequest request = AiClassifyRequest.builder()
                    .title(title)
                    .description(description)
                    .build();

            return aiRestClient.post()
                    .uri("/api/v1/ai/classify")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(AiClassifyResponse.class);
        } catch (RestClientException ex) {
            log.error("AI classify call failed: {}", ex.getMessage());
            return null;
        }
    }

    /**
     * Finds nearby duplicate challenges using semantic cosine similarity and distance.
     */
    public AiDuplicateResponse checkDuplicates(
            AiChallengeItem newChallenge,
            List<AiChallengeItem> candidates,
            Double threshold
    ) {
        try {
            AiDuplicateRequest request = AiDuplicateRequest.builder()
                    .newChallenge(newChallenge)
                    .candidates(candidates)
                    .threshold(threshold != null ? threshold : 0.75)
                    .build();

            return aiRestClient.post()
                    .uri("/api/v1/ai/duplicates")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(AiDuplicateResponse.class);
        } catch (RestClientException ex) {
            log.error("AI duplicate check call failed: {}", ex.getMessage());
            return null;
        }
    }

    /**
     * Calculates mathematical priority score (0-100) with explainability.
     */
    public AiPriorityResponse calculatePriority(
            double severity,
            int population,
            int recurrenceCount,
            boolean healthHazard,
            String text
    ) {
        try {
            AiPriorityRequest request = AiPriorityRequest.builder()
                    .severity(severity)
                    .population(population)
                    .recurrenceCount(recurrenceCount)
                    .healthHazard(healthHazard)
                    .text(text)
                    .build();

            return aiRestClient.post()
                    .uri("/api/v1/ai/priority")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(AiPriorityResponse.class);
        } catch (RestClientException ex) {
            log.error("AI priority calculation call failed: {}", ex.getMessage());
            return null;
        }
    }

    /**
     * Recommends and ranks universities and mentors matching challenge needs.
     */
    public AiMatchResponse matchInstitutions(AiMatchRequest request) {
        try {
            return aiRestClient.post()
                    .uri("/api/v1/ai/match")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(AiMatchResponse.class);
        } catch (RestClientException ex) {
            log.error("AI institution match call failed: {}", ex.getMessage());
            return null;
        }
    }
}
