package com.offshore.groundsampling.controller;

import com.offshore.groundsampling.dto.SampleResponseDto;
import com.offshore.groundsampling.dto.SampleWriteDto;
import com.offshore.groundsampling.service.ResourceNotFoundException;
import com.offshore.groundsampling.service.SampleService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc(addFilters = false)
class SampleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SampleService sampleService;

    @Test
    void getById_notFound_returns404() throws Exception {
        when(sampleService.getById(99L))
                .thenThrow(new ResourceNotFoundException("Sample not found: 99"));

        mockMvc.perform(get("/api/samples/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Sample not found: 99"));
    }

    @Test
    void getById_found_returns200() throws Exception {
        SampleResponseDto dto = new SampleResponseDto(
                1L,
                2L,
                "Site",
                5.5,
                LocalDate.of(2024, 3, 15),
                18.0,
                25.0,
                40.0
        );
        when(sampleService.getById(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/samples/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.locationId").value(2))
                .andExpect(jsonPath("$.locationName").value("Site"))
                .andExpect(jsonPath("$.depthM").value(5.5));
    }

    @Test
    void post_invalidBody_returns400() throws Exception {
        String json = """
                {
                  "locationId": 1,
                  "depthM": 0,
                  "collectedDate": "2024-06-01",
                  "unitWeightKnPerM3": 20,
                  "waterContentPercent": 30,
                  "shearStrengthKpa": 50
                }
                """;

        mockMvc.perform(
                        post("/api/samples")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.details").exists());
    }

    @Test
    void post_valid_returns201() throws Exception {
        String body = """
                {
                  "locationId": 1,
                  "depthM": 10,
                  "collectedDate": "2024-06-01",
                  "unitWeightKnPerM3": 20,
                  "waterContentPercent": 30,
                  "shearStrengthKpa": 50
                }
                """;
        SampleResponseDto created = new SampleResponseDto(
                100L,
                1L,
                "North",
                10.0,
                LocalDate.of(2024, 6, 1),
                20.0,
                30.0,
                50.0
        );
        when(sampleService.create(any(SampleWriteDto.class))).thenReturn(created);

        mockMvc.perform(
                        post("/api/samples")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.locationName").value("North"));

        verify(sampleService).create(any(SampleWriteDto.class));
    }
}
