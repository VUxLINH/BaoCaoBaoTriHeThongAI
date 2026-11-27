package com.smartschool.maintenance.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PartUsageResponse(
        String sourceType,
        Long sourceId,
        LocalDate completedDate,
        String equipmentCode,
        String equipmentName,
        String roomName,
        String workDescription,
        String technicianName,
        String partName,
        String partCode,
        BigDecimal quantity,
        String unit,
        BigDecimal unitCost,
        BigDecimal totalCost,
        String supplier,
        String documentNumber) {
}
