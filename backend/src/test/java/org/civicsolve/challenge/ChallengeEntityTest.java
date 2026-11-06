package org.civicsolve.challenge;

import org.civicsolve.challenge.dto.ChallengeIntakeDTO;
import org.civicsolve.challenge.dto.ChallengeResponseDTO;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Point;

import java.time.OffsetDateTime;

import static org.junit.jupiter.api.Assertions.*;

class ChallengeEntityTest {

    @Test
    void testGeometryUtilCreatesValidPoint() {
        double lat = 22.8214;
        double lon = 75.8956;

        Point point = GeometryUtil.createPoint(lat, lon);

        assertNotNull(point);
        assertEquals(4326, point.getSRID());
        assertEquals(lon, point.getX(), 0.0001); // X is lon
        assertEquals(lat, point.getY(), 0.0001); // Y is lat
    }

    @Test
    void testChallengeEntityMappingToResponseDTO() {
        Point point = GeometryUtil.createPoint(22.8214, 75.8956);
        Challenge challenge = Challenge.builder()
                .challengeId(2611L)
                .userId(1L)
                .title("Handpump yields muddy water after monsoon")
                .description("Community handpump dispenses yellowish mud water.")
                .domain("Water Supply")
                .subDomain("Groundwater Quality")
                .priorityScore(82.4)
                .priorityExplanation("Severity 0.90, Population 1200")
                .status(ChallengeStatus.VALIDATED)
                .location(point)
                .district("Indore")
                .villageOrWard("Sanwer Ward 4")
                .reportedPopulation(1200)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        ChallengeResponseDTO dto = ChallengeResponseDTO.fromEntity(challenge);

        assertNotNull(dto);
        assertEquals(2611L, dto.getChallengeId());
        assertEquals(1L, dto.getUserId());
        assertEquals("Water Supply", dto.getDomain());
        assertEquals("Groundwater Quality", dto.getSubDomain());
        assertEquals(82.4, dto.getPriorityScore());
        assertEquals(ChallengeStatus.VALIDATED, dto.getStatus());
        assertEquals(22.8214, dto.getLat(), 0.0001);
        assertEquals(75.8956, dto.getLon(), 0.0001);
        assertEquals("Indore", dto.getDistrict());
        assertEquals("Sanwer Ward 4", dto.getVillageOrWard());
        assertEquals(1200, dto.getReportedPopulation());
    }

    @Test
    void testChallengeIntakeDTOBuilder() {
        ChallengeIntakeDTO dto = ChallengeIntakeDTO.builder()
                .title("Village road damaged")
                .description("Potholes everywhere.")
                .lat(23.0258)
                .lon(75.0625)
                .district("Dhar")
                .villageOrWard("Badnawar")
                .reportedPopulation(3400)
                .domain("Rural Infrastructure")
                .build();

        assertEquals("Village road damaged", dto.getTitle());
        assertEquals(23.0258, dto.getLat());
        assertEquals(75.0625, dto.getLon());
        assertEquals("Dhar", dto.getDistrict());
        assertEquals(3400, dto.getReportedPopulation());
    }
}
