package org.civicsolve.institution;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.civicsolve.institution.dto.CapabilityDTO;
import org.civicsolve.institution.dto.InstitutionDetailDTO;
import org.civicsolve.institution.dto.InstitutionSummaryDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

/**
 * CivicSolve — Institution & Capability REST Controller
 * Provides endpoints for browsing participating universities, research labs,
 * industry partners, and managing departmental capabilities.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/institutions")
@RequiredArgsConstructor
public class InstitutionController {

    private final InstitutionService institutionService;

    /**
     * List all institutions with their capability tags and GPS locations.
     */
    @GetMapping
    public ResponseEntity<List<InstitutionSummaryDTO>> getAllInstitutions(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String district
    ) {
        List<InstitutionSummaryDTO> result = institutionService.getAllInstitutions(type, district);
        return ResponseEntity.ok(result);
    }

    /**
     * Get detailed institution profile, capabilities, and active projects.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getInstitutionDetail(@PathVariable("id") Long id) {
        try {
            InstitutionDetailDTO detail = institutionService.getInstitutionDetail(id);
            return ResponseEntity.ok(detail);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Not Found", "message", ex.getMessage()));
        }
    }

    /**
     * Add or edit departmental capability for an institution.
     */
    @PostMapping("/{id}/capabilities")
    public ResponseEntity<?> addOrUpdateCapability(
            @PathVariable("id") Long id,
            @Valid @RequestBody CapabilityDTO dto
    ) {
        try {
            CapabilityDTO result = institutionService.addOrUpdateCapability(id, dto);
            HttpStatus status = (dto.getCapabilityId() == null) ? HttpStatus.CREATED : HttpStatus.OK;
            return ResponseEntity.status(status).body(result);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Not Found", "message", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Bad Request", "message", ex.getMessage()));
        }
    }
}
