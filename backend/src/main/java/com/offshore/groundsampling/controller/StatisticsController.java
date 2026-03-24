package com.offshore.groundsampling.controller;

import com.offshore.groundsampling.dto.StatisticsResponseDto;
import com.offshore.groundsampling.service.SampleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final SampleService sampleService;

    @GetMapping
    public StatisticsResponseDto get(
            @RequestParam(required = false) Long locationId
    ) {
        return sampleService.statistics(locationId);
    }
}
