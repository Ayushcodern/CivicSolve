package org.civicsolve.moderation;

import org.civicsolve.challenge.Challenge;
import org.civicsolve.challenge.ChallengeEvidenceRepository;
import org.civicsolve.challenge.ChallengeRepository;
import org.civicsolve.challenge.ChallengeStatus;
import org.civicsolve.challenge.GeometryUtil;
import org.civicsolve.challenge.dto.ChallengeResponseDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ModerationServiceTest {

    @Mock
    private ChallengeRepository challengeRepository;

    @Mock
    private ModeratorAuditRepository auditRepository;

    @Mock
    private ChallengeEvidenceRepository evidenceRepository;

    @InjectMocks
    private ModerationService moderationService;

    @Test
    void testValidateChallengeMovesStatusToValidatedAndWritesAudit() {
        Long challengeId = 100L;
        Challenge challenge = Challenge.builder()
                .challengeId(challengeId)
                .title("Muddy handpump water")
                .status(ChallengeStatus.AI_ANALYZED)
                .location(GeometryUtil.createPoint(22.8, 75.8))
                .build();

        when(challengeRepository.findById(challengeId)).thenReturn(Optional.of(challenge));
        when(challengeRepository.save(any(Challenge.class))).thenAnswer(i -> i.getArgument(0));
        when(evidenceRepository.findByChallengeId(challengeId)).thenReturn(Collections.emptyList());

        ChallengeResponseDTO response = moderationService.validateChallenge(challengeId, 4L, "Verified with sarpanch.");

        assertNotNull(response);
        assertEquals(ChallengeStatus.VALIDATED, response.getStatus());

        // Verify audit log created
        ArgumentCaptor<ModeratorAudit> auditCaptor = ArgumentCaptor.forClass(ModeratorAudit.class);
        verify(auditRepository).save(auditCaptor.capture());
        ModeratorAudit audit = auditCaptor.getValue();
        assertEquals(challengeId, audit.getChallengeId());
        assertEquals(4L, audit.getModeratorId());
        assertEquals(ModerationAction.VALIDATE, audit.getAction());
        assertEquals("Verified with sarpanch.", audit.getReason());
    }

    @Test
    void testRejectChallengeMovesStatusToRejected() {
        Long challengeId = 101L;
        Challenge challenge = Challenge.builder()
                .challengeId(challengeId)
                .title("Spam post")
                .status(ChallengeStatus.SUBMITTED)
                .location(GeometryUtil.createPoint(22.8, 75.8))
                .build();

        when(challengeRepository.findById(challengeId)).thenReturn(Optional.of(challenge));
        when(challengeRepository.save(any(Challenge.class))).thenAnswer(i -> i.getArgument(0));
        when(evidenceRepository.findByChallengeId(challengeId)).thenReturn(Collections.emptyList());

        ChallengeResponseDTO response = moderationService.rejectChallenge(challengeId, 4L, "Commercial advertisement.");

        assertNotNull(response);
        assertEquals(ChallengeStatus.REJECTED, response.getStatus());

        ArgumentCaptor<ModeratorAudit> auditCaptor = ArgumentCaptor.forClass(ModeratorAudit.class);
        verify(auditRepository).save(auditCaptor.capture());
        assertEquals(ModerationAction.REJECT, auditCaptor.getValue().getAction());
    }

    @Test
    void testMergeChallengeLinksDuplicateAndAggregatesPopulation() {
        Long childId = 201L;
        Long parentId = 200L;

        Challenge child = Challenge.builder()
                .challengeId(childId)
                .title("Handpump leak duplicate")
                .status(ChallengeStatus.AI_ANALYZED)
                .reportedPopulation(300)
                .location(GeometryUtil.createPoint(22.8, 75.8))
                .build();

        Challenge parent = Challenge.builder()
                .challengeId(parentId)
                .title("Primary handpump leak")
                .status(ChallengeStatus.VALIDATED)
                .reportedPopulation(1200)
                .location(GeometryUtil.createPoint(22.8, 75.8))
                .build();

        when(challengeRepository.findById(childId)).thenReturn(Optional.of(child));
        when(challengeRepository.findById(parentId)).thenReturn(Optional.of(parent));
        when(challengeRepository.save(any(Challenge.class))).thenAnswer(i -> i.getArgument(0));
        when(evidenceRepository.findByChallengeId(childId)).thenReturn(Collections.emptyList());

        ChallengeResponseDTO response = moderationService.mergeChallenge(childId, parentId, 4L, "Duplicate report of main issue.");

        assertNotNull(response);
        assertEquals(ChallengeStatus.MERGED, response.getStatus());
        assertEquals(parentId, response.getDuplicateOfId());

        // Verify parent population aggregated: 1200 + 300 = 1500
        assertEquals(1500, parent.getReportedPopulation());
        verify(challengeRepository, times(2)).save(any(Challenge.class));

        // Verify audit log
        verify(auditRepository).save(any(ModeratorAudit.class));
    }
}
