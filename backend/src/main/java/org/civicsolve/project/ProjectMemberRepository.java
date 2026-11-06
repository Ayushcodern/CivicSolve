package org.civicsolve.project;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    List<ProjectMember> findByProjectProjectId(Long projectId);

    boolean existsByProjectProjectIdAndUserId(Long projectId, Long userId);

    Optional<ProjectMember> findByProjectProjectIdAndUserId(Long projectId, Long userId);
}
