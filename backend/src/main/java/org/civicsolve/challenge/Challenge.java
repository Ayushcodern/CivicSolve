package org.civicsolve.challenge;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.locationtech.jts.geom.Point;

import java.time.OffsetDateTime;

/**
 * CivicSolve — Challenge JPA Entity
 *
 * Maps to 'challenges' table in PostgreSQL.
 * Location is stored as PostGIS GEOMETRY(Point, 4326) via JTS Point.
 * (X = Longitude, Y = Latitude, SRID = 4326).
 */
@Entity
@Table(name = "challenges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Challenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "challenge_id")
    private Long challengeId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "domain", length = 100)
    private String domain;

    @Column(name = "sub_domain", length = 100)
    private String subDomain;

    @Column(name = "priority_score")
    private Double priorityScore;

    @Column(name = "priority_explanation", columnDefinition = "TEXT")
    private String priorityExplanation;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", nullable = false, length = 50)
    private ChallengeStatus status = ChallengeStatus.SUBMITTED;

    /**
     * Spatial location in EPSG:4326 (WGS 84).
     * Coordinate mapping: X = Longitude, Y = Latitude.
     */
    @Column(name = "location", nullable = false, columnDefinition = "geometry(Point,4326)")
    private Point location;

    @Column(name = "district", nullable = false, length = 100)
    private String district;

    @Column(name = "village_or_ward", length = 150)
    private String villageOrWard;

    @Builder.Default
    @Column(name = "reported_population")
    private Integer reportedPopulation = 0;

    @Column(name = "duplicate_of_id")
    private Long duplicateOfId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
