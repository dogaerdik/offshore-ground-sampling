package com.offshore.groundsampling.service;

import com.offshore.groundsampling.entity.Location;
import com.offshore.groundsampling.entity.Sample;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;
import java.util.OptionalDouble;

import static org.assertj.core.api.Assertions.assertThat;

class SamplingStatisticsServiceTest {

    private SamplingStatisticsService service;

    @BeforeEach
    void setUp() {
        service = new SamplingStatisticsService();
    }

    @Test
    void averageWaterContent_empty_returnsEmpty() {
        OptionalDouble result = service.averageWaterContentPercent(List.of());
        assertThat(result).isEmpty();
    }

    @Test
    void averageWaterContent_computesMean() {
        List<Sample> samples = List.of(
                sample(10.0, 20.0, 30.0),
                sample(5.0, 40.0, 60.0)
        );
        OptionalDouble result = service.averageWaterContentPercent(samples);
        assertThat(result).isPresent();
        assertThat(result.getAsDouble()).isEqualTo(30.0);
    }

    @Test
    void countSurpassing_noneAboveThreshold() {
        SamplingThresholds t = new SamplingThresholds(25, 100, 800);
        List<Sample> samples = List.of(
                sample(18.0, 30.0, 50.0),
                sample(20.0, 50.0, 100.0)
        );
        assertThat(service.countSamplesSurpassingThresholds(samples, t)).isZero();
    }

    @Test
    void countSurpassing_flagsAnyParameterAboveThreshold() {
        SamplingThresholds t = new SamplingThresholds(25, 100, 800);
        List<Sample> samples = List.of(
                sample(26.0, 10.0, 10.0),
                sample(20.0, 101.0, 10.0),
                sample(20.0, 50.0, 801.0),
                sample(20.0, 50.0, 100.0)
        );
        assertThat(service.countSamplesSurpassingThresholds(samples, t)).isEqualTo(3);
    }

    @Test
    void countSurpassing_equalToThreshold_notFlagged() {
        SamplingThresholds t = new SamplingThresholds(25, 100, 800);
        List<Sample> samples = List.of(sample(25.0, 100.0, 800.0));
        assertThat(service.countSamplesSurpassingThresholds(samples, t)).isZero();
    }

    private static Sample sample(double uw, double wc, double ss) {
        Location loc = new Location();
        loc.setId(1L);
        loc.setName("Test");
        Sample s = new Sample();
        s.setLocation(loc);
        s.setDepthM(1.0);
        s.setCollectedDate(LocalDate.of(2024, 1, 1));
        s.setUnitWeightKnPerM3(uw);
        s.setWaterContentPercent(wc);
        s.setShearStrengthKpa(ss);
        return s;
    }
}
