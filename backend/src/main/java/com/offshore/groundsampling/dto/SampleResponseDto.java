package com.offshore.groundsampling.dto;

import java.time.LocalDate;

public record SampleResponseDto(
        Long id,
        Long locationId,
        String locationName,
        Double depthM,
        LocalDate collectedDate,
        Double unitWeightKnPerM3,
        Double waterContentPercent,
        Double shearStrengthKpa
) {
}
