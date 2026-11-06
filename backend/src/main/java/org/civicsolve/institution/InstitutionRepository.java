package org.civicsolve.institution;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InstitutionRepository extends JpaRepository<Institution, Long> {

    /**
     * Fetch all institutions eagerly joining capabilities to avoid N+1 query overhead.
     */
    @Query("SELECT DISTINCT i FROM Institution i LEFT JOIN FETCH i.capabilities")
    List<Institution> findAllWithCapabilities();

    /**
     * Filter institutions by type and district with eager capabilities.
     */
    @Query("SELECT DISTINCT i FROM Institution i LEFT JOIN FETCH i.capabilities WHERE " +
           "(:type IS NULL OR UPPER(i.type) = UPPER(:type)) AND " +
           "(:district IS NULL OR LOWER(i.district) = LOWER(:district))")
    List<Institution> findWithFilters(@Param("type") String type, @Param("district") String district);

    @Query("SELECT i FROM Institution i LEFT JOIN FETCH i.capabilities WHERE i.institutionId = :id")
    Optional<Institution> findByIdWithCapabilities(@Param("id") Long id);
}
