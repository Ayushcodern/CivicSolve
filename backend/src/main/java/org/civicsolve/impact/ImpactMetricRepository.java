package org.civicsolve.impact;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImpactMetricRepository extends JpaRepository<ImpactMetric, Long> {

    List<ImpactMetric> findByProjectProjectId(Long projectId);

    List<ImpactMetric> findAllByOrderByVerifiedAtDesc();

    boolean existsByProjectProjectId(Long projectId);
}
