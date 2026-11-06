package org.civicsolve.challenge.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.time.OffsetDateTime;

/**
 * Domain Event published whenever a new challenge is submitted.
 * Consumed asynchronously by the AI Gateway to perform automatic classification,
 * duplicate detection, and priority scoring (Step 17).
 */
@Getter
@Builder
@ToString
@AllArgsConstructor
public class ChallengeSubmittedEvent {

    private final Long challengeId;
    private final Long userId;
    private final String title;
    private final String description;
    private final Double lat;
    private final Double lon;
    private final String district;
    private final Integer reportedPopulation;
    private final OffsetDateTime submittedAt;
}
