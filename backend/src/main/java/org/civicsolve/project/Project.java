package org.civicsolve.project;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * CivicSolve — Project JPA Entity
 * Maps to 'projects' table in PostgreSQL schema.
 * Unique constraint on challenge_id (one active project per challenge).
 */
@Entity
@Table(
    name = "projects",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_projects_challenge", columnNames = {"challenge_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "project_id")
    private Long projectId;

    @Column(name = "challenge_id", nullable = false, unique = true)
    private Long challengeId;

    @Column(name = "institution_id", nullable = false)
    private Long institutionId;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "stage", nullable = false, length = 50)
    private ProjectStage stage = ProjectStage.PROPOSAL;

    @Builder.Default
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate = LocalDate.now();

    @Column(name = "end_date")
    private LocalDate endDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    @Builder.Default
    private List<ProjectMember> members = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    @Builder.Default
    private List<Milestone> milestones = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    @Builder.Default
    private List<org.civicsolve.impact.ImpactMetric> impactMetrics = new ArrayList<>();

    public void addMember(ProjectMember member) {
        if (members == null) {
            members = new ArrayList<>();
        }
        members.add(member);
        member.setProject(this);
    }

    public void addMilestone(Milestone milestone) {
        if (milestones == null) {
            milestones = new ArrayList<>();
        }
        milestones.add(milestone);
        milestone.setProject(this);
    }

    public void addImpactMetric(org.civicsolve.impact.ImpactMetric metric) {
        if (impactMetrics == null) {
            impactMetrics = new ArrayList<>();
        }
        impactMetrics.add(metric);
        metric.setProject(this);
    }
}
