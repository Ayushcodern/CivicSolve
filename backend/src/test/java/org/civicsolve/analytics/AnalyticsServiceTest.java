package org.civicsolve.analytics;

import org.civicsolve.analytics.dto.DistrictHeatmapDTO;
import org.civicsolve.analytics.dto.DomainBreakdownDTO;
import org.civicsolve.analytics.dto.SummaryAnalyticsDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private AnalyticsService analyticsService;

    @Test
    void testGetSummaryReturnsAggregates() {
        SummaryAnalyticsDTO mockSummary = SummaryAnalyticsDTO.builder()
                .totalChallenges(42L)
                .activeProjects(8L)
                .deployedSolutions(5L)
                .districts(6L)
                .build();

        when(jdbcTemplate.queryForObject(anyString(), any(RowMapper.class))).thenReturn(mockSummary);

        SummaryAnalyticsDTO summary = analyticsService.getSummary();

        assertNotNull(summary);
        assertEquals(42L, summary.getTotalChallenges());
        assertEquals(8L, summary.getActiveProjects());
        assertEquals(5L, summary.getDeployedSolutions());
        assertEquals(6L, summary.getDistricts());
    }

    @Test
    void testGetDistrictDistributionReturnsHeatmapData() {
        DistrictHeatmapDTO row = DistrictHeatmapDTO.builder()
                .district("Indore")
                .challengeCount(25L)
                .avgPriorityScore(74.5)
                .centerLat(22.7196)
                .centerLon(75.8577)
                .build();

        when(jdbcTemplate.query(anyString(), any(RowMapper.class))).thenReturn(List.of(row));

        List<DistrictHeatmapDTO> list = analyticsService.getDistrictDistribution();

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("Indore", list.get(0).getDistrict());
        assertEquals(25L, list.get(0).getChallengeCount());
        assertEquals(74.5, list.get(0).getAvgPriorityScore());
        assertEquals(22.7196, list.get(0).getCenterLat());
        assertEquals(75.8577, list.get(0).getCenterLon());
    }

    @Test
    void testGetDomainBreakdownReturnsPercentages() {
        DomainBreakdownDTO d1 = DomainBreakdownDTO.builder()
                .domain("WATER")
                .count(15L)
                .percentage(50.0)
                .build();

        DomainBreakdownDTO d2 = DomainBreakdownDTO.builder()
                .domain("ROAD_INFRASTRUCTURE")
                .count(15L)
                .percentage(50.0)
                .build();

        when(jdbcTemplate.query(anyString(), any(RowMapper.class))).thenReturn(List.of(d1, d2));

        List<DomainBreakdownDTO> list = analyticsService.getDomainBreakdown();

        assertNotNull(list);
        assertEquals(2, list.size());
        assertEquals("WATER", list.get(0).getDomain());
        assertEquals(50.0, list.get(0).getPercentage());
    }
}
