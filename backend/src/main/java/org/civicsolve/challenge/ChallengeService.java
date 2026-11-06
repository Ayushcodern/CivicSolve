package org.civicsolve.challenge;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.civicsolve.challenge.dto.ChallengeIntakeDTO;
import org.civicsolve.challenge.dto.ChallengeResponseDTO;
import org.civicsolve.challenge.event.ChallengeSubmittedEvent;
import org.locationtech.jts.geom.Point;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * CivicSolve — Challenge Business Service
 * Handles problem intake, file evidence uploads, domain event dispatching,
 * and paginated queries.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final ChallengeEvidenceRepository evidenceRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Value("${application.upload.dir:uploads}")
    private String uploadDir;

    /**
     * Submits a new challenge report with optional photographic evidence.
     * Status is set to SUBMITTED and a ChallengeSubmittedEvent is emitted asynchronously.
     */
    @Transactional
    public ChallengeResponseDTO submitChallenge(
            ChallengeIntakeDTO intakeDTO,
            List<MultipartFile> photos,
            Long userId
    ) {
        if (photos != null && photos.size() > 5) {
            throw new IllegalArgumentException("Maximum of 5 photos can be uploaded per challenge submission.");
        }

        Point location = GeometryUtil.createPoint(intakeDTO.getLat(), intakeDTO.getLon());

        Challenge challenge = Challenge.builder()
                .userId(userId != null ? userId : 1L) // Default to citizen user id 1
                .title(intakeDTO.getTitle().trim())
                .description(intakeDTO.getDescription().trim())
                .domain(intakeDTO.getDomain())
                .subDomain(intakeDTO.getSubDomain())
                .status(ChallengeStatus.SUBMITTED)
                .location(location)
                .district(intakeDTO.getDistrict().trim())
                .villageOrWard(intakeDTO.getVillageOrWard())
                .reportedPopulation(intakeDTO.getReportedPopulation() != null ? intakeDTO.getReportedPopulation() : 0)
                .build();

        Challenge saved = challengeRepository.save(challenge);
        log.info("Challenge submitted with ID={}: '{}' at district={}", saved.getChallengeId(), saved.getTitle(), saved.getDistrict());

        // Process photo evidence
        List<String> evidenceUrls = new ArrayList<>();
        if (photos != null && !photos.isEmpty()) {
            Path uploadPath = Paths.get(uploadDir);
            try {
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
            } catch (IOException e) {
                log.error("Failed to create upload directory: {}", uploadDir, e);
                throw new RuntimeException("Could not initialize upload directory", e);
            }

            for (MultipartFile photo : photos) {
                if (photo != null && !photo.isEmpty()) {
                    String originalFilename = photo.getOriginalFilename() != null ? photo.getOriginalFilename() : "photo.jpg";
                    String sanitized = originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_");
                    String uniqueFilename = UUID.randomUUID() + "_" + sanitized;
                    Path targetFile = uploadPath.resolve(uniqueFilename);

                    try {
                        Files.copy(photo.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);
                    } catch (IOException e) {
                        log.error("Failed to store file: {}", originalFilename, e);
                        throw new RuntimeException("Failed to store uploaded photo", e);
                    }

                    String relativePath = "uploads/" + uniqueFilename;
                    ChallengeEvidence evidence = ChallengeEvidence.builder()
                            .challengeId(saved.getChallengeId())
                            .filePath(relativePath)
                            .fileType("IMAGE")
                            .caption(sanitized)
                            .build();

                    evidenceRepository.save(evidence);
                    evidenceUrls.add(relativePath);
                }
            }
        }

        // Emit ChallengeSubmittedEvent asynchronously for AI pipeline
        ChallengeSubmittedEvent event = ChallengeSubmittedEvent.builder()
                .challengeId(saved.getChallengeId())
                .userId(saved.getUserId())
                .title(saved.getTitle())
                .description(saved.getDescription())
                .lat(intakeDTO.getLat())
                .lon(intakeDTO.getLon())
                .district(saved.getDistrict())
                .reportedPopulation(saved.getReportedPopulation())
                .submittedAt(saved.getCreatedAt() != null ? saved.getCreatedAt() : OffsetDateTime.now())
                .build();

        eventPublisher.publishEvent(event);
        log.info("Published ChallengeSubmittedEvent for challenge ID={}", saved.getChallengeId());

        ChallengeResponseDTO responseDTO = ChallengeResponseDTO.fromEntity(saved);
        responseDTO.setEvidenceUrls(evidenceUrls);
        return responseDTO;
    }

    /**
     * Get paginated challenges with optional filters.
     */
    @Transactional(readOnly = true)
    public Page<ChallengeResponseDTO> getChallenges(
            String domain,
            ChallengeStatus status,
            String district,
            Pageable pageable
    ) {
        String cleanDomain = (domain != null && !domain.trim().isEmpty()) ? domain.trim() : null;
        String cleanDistrict = (district != null && !district.trim().isEmpty()) ? district.trim() : null;

        Page<Challenge> challenges = challengeRepository.findWithFilters(cleanDomain, status, cleanDistrict, pageable);

        return challenges.map(c -> {
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
     * Get complete details of a single challenge by ID.
     */
    @Transactional(readOnly = true)
    public ChallengeResponseDTO getChallengeById(Long challengeId) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new NoSuchElementException("Challenge not found with ID: " + challengeId));

        ChallengeResponseDTO dto = ChallengeResponseDTO.fromEntity(challenge);
        List<String> urls = evidenceRepository.findByChallengeId(challengeId)
                .stream()
                .map(ChallengeEvidence::getFilePath)
                .collect(Collectors.toList());
        dto.setEvidenceUrls(urls);
        return dto;
    }
}
