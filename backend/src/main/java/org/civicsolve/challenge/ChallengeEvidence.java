package org.civicsolve.challenge;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

/**
 * CivicSolve — Challenge Evidence Entity
 * Stores metadata and file paths for photos, documents, and proof attached to challenges.
 */
@Entity
@Table(name = "challenge_evidence")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChallengeEvidence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "evidence_id")
    private Long evidenceId;

    @Column(name = "challenge_id", nullable = false)
    private Long challengeId;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "file_type", nullable = false, length = 50)
    private String fileType; // IMAGE, VIDEO, DOCUMENT

    @Column(name = "caption", length = 255)
    private String caption;

    @CreationTimestamp
    @Column(name = "uploaded_at", updatable = false)
    private OffsetDateTime uploadedAt;
}
