package org.civicsolve.institution;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.locationtech.jts.geom.Point;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * CivicSolve — Institution JPA Entity
 * Maps to 'institutions' table in PostgreSQL.
 * Represents universities, research labs, and industry partners.
 */
@Entity
@Table(name = "institutions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Institution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "institution_id")
    private Long institutionId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "type", nullable = false, length = 50)
    private String type; // UNIVERSITY, RESEARCH_LAB, INDUSTRY

    @Column(name = "district", nullable = false, length = 100)
    private String district;

    @Column(name = "location", nullable = false, columnDefinition = "geometry(Point,4326)")
    private Point location;

    @OneToMany(mappedBy = "institution", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Capability> capabilities = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    public void addCapability(Capability capability) {
        capabilities.add(capability);
        capability.setInstitution(this);
    }

    public void removeCapability(Capability capability) {
        capabilities.remove(capability);
        capability.setInstitution(null);
    }
}
