package org.civicsolve.institution;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CapabilityRepository extends JpaRepository<Capability, Long> {

    List<Capability> findByInstitutionInstitutionId(Long institutionId);

    List<Capability> findByDomainIgnoreCase(String domain);
}
