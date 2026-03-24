package com.offshore.groundsampling.service;

import com.offshore.groundsampling.config.ThresholdProperties;
import com.offshore.groundsampling.dto.SampleResponseDto;
import com.offshore.groundsampling.dto.SampleWriteDto;
import com.offshore.groundsampling.dto.StatisticsResponseDto;
import com.offshore.groundsampling.entity.Location;
import com.offshore.groundsampling.entity.Sample;
import com.offshore.groundsampling.repository.LocationRepository;
import com.offshore.groundsampling.repository.SampleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.OptionalDouble;

@Service
public class SampleService {

    private final SampleRepository sampleRepository;
    private final LocationRepository locationRepository;
    private final SamplingStatisticsService samplingStatisticsService;
    private final ThresholdProperties thresholdProperties;

    public SampleService(
            SampleRepository sampleRepository,
            LocationRepository locationRepository,
            SamplingStatisticsService samplingStatisticsService,
            ThresholdProperties thresholdProperties
    ) {
        this.sampleRepository = sampleRepository;
        this.locationRepository = locationRepository;
        this.samplingStatisticsService = samplingStatisticsService;
        this.thresholdProperties = thresholdProperties;
    }

    @Transactional(readOnly = true)
    public List<SampleResponseDto> list(Long locationId) {
        List<Sample> samples = locationId == null
                ? sampleRepository.findAllByOrderByCollectedDateDescIdDesc()
                : sampleRepository.findByLocation_IdOrderByCollectedDateDescIdDesc(locationId);
        return samples.stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public SampleResponseDto getById(Long id) {
        Sample sample = sampleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sample not found: " + id));
        return toDto(sample);
    }

    @Transactional
    public SampleResponseDto create(SampleWriteDto dto) {
        Location location = locationRepository.findById(dto.locationId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Location not found: " + dto.locationId()));
        Sample sample = new Sample();
        applyWrite(sample, location, dto);
        Sample saved = sampleRepository.save(sample);
        return toDto(saved);
    }

    @Transactional
    public SampleResponseDto update(Long id, SampleWriteDto dto) {
        Sample sample = sampleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sample not found: " + id));
        Location location = locationRepository.findById(dto.locationId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Location not found: " + dto.locationId()));
        applyWrite(sample, location, dto);
        Sample saved = sampleRepository.save(sample);
        return toDto(saved);
    }

    @Transactional
    public void delete(Long id) {
        if (!sampleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Sample not found: " + id);
        }
        sampleRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public StatisticsResponseDto statistics(Long locationId) {
        List<Sample> samples = locationId == null
                ? sampleRepository.findAllByOrderByCollectedDateDescIdDesc()
                : sampleRepository.findByLocation_IdOrderByCollectedDateDescIdDesc(locationId);
        SamplingThresholds thresholds = snapshotThresholds();
        OptionalDouble avg = samplingStatisticsService.averageWaterContentPercent(
                samples);
        long surpassing = samplingStatisticsService.countSamplesSurpassingThresholds(
                samples, thresholds);
        return new StatisticsResponseDto(
                avg.isPresent() ? avg.getAsDouble() : null,
                surpassing
        );
    }

    private SamplingThresholds snapshotThresholds() {
        return new SamplingThresholds(
                thresholdProperties.getUnitWeightKnPerM3(),
                thresholdProperties.getWaterContentPercent(),
                thresholdProperties.getShearStrengthKpa()
        );
    }

    private void applyWrite(Sample target, Location location, SampleWriteDto dto) {
        target.setLocation(location);
        target.setDepthM(dto.depthM());
        target.setCollectedDate(dto.collectedDate());
        target.setUnitWeightKnPerM3(dto.unitWeightKnPerM3());
        target.setWaterContentPercent(dto.waterContentPercent());
        target.setShearStrengthKpa(dto.shearStrengthKpa());
    }

    private SampleResponseDto toDto(Sample s) {
        return new SampleResponseDto(
                s.getId(),
                s.getLocation().getId(),
                s.getLocation().getName(),
                s.getDepthM(),
                s.getCollectedDate(),
                s.getUnitWeightKnPerM3(),
                s.getWaterContentPercent(),
                s.getShearStrengthKpa()
        );
    }
}
