package com.smartschool.maintenance.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "maintenance_part_usages")
public class MaintenancePartUsage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id")
    private MaintenanceReport report;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maintenance_task_id")
    private MaintenanceTask maintenanceTask;

    @Column(nullable = false, length = 255)
    private String partName;

    @Column(length = 100)
    private String partCode;

    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal quantity;

    @Column(nullable = false, length = 40)
    private String unit;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal unitCost;

    @Column(length = 255)
    private String supplier;

    @Column(length = 100)
    private String documentNumber;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public MaintenanceReport getReport() { return report; }
    public void setReport(MaintenanceReport report) { this.report = report; }

    public MaintenanceTask getMaintenanceTask() { return maintenanceTask; }
    public void setMaintenanceTask(MaintenanceTask maintenanceTask) { this.maintenanceTask = maintenanceTask; }

    public String getPartName() { return partName; }
    public void setPartName(String partName) { this.partName = partName; }

    public String getPartCode() { return partCode; }
    public void setPartCode(String partCode) { this.partCode = partCode; }

    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }

    public String getSupplier() { return supplier; }
    public void setSupplier(String supplier) { this.supplier = supplier; }

    public String getDocumentNumber() { return documentNumber; }
    public void setDocumentNumber(String documentNumber) { this.documentNumber = documentNumber; }
}
