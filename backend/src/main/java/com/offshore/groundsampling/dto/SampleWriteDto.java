package com.offshore.groundsampling.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record SampleWriteDto(
        @NotNull Long locationId,
        @NotNull
        @DecimalMin(value = "0", inclusive = false, message = "Depth must be greater than 0")
        @DecimalMax(value = "5000", message = "Depth must be within a plausible range")
        Double depthM,
        @NotNull LocalDate collectedDate,
        @NotNull
        @DecimalMin(value = "12", inclusive = false, message = "Unit weight must be > 12 kN/m³")
        @DecimalMax(value = "26", inclusive = false, message = "Unit weight must be < 26 kN/m³")
        Double unitWeightKnPerM3,
        @NotNull
        @DecimalMin(value = "5", inclusive = false, message = "Water content must be > 5%")
        @DecimalMax(value = "150", inclusive = false, message = "Water content must be < 150%")
        Double waterContentPercent,
        @NotNull
        @DecimalMin(value = "2", inclusive = false, message = "Shear strength must be > 2 kPa")
        @DecimalMax(value = "1000", inclusive = false, message = "Shear strength must be < 1000 kPa")
        Double shearStrengthKpa
) {
}
