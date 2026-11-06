package org.civicsolve.analytics;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.civicsolve.analytics.dto.DistrictHeatmapDTO;
import org.civicsolve.analytics.dto.DomainBreakdownDTO;
import org.civicsolve.analytics.dto.SummaryAnalyticsDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * CivicSolve — Analytics Service
 * Executes high-performance SQL aggregate queries for landing page counters,
 * district geospatial heatmaps, and domain breakdown charts.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Fast aggregate summary for landing page metrics:
     * - Total Challenges Logged
     * - Active Projects
     * - Deployed Solutions
     * - Impacted Districts
     */
    @Transactional(readOnly = true)
    public SummaryAnalyticsDTO getSummary() {
        String sql = """
            SELECT 
                (SELECT COUNT(*) FROM challenges WHERE status != 'REJECTED') AS total_challenges,
                (SELECT COUNT(*) FROM projects WHERE stage NOT IN ('COMPLETED')) AS active_projects,
                (SELECT COUNT(*) FROM projects WHERE stage IN ('DEPLOYED', 'COMPLETED')) AS deployed_solutions,
                (SELECT COUNT(DISTINCT district) FROM challenges WHERE district IS NOT NULL AND TRIM(district) != '') AS districts
        """;

        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> SummaryAnalyticsDTO.builder()
                .totalChallenges(rs.getLong("total_challenges"))
                .activeProjects(rs.getLong("active_projects"))
                .deployedSolutions(rs.getLong("deployed_solutions"))
                .districts(rs.getLong("districts"))
                .timestamp(OffsetDateTime.now())
                .build()
        );
    }

    /**
     * District distribution query:
     * Returns challenge counts, average priority scores, and spatial centroid coordinates
     * for interactive geospatial heatmap rendering.
     */
    @Transactional(readOnly = true)
    public List<DistrictHeatmapDTO> getDistrictDistribution() {
        String sql = """
            SELECT district,
                   COUNT(*) AS challenge_count,
                   ROUND(AVG(COALESCE(priority_score, 0.0))::numeric, 2) AS avg_priority,
                   ROUND(AVG(ST_Y(location::geometry))::numeric, 4) AS center_lat,
                   ROUND(AVG(ST_X(location::geometry))::numeric, 4) AS center_lon
            FROM challenges
            WHERE status != 'REJECTED' AND district IS NOT NULL AND TRIM(district) != ''
            GROUP BY district
            ORDER BY challenge_count DESC
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> DistrictHeatmapDTO.builder()
                .district(rs.getString("district"))
                .challengeCount(rs.getLong("challenge_count"))
                .avgPriorityScore(rs.getDouble("avg_priority"))
                .centerLat(rs.getDouble("center_lat"))
                .centerLon(rs.getDouble("center_lon"))
                .build()
        );
    }

    /**
     * Domain breakdown query:
     * Returns total counts and percentage distributions across civic categories
     * (e.g. WATER, SANITATION, ROAD_INFRASTRUCTURE, POWER, PUBLIC_HEALTH).
     */
    @Transactional(readOnly = true)
    public List<DomainBreakdownDTO> getDomainBreakdown() {
        String sql = """
            SELECT COALESCE(domain, 'UNCLASSIFIED') AS domain_name,
                   COUNT(*) AS domain_count,
                   ROUND((COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM challenges WHERE status != 'REJECTED'), 0))::numeric, 2) AS percentage
            FROM challenges
            WHERE status != 'REJECTED'
            GROUP BY domain
            ORDER BY domain_count DESC
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> DomainBreakdownDTO.builder()
                .domain(rs.getString("domain_name"))
                .count(rs.getLong("domain_count"))
                .percentage(rs.getDouble("percentage"))
                .build()
        );
    }
}
