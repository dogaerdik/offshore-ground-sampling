package com.offshore.groundsampling.controller;

import com.offshore.groundsampling.dto.SampleResponseDto;
import com.offshore.groundsampling.dto.SampleWriteDto;
import com.offshore.groundsampling.service.SampleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/samples")
@RequiredArgsConstructor
public class SampleController {

    private final SampleService sampleService;

    @GetMapping
    public List<SampleResponseDto> list(
            @RequestParam(required = false) Long locationId
    ) {
        return sampleService.list(locationId);
    }

    @GetMapping("/{id}")
    public SampleResponseDto get(@PathVariable Long id) {
        return sampleService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SampleResponseDto create(@Valid @RequestBody SampleWriteDto body) {
        return sampleService.create(body);
    }

    @PutMapping("/{id}")
    public SampleResponseDto update(
            @PathVariable Long id,
            @Valid @RequestBody SampleWriteDto body
    ) {
        return sampleService.update(id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        sampleService.delete(id);
    }
}
