package com.offshore.groundsampling.service;

public record SamplingThresholds(
        double unitWeightKnPerM3,
        double waterContentPercent,
        double shearStrengthKpa
) {
}
