package com.offshore.groundsampling.service;

import com.offshore.groundsampling.entity.Sample;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.OptionalDouble;

@Service
public class SamplingStatisticsService {

    public OptionalDouble averageWaterContentPercent(List<Sample> samples) {
        if (samples.isEmpty()) {
            return OptionalDouble.empty();
        }
        double sum = 0;
        for (Sample s : samples) {
            sum += s.getWaterContentPercent();
        }
        return OptionalDouble.of(sum / samples.size());
    }

    public long countSamplesSurpassingThresholds(
            List<Sample> samples,
            SamplingThresholds thresholds
    ) {
        if (samples.isEmpty()) {
            return 0;
        }
        long count = 0;
        for (Sample s : samples) {
            if (surpassesAny(s, thresholds)) {
                count++;
            }
        }
        return count;
    }

    private boolean surpassesAny(Sample s, SamplingThresholds t) {
        return s.getUnitWeightKnPerM3() > t.unitWeightKnPerM3()
                || s.getWaterContentPercent() > t.waterContentPercent()
                || s.getShearStrengthKpa() > t.shearStrengthKpa();
    }
}
