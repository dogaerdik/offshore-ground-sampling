package com.offshore.groundsampling.service;

import com.offshore.groundsampling.config.ThresholdProperties;
import com.offshore.groundsampling.dto.SampleResponseDto;
import com.offshore.groundsampling.dto.SampleWriteDto;
import com.offshore.groundsampling.dto.StatisticsResponseDto;
import com.offshore.groundsampling.entity.Location;
import com.offshore.groundsampling.entity.Sample;
import com.offshore.groundsampling.repository.LocationRepository;
import com.offshore.groundsampling.repository.SampleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SampleServiceTest {

    @Mock
    private SampleRepository sampleRepository;

    @Mock
    private LocationRepository locationRepository;

    private SamplingStatisticsService samplingStatisticsService;
    private ThresholdProperties thresholdProperties;
    private SampleService sampleService;

    @BeforeEach
    void setUp() {
        samplingStatisticsService = new SamplingStatisticsService();
        thresholdProperties = new ThresholdProperties();
        thresholdProperties.setUnitWeightKnPerM3(25);
        thresholdProperties.setWaterContentPercent(100);
        thresholdProperties.setShearStrengthKpa(800);
        sampleService = new SampleService(
                sampleRepository,
                locationRepository,
                samplingStatisticsService,
                thresholdProperties
        );
    }

    @Test
    void statistics_filtered_usesFindByLocationOrdered() {
        when(sampleRepository.findByLocation_IdOrderByCollectedDateDescIdDesc(2L))
                .thenReturn(List.of());
        sampleService.statistics(2L);
        verify(sampleRepository).findByLocation_IdOrderByCollectedDateDescIdDesc(2L);
    }

    @Test
    void statistics_delegatesToCalculator() {
        Sample s = new Sample();
        Location loc = new Location();
        loc.setId(1L);
        loc.setName("L");
        s.setLocation(loc);
        s.setDepthM(1.0);
        s.setCollectedDate(LocalDate.of(2024, 1, 1));
        s.setUnitWeightKnPerM3(20.0);
        s.setWaterContentPercent(40.0);
        s.setShearStrengthKpa(50.0);
        when(sampleRepository.findAllByOrderByCollectedDateDescIdDesc())
                .thenReturn(List.of(s));

        StatisticsResponseDto dto = sampleService.statistics(null);

        assertThat(dto.averageWaterContentPercent()).isEqualTo(40.0);
        assertThat(dto.samplesSurpassingThresholdCount()).isZero();
        verify(sampleRepository).findAllByOrderByCollectedDateDescIdDesc();
    }

    @Test
    void getById_missing_throws() {
        when(sampleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sampleService.getById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Sample not found");
    }

    @Test
    void create_savesAndReturnsDto() {
        Location loc = location(1L, "North");
        when(locationRepository.findById(1L)).thenReturn(Optional.of(loc));
        when(sampleRepository.save(any(Sample.class)))
                .thenAnswer(inv -> {
                    Sample s = inv.getArgument(0);
                    s.setId(42L);
                    return s;
                });

        SampleWriteDto write = validWriteDto(1L);
        SampleResponseDto dto = sampleService.create(write);

        assertThat(dto.id()).isEqualTo(42L);
        assertThat(dto.locationId()).isEqualTo(1L);
        assertThat(dto.locationName()).isEqualTo("North");

        ArgumentCaptor<Sample> cap = ArgumentCaptor.forClass(Sample.class);
        verify(sampleRepository).save(cap.capture());
        Sample saved = cap.getValue();
        assertThat(saved.getDepthM()).isEqualTo(write.depthM());
        assertThat(saved.getCollectedDate()).isEqualTo(write.collectedDate());
        assertThat(saved.getUnitWeightKnPerM3()).isEqualTo(write.unitWeightKnPerM3());
        assertThat(saved.getWaterContentPercent()).isEqualTo(write.waterContentPercent());
        assertThat(saved.getShearStrengthKpa()).isEqualTo(write.shearStrengthKpa());
        assertThat(saved.getLocation()).isSameAs(loc);
    }

    @Test
    void create_locationMissing_throws() {
        when(locationRepository.findById(5L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sampleService.create(validWriteDto(5L)))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Location not found");
        verifyNoMoreInteractions(sampleRepository);
    }

    @Test
    void update_savesAndReturnsDto() {
        Sample existing = sampleWith(3L, 1L, "Old");
        Location newLoc = location(2L, "South");
        when(sampleRepository.findById(3L)).thenReturn(Optional.of(existing));
        when(locationRepository.findById(2L)).thenReturn(Optional.of(newLoc));
        when(sampleRepository.save(existing)).thenReturn(existing);

        SampleWriteDto write = validWriteDto(2L);
        SampleResponseDto dto = sampleService.update(3L, write);

        assertThat(dto.id()).isEqualTo(3L);
        assertThat(dto.locationId()).isEqualTo(2L);
        assertThat(dto.locationName()).isEqualTo("South");
        verify(sampleRepository).save(existing);
        assertThat(existing.getLocation()).isSameAs(newLoc);
        assertThat(existing.getDepthM()).isEqualTo(write.depthM());
    }

    @Test
    void update_sampleMissing_throws() {
        when(sampleRepository.findById(8L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sampleService.update(8L, validWriteDto(1L)))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Sample not found");
        verifyNoMoreInteractions(locationRepository);
    }

    @Test
    void delete_removesWhenExists() {
        when(sampleRepository.existsById(4L)).thenReturn(true);

        sampleService.delete(4L);

        verify(sampleRepository).deleteById(4L);
    }

    @Test
    void delete_missing_throws() {
        when(sampleRepository.existsById(4L)).thenReturn(false);

        assertThatThrownBy(() -> sampleService.delete(4L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Sample not found");
        verify(sampleRepository).existsById(4L);
        verifyNoMoreInteractions(sampleRepository);
    }

    private static Location location(long id, String name) {
        Location loc = new Location();
        loc.setId(id);
        loc.setName(name);
        return loc;
    }

    private static Sample sampleWith(long id, long locationId, String locationName) {
        Sample s = new Sample();
        s.setId(id);
        s.setLocation(location(locationId, locationName));
        s.setDepthM(10.0);
        s.setCollectedDate(LocalDate.of(2024, 6, 1));
        s.setUnitWeightKnPerM3(20.0);
        s.setWaterContentPercent(30.0);
        s.setShearStrengthKpa(50.0);
        return s;
    }

    private static SampleWriteDto validWriteDto(long locationId) {
        return new SampleWriteDto(
                locationId,
                10.0,
                LocalDate.of(2024, 6, 1),
                20.0,
                30.0,
                50.0
        );
    }
}
