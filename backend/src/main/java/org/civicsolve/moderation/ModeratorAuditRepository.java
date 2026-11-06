package org.civicsolve.moderation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModeratorAuditRepository extends JpaRepository<ModeratorAudit, Long> {

    List<ModeratorAudit> findByChallengeIdOrderByAuditedAtDesc(Long challengeId);

    List<ModeratorAudit> findByModeratorIdOrderByAuditedAtDesc(Long moderatorId);
}
