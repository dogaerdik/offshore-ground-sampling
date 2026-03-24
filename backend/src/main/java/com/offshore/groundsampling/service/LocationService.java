package com.offshore.groundsampling.service;

import com.offshore.groundsampling.dto.LocationResponseDto;
import com.offshore.groundsampling.entity.Location;
import com.offshore.groundsampling.repository.LocationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LocationService {

    private final LocationRepository locationRepository;

    public LocationService(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    @Transactional(readOnly = true)
    public List<LocationResponseDto> listAll() {
        return locationRepository.findAllByOrderByCreatedAtDescIdDesc().stream()
                .map(this::toDto)
                .toList();
    }

    private LocationResponseDto toDto(Location location) {
        return new LocationResponseDto(location.getId(), location.getName());
    }
}
