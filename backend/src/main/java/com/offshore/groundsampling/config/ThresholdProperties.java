package com.offshore.groundsampling.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "sampling.threshold")
public class ThresholdProperties {

    private double unitWeightKnPerM3 = 25;

    private double waterContentPercent = 100;

    private double shearStrengthKpa = 800;
}
