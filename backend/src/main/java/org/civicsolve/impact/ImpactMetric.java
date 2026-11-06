package org.civicsolve.impact;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.civicsolve.project.Project;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

/**
 * CivicSolve — Impact Metric JPA Entity
 * Maps to 'impact_metrics' table in PostgreSQL schema.
 * Stores verified quantitative before-and-after civic outcomes for public accountability.
 */
@Entity
@Table(name = "impact_metrics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImpactMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "metric_id")
    private Long metricId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonBackReference
    private Project project;

    @Column(name = "metric_name", nullable = false, length = 150)
    private String metricName;

    @Column(name = "before_value", nullable = false)
    private Double beforeValue;

    @Column(name = "after_value", nullable = false)
    private Double afterValue;

    @Column(name = "unit", nullable = false, length = 50)
    private String unit;

    @CreationTimestamp
    @Column(name = "verified_at", updatable = false)
    private OffsetDateTime verifiedAt;
}
