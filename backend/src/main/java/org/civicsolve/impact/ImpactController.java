package org.civicsolve.impact;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.civicsolve.impact.dto.ImpactLedgerEntryDTO;
import org.civicsolve.impact.dto.ImpactMetricDTO;
import org.civicsolve.impact.dto.SubmitImpactMetricRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

/**
 * CivicSolve — Impact & Public Ledger REST Controller
 *
 * Endpoints:
 *  - POST /api/v1/impact/{projectId}/metrics: Submit before/after values.
 *  - GET /api/v1/impact/ledger: Public endpoint returning all verified community outcomes.
 *  - GET /api/v1/impact/{projectId}/metrics: Returns impact metrics for a specific project.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/impact")
@RequiredArgsConstructor
public class ImpactController {

    private final ImpactService impactService;

    /**
     * Records verified before/after impact metrics for a project.
     * Example: Turbidity: 85 NTU -> 4.2 NTU.
     */
    @PostMapping("/{projectId}/metrics")
    public ResponseEntity<?> submitMetrics(
            @PathVariable Long projectId,
            @Valid @RequestBody SubmitImpactMetricRequest request
    ) {
        try {
            List<ImpactMetricDTO> result = impactService.submitMetrics(projectId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Not Found", "message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Bad Request", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to submit impact metrics for project ID: {}", projectId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal Server Error", "message", e.getMessage()));
        }
    }

    /**
     * Public endpoint returning all verified community outcomes on the CivicSolve Impact Ledger.
     */
    @GetMapping("/ledger")
    public ResponseEntity<List<ImpactLedgerEntryDTO>> getPublicLedger() {
        List<ImpactLedgerEntryDTO> ledger = impactService.getPublicLedger();
        return ResponseEntity.ok(ledger);
    }

    /**
     * Returns impact metrics for a specific project.
     */
    @GetMapping("/{projectId}/metrics")
    public ResponseEntity<?> getProjectMetrics(@PathVariable Long projectId) {
        try {
            List<ImpactMetricDTO> metrics = impactService.getMetricsByProject(projectId);
            return ResponseEntity.ok(metrics);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Not Found", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to fetch metrics for project ID: {}", projectId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal Server Error", "message", e.getMessage()));
        }
    }
}
