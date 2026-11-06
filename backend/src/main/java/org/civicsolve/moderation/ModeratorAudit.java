package org.civicsolve.moderation;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

/**
 * CivicSolve — Moderator Audit Entity
 * Immutable audit log recording every human validation, rejection, or merge action.
 */
@Entity
@Table(name = "moderator_audits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModeratorAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "audit_id")
    private Long auditId;

    @Column(name = "challenge_id", nullable = false)
    private Long challengeId;

    @Column(name = "moderator_id", nullable = false)
    private Long moderatorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 50)
    private ModerationAction action;

    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    @CreationTimestamp
    @Column(name = "audited_at", updatable = false)
    private OffsetDateTime auditedAt;
}
