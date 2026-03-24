package com.offshore.groundsampling;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class OffshoreGroundSamplingApplication {

    public static void main(String[] args) {
        SpringApplication.run(OffshoreGroundSamplingApplication.class, args);
    }

}
