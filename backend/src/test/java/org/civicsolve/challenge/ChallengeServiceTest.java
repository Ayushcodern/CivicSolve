package org.civicsolve.challenge;

import org.civicsolve.challenge.dto.ChallengeIntakeDTO;
import org.civicsolve.challenge.dto.ChallengeResponseDTO;
import org.civicsolve.challenge.event.ChallengeSubmittedEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChallengeServiceTest {

    @Mock
    private ChallengeRepository challengeRepository;

    @Mock
    private ChallengeEvidenceRepository evidenceRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private ChallengeService challengeService;

    @TempDir
    Path tempUploadDir;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(challengeService, "uploadDir", tempUploadDir.toString());
    }

    @Test
    void testSubmitChallengeSavesSubmittedStatusAndPublishesEvent() {
        ChallengeIntakeDTO intake = ChallengeIntakeDTO.builder()
                .title("Handpump broken in school")
                .description("No water available.")
                .lat(22.8214)
                .lon(75.8956)
                .district("Indore")
                .villageOrWard("Sanwer")
                .reportedPopulation(600)
                .domain("Water Supply")
                .build();

        MockMultipartFile photo = new MockMultipartFile(
                "photos",
                "test.jpg",
                "image/jpeg",
                "dummy image content".getBytes()
        );

        when(challengeRepository.save(any(Challenge.class))).thenAnswer(invocation -> {
            Challenge c = invocation.getArgument(0);
            c.setChallengeId(101L);
            return c;
        });

        ChallengeResponseDTO response = challengeService.submitChallenge(intake, List.of(photo), 1L);

        assertNotNull(response);
        assertEquals(101L, response.getChallengeId());
        assertEquals("Handpump broken in school", response.getTitle());
        assertEquals(ChallengeStatus.SUBMITTED, response.getStatus());
        assertEquals(22.8214, response.getLat(), 0.0001);
        assertEquals(75.8956, response.getLon(), 0.0001);
        assertEquals(1, response.getEvidenceUrls().size());

        // Verify photo evidence saved
        verify(evidenceRepository, times(1)).save(any(ChallengeEvidence.class));

        // Verify domain event emitted
        ArgumentCaptor<ChallengeSubmittedEvent> eventCaptor = ArgumentCaptor.forClass(ChallengeSubmittedEvent.class);
        verify(eventPublisher, times(1)).publishEvent(eventCaptor.capture());
        ChallengeSubmittedEvent event = eventCaptor.getValue();
        assertEquals(101L, event.getChallengeId());
        assertEquals("Handpump broken in school", event.getTitle());
    }

    @Test
    void testSubmitChallengeWithMoreThanFivePhotosThrowsException() {
        ChallengeIntakeDTO intake = ChallengeIntakeDTO.builder()
                .title("Road damaged")
                .description("Potholes.")
                .lat(22.0)
                .lon(75.0)
                .district("Indore")
                .build();

        List<MultipartFile> sixPhotos = new ArrayList<>();
        for (int i = 0; i < 6; i++) {
            sixPhotos.add(new MockMultipartFile("photos", "img" + i + ".jpg", "image/jpeg", "content".getBytes()));
        }

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                challengeService.submitChallenge(intake, sixPhotos, 1L)
        );

        assertTrue(ex.getMessage().contains("Maximum of 5 photos"));
        verify(challengeRepository, never()).save(any());
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void testGetChallengeByIdReturnsDetails() {
        Challenge challenge = Challenge.builder()
                .challengeId(200L)
                .userId(1L)
                .title("Water pipeline leak")
                .description("Leakage on street.")
                .location(GeometryUtil.createPoint(22.7, 75.8))
                .district("Indore")
                .status(ChallengeStatus.SUBMITTED)
                .build();

        when(challengeRepository.findById(200L)).thenReturn(Optional.of(challenge));
        when(evidenceRepository.findByChallengeId(200L)).thenReturn(Collections.emptyList());

        ChallengeResponseDTO dto = challengeService.getChallengeById(200L);

        assertNotNull(dto);
        assertEquals(200L, dto.getChallengeId());
        assertEquals("Water pipeline leak", dto.getTitle());
        assertEquals(22.7, dto.getLat(), 0.0001);
    }
}
