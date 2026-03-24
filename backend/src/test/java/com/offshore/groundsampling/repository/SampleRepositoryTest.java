package com.offshore.groundsampling.repository;

import com.offshore.groundsampling.entity.Location;
import com.offshore.groundsampling.entity.Sample;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class SampleRepositoryTest {

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private SampleRepository sampleRepository;

    @Test
    void findByLocation_id_returnsOnlyMatching() {
        Location a = persistLocation("Site A");
        Location b = persistLocation("Site B");
        persistSample(a, 1.0);
        persistSample(a, 2.0);
        persistSample(b, 3.0);
        entityManager.flush();
        entityManager.clear();

        List<Sample> forA = sampleRepository.findByLocation_Id(a.getId());

        assertThat(forA).hasSize(2);
        assertThat(forA).extracting(Sample::getDepthM).containsExactlyInAnyOrder(1.0, 2.0);
    }

    private Location persistLocation(String name) {
        Location loc = new Location();
        loc.setName(name);
        entityManager.persist(loc);
        entityManager.flush();
        return loc;
    }

    private void persistSample(Location loc, double depth) {
        Sample s = new Sample();
        s.setLocation(entityManager.getReference(Location.class, loc.getId()));
        s.setDepthM(depth);
        s.setCollectedDate(LocalDate.of(2024, 1, 1));
        s.setUnitWeightKnPerM3(18.0);
        s.setWaterContentPercent(30.0);
        s.setShearStrengthKpa(40.0);
        entityManager.persist(s);
    }
}
