package com.offshore.groundsampling.repository;

import com.offshore.groundsampling.entity.Sample;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SampleRepository extends JpaRepository<Sample, Long> {

    @EntityGraph(attributePaths = "location")
    @Override
    List<Sample> findAll();

    @EntityGraph(attributePaths = "location")
    @Override
    Optional<Sample> findById(Long id);

    @EntityGraph(attributePaths = "location")
    List<Sample> findByLocation_Id(Long locationId);

    @EntityGraph(attributePaths = "location")
    List<Sample> findAllByOrderByCollectedDateDescIdDesc();

    @EntityGraph(attributePaths = "location")
    List<Sample> findByLocation_IdOrderByCollectedDateDescIdDesc(Long locationId);
}
