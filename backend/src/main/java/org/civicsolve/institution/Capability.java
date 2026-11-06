package org.civicsolve.institution;

import jakarta.persistence.*;
import lombok.*;

/**
 * CivicSolve — Departmental Capability JPA Entity
 * Maps to 'capabilities' table in PostgreSQL.
 * Represents domain expertise, capacity, and specialization.
 */
@Entity
@Table(name = "capabilities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Capability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "capability_id")
    private Long capabilityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @Column(name = "domain", nullable = false, length = 100)
    private String domain;

    @Column(name = "expertise", nullable = false, length = 255)
    private String expertise;

    @Builder.Default
    @Column(name = "capacity")
    private Integer capacity = 5;
}
