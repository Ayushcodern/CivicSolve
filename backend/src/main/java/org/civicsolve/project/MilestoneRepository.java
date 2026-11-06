package org.civicsolve.project;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, Long> {

    List<Milestone> findByProjectProjectId(Long projectId);

    Optional<Milestone> findByMilestoneIdAndProjectProjectId(Long milestoneId, Long projectId);

    long countByProjectProjectIdAndStatus(Long projectId, MilestoneStatus status);

    long countByProjectProjectId(Long projectId);
}
