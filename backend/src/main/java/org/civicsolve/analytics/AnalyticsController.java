package org.civicsolve.analytics;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.civicsolve.analytics.dto.DistrictHeatmapDTO;
import org.civicsolve.analytics.dto.DomainBreakdownDTO;
import org.civicsolve.analytics.dto.SummaryAnalyticsDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * CivicSolve — Analytics REST Controller
 *
 * Endpoints:
 *  - GET /api/v1/analytics/summary: Returns live counts (total challenges, active projects, deployed solutions, districts).
 *  - GET /api/v1/analytics/district-distribution: Returns counts and average priority score by district for heatmap rendering.
 *  - GET /api/v1/analytics/domain-breakdown: Returns percentage distribution by domain.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * Live metrics for landing page counters.
     * Guaranteed fast response time (<100ms) powered by SQL aggregates.
     */
    @GetMapping("/summary")
    public ResponseEntity<SummaryAnalyticsDTO> getSummary() {
        SummaryAnalyticsDTO summary = analyticsService.getSummary();
        return ResponseEntity.ok(summary);
    }

    /**
     * District distribution data for interactive map heatmaps and choropleth views.
     */
    @GetMapping("/district-distribution")
    public ResponseEntity<List<DistrictHeatmapDTO>> getDistrictDistribution() {
        List<DistrictHeatmapDTO> distribution = analyticsService.getDistrictDistribution();
        return ResponseEntity.ok(distribution);
    }

    /**
     * Domain breakdown for categorical pie / bar charts.
     */
    @GetMapping("/domain-breakdown")
    public ResponseEntity<List<DomainBreakdownDTO>> getDomainBreakdown() {
        List<DomainBreakdownDTO> breakdown = analyticsService.getDomainBreakdown();
        return ResponseEntity.ok(breakdown);
    }
}
