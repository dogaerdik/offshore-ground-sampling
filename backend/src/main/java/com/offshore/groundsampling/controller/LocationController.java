package com.offshore.groundsampling.controller;

import com.offshore.groundsampling.dto.LocationResponseDto;
import com.offshore.groundsampling.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @GetMapping
    public List<LocationResponseDto> list() {
        return locationService.listAll();
    }
}
