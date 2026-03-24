package com.offshore.groundsampling.entity;

import com.offshore.groundsampling.entity.base.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "samples")
public class Sample extends AuditEntity<String> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Column(name = "depth_m", nullable = false)
    private Double depthM;

    @Column(name = "collected_date", nullable = false)
    private LocalDate collectedDate;

    @Column(name = "unit_weight_kn_per_m3", nullable = false)
    private Double unitWeightKnPerM3;

    @Column(name = "water_content_percent", nullable = false)
    private Double waterContentPercent;

    @Column(name = "shear_strength_kpa", nullable = false)
    private Double shearStrengthKpa;
}
