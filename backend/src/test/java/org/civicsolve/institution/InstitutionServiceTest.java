package org.civicsolve.institution;

import org.civicsolve.challenge.GeometryUtil;
import org.civicsolve.institution.dto.CapabilityDTO;
import org.civicsolve.institution.dto.InstitutionDetailDTO;
import org.civicsolve.institution.dto.InstitutionSummaryDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InstitutionServiceTest {

    @Mock
    private InstitutionRepository institutionRepository;

    @Mock
    private CapabilityRepository capabilityRepository;

    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private InstitutionService institutionService;

    @Test
    void testGetAllInstitutionsReturnsSummaryWithCapabilities() {
        Institution inst = Institution.builder()
                .institutionId(1L)
                .name("Acropolis Institute of Technology & Research (AITR)")
                .type("UNIVERSITY")
                .district("Indore")
                .location(GeometryUtil.createPoint(22.8214, 75.8956))
                .capabilities(new ArrayList<>())
                .build();

        Capability cap = Capability.builder()
                .capabilityId(10L)
                .institution(inst)
                .domain("Water Supply")
                .expertise("IoT telemetry, groundwater turbidity monitoring")
                .capacity(4)
                .build();

        inst.addCapability(cap);

        when(institutionRepository.findWithFilters(null, null)).thenReturn(List.of(inst));

        List<InstitutionSummaryDTO> summaries = institutionService.getAllInstitutions(null, null);

        assertNotNull(summaries);
        assertEquals(1, summaries.size());
        InstitutionSummaryDTO first = summaries.get(0);
        assertEquals("Acropolis Institute of Technology & Research (AITR)", first.getName());
        assertEquals("UNIVERSITY", first.getType());
        assertEquals(22.8214, first.getLat(), 0.0001);
        assertEquals(75.8956, first.getLon(), 0.0001);
        assertEquals(1, first.getCapabilities().size());
        assertEquals("Water Supply", first.getCapabilities().get(0).getDomain());
    }

    @Test
    void testGetInstitutionDetailReturnsProfileAndActiveProjects() {
        Institution inst = Institution.builder()
                .institutionId(2L)
                .name("SGSITS Indore")
                .type("UNIVERSITY")
                .district("Indore")
                .location(GeometryUtil.createPoint(22.7244, 75.8754))
                .capabilities(new ArrayList<>())
                .build();

        when(institutionRepository.findByIdWithCapabilities(2L)).thenReturn(Optional.of(inst));
        when(jdbcTemplate.query(anyString(), any(RowMapper.class), anyLong())).thenReturn(Collections.emptyList());

        InstitutionDetailDTO detail = institutionService.getInstitutionDetail(2L);

        assertNotNull(detail);
        assertEquals(2L, detail.getInstitutionId());
        assertEquals("SGSITS Indore", detail.getName());
        assertNotNull(detail.getActiveProjects());
    }

    @Test
    void testAddCapabilityCreatesNewCapability() {
        Institution inst = Institution.builder()
                .institutionId(1L)
                .name("AITR")
                .capabilities(new ArrayList<>())
                .build();

        when(institutionRepository.findById(1L)).thenReturn(Optional.of(inst));
        when(capabilityRepository.save(any(Capability.class))).thenAnswer(invocation -> {
            Capability c = invocation.getArgument(0);
            c.setCapabilityId(101L);
            return c;
        });

        CapabilityDTO input = CapabilityDTO.builder()
                .domain("Public Health")
                .expertise("Cold-chain vaccine monitoring")
                .capacity(3)
                .build();

        CapabilityDTO result = institutionService.addOrUpdateCapability(1L, input);

        assertNotNull(result);
        assertEquals(101L, result.getCapabilityId());
        assertEquals("Public Health", result.getDomain());
        assertEquals("Cold-chain vaccine monitoring", result.getExpertise());
        assertEquals(3, result.getCapacity());
        verify(capabilityRepository, times(1)).save(any(Capability.class));
    }
}
