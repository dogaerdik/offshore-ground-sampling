package com.offshore.groundsampling.dto;

public record StatisticsResponseDto(
        Double averageWaterContentPercent,
        long samplesSurpassingThresholdCount
) {
}
