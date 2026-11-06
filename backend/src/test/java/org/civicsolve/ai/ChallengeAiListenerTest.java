package org.civicsolve.ai;

import org.civicsolve.ai.dto.AiClassifyResponse;
import org.civicsolve.ai.dto.AiPriorityResponse;
import org.civicsolve.challenge.Challenge;
import org.civicsolve.challenge.ChallengeRepository;
import org.civicsolve.challenge.ChallengeStatus;
import org.civicsolve.challenge.GeometryUtil;
import org.civicsolve.challenge.event.ChallengeSubmittedEvent;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChallengeAiListenerTest {

    @Mock
    private ChallengeRepository challengeRepository;

    @Mock
    private AiGatewayService aiGatewayService;

    @InjectMocks
    private ChallengeAiListener aiListener;

    @Test
    void testOnChallengeSubmittedPerformsAiAnalysisAndUpdatesStatusToAiAnalyzed() {
        Long challengeId = 10L;
        Challenge challenge = Challenge.builder()
                .challengeId(challengeId)
                .userId(1L)
                .title("Handpump dispenses yellowish mud water")
                .description("School children have developed illness from drinking this water.")
                .location(GeometryUtil.createPoint(22.8214, 75.8956))
                .district("Indore")
                .status(ChallengeStatus.SUBMITTED)
                .reportedPopulation(1200)
                .build();

        when(challengeRepository.findById(challengeId)).thenReturn(Optional.of(challenge));
        when(challengeRepository.findNearbyCandidates(anyLong(), any(), anyDouble())).thenReturn(Collections.emptyList());

        // Mock AI classify response
        AiClassifyResponse classifyRes = AiClassifyResponse.builder()
                .domain("Water Supply")
                .subDomain("Groundwater Quality")
                .confidence(0.92)
                .keywords(List.of("handpump", "water", "mud", "school"))
                .build();
        when(aiGatewayService.classify(anyString(), anyString())).thenReturn(classifyRes);

        // Mock AI priority response
        AiPriorityResponse priorityRes = AiPriorityResponse.builder()
                .priorityScore(88.5)
                .tier("CRITICAL")
                .explanation("CRITICAL priority: Active health hazard, 1200 affected")
                .build();
        when(aiGatewayService.calculatePriority(anyDouble(), anyInt(), anyInt(), anyBoolean(), anyString()))
                .thenReturn(priorityRes);

        // Trigger listener
        ChallengeSubmittedEvent event = ChallengeSubmittedEvent.builder()
                .challengeId(challengeId)
                .userId(1L)
                .title(challenge.getTitle())
                .description(challenge.getDescription())
                .lat(22.8214)
                .lon(75.8956)
                .district("Indore")
                .reportedPopulation(1200)
                .submittedAt(OffsetDateTime.now())
                .build();

        aiListener.onChallengeSubmitted(event);

        // Verify challenge was updated and saved
        ArgumentCaptor<Challenge> captor = ArgumentCaptor.forClass(Challenge.class);
        verify(challengeRepository).save(captor.capture());

        Challenge updated = captor.getValue();
        assertEquals(ChallengeStatus.AI_ANALYZED, updated.getStatus());
        assertEquals("Water Supply", updated.getDomain());
        assertEquals("Groundwater Quality", updated.getSubDomain());
        assertEquals(88.5, updated.getPriorityScore());
        assertEquals("CRITICAL priority: Active health hazard, 1200 affected", updated.getPriorityExplanation());
    }

    @Test
    void testFallbackAppliedWhenAiServiceThrowsException() {
        Long challengeId = 20L;
        Challenge challenge = Challenge.builder()
                .challengeId(challengeId)
                .title("Road washed out")
                .description("Potholes.")
                .location(GeometryUtil.createPoint(22.0, 75.0))
                .district("Dhar")
                .status(ChallengeStatus.SUBMITTED)
                .build();

        when(challengeRepository.findById(challengeId)).thenReturn(Optional.of(challenge));
        when(aiGatewayService.classify(any(), any())).thenThrow(new RuntimeException("AI service unavailable"));

        ChallengeSubmittedEvent event = ChallengeSubmittedEvent.builder()
                .challengeId(challengeId)
                .title("Road washed out")
                .description("Potholes.")
                .build();

        aiListener.onChallengeSubmitted(event);

        // Verify fallback transitions to AI_ANALYZED
        ArgumentCaptor<Challenge> captor = ArgumentCaptor.forClass(Challenge.class);
        verify(challengeRepository).save(captor.capture());
        Challenge saved = captor.getValue();
        assertEquals(ChallengeStatus.AI_ANALYZED, saved.getStatus());
        assertNotNull(saved.getPriorityScore());
    }
}
