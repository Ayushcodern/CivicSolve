package org.civicsolve.challenge;

import org.locationtech.jts.geom.Point;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * CivicSolve — Spatial Challenge Repository
 *
 * Provides PostGIS spatial queries via GiST index (ST_DWithin on EPSG:4326)
 * and paginated queries by district, domain, and status.
 */
@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, Long> {

    /**
     * Spatial query using PostGIS ST_DWithin.
     * Casts location geometry to geography to measure geodesic distance in meters.
     * Uses idx_challenges_location GiST index.
     *
     * @param point JTS Point geometry in SRID 4326 (X=lon, Y=lat).
     * @param radiusMeters Search radius in meters (e.g., 5000 for 5km).
     * @return List of challenges located within radiusMeters of the input point.
     */
    @Query(value = "SELECT * FROM challenges c WHERE ST_DWithin(c.location::geography, :point::geography, :radiusMeters)", nativeQuery = true)
    List<Challenge> findWithinRadius(@Param("point") Point point, @Param("radiusMeters") double radiusMeters);

    /**
     * Overloaded coordinate-based spatial query for convenience.
     */
    @Query(value = "SELECT * FROM challenges c WHERE ST_DWithin(c.location::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, :radiusMeters)", nativeQuery = true)
    List<Challenge> findWithinRadiusCoordinates(
            @Param("lon") double lon,
            @Param("lat") double lat,
            @Param("radiusMeters") double radiusMeters
    );

    /**
     * Paginated filter by district and domain.
     */
    Page<Challenge> findByDistrictAndDomain(String district, String domain, Pageable pageable);

    /**
     * Paginated filter by district.
     */
    Page<Challenge> findByDistrict(String district, Pageable pageable);

    /**
     * Paginated filter by domain.
     */
    Page<Challenge> findByDomain(String domain, Pageable pageable);

    /**
     * Paginated filter by challenge status.
     */
    Page<Challenge> findByStatus(ChallengeStatus status, Pageable pageable);

    /**
     * Dynamic paginated query matching any combination of domain, status, and district.
     */
    @Query("SELECT c FROM Challenge c WHERE " +
           "(:domain IS NULL OR LOWER(c.domain) = LOWER(:domain)) AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:district IS NULL OR LOWER(c.district) = LOWER(:district))")
    Page<Challenge> findWithFilters(
            @Param("domain") String domain,
            @Param("status") ChallengeStatus status,
            @Param("district") String district,
            Pageable pageable
    );

    /**
     * Find existing potential duplicates (submitted/validated challenges within radius).
     */
    @Query(value = "SELECT * FROM challenges c WHERE c.challenge_id != :excludeId AND ST_DWithin(c.location::geography, :point::geography, :radiusMeters)", nativeQuery = true)
    List<Challenge> findNearbyCandidates(
            @Param("excludeId") Long excludeId,
            @Param("point") Point point,
            @Param("radiusMeters") double radiusMeters
    );

    /**
     * Retrieve challenges pending human moderator review (status AI_ANALYZED or SUBMITTED, or flagged duplicates).
     */
    @Query("SELECT c FROM Challenge c WHERE c.status = org.civicsolve.challenge.ChallengeStatus.AI_ANALYZED " +
           "OR c.duplicateOfId IS NOT NULL " +
           "OR c.status = org.civicsolve.challenge.ChallengeStatus.SUBMITTED")
    Page<Challenge> findModerationQueue(Pageable pageable);
}

