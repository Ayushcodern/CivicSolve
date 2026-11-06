package org.civicsolve.challenge;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChallengeEvidenceRepository extends JpaRepository<ChallengeEvidence, Long> {

    List<ChallengeEvidence> findByChallengeId(Long challengeId);

    void deleteByChallengeId(Long challengeId);
}
