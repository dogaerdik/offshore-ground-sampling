package com.offshore.groundsampling.config;

import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiJwtCustomizer {

    @Bean
    public OpenApiCustomizer bearerJwtSecurityScheme() {
        return openApi -> openApi.getComponents().addSecuritySchemes(
                "bearer-jwt",
                new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT"));
    }
}
