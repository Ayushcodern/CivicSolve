package org.civicsolve.project;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

/**
 * CivicSolve — Project Member JPA Entity
 * Maps to 'project_members' table in PostgreSQL schema.
 * Unique constraint on (project_id, user_id).
 */
@Entity
@Table(
    name = "project_members",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_project_member_user", columnNames = {"project_id", "user_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id")
    private Long memberId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonBackReference
    private Project project;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role_in_project", nullable = false, length = 50)
    private ProjectRole roleInProject;

    @CreationTimestamp
    @Column(name = "joined_at", updatable = false)
    private OffsetDateTime joinedAt;
}
