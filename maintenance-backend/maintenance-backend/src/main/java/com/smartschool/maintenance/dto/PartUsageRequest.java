package com.smartschool.maintenance.dto;

import java.math.BigDecimal;

public record PartUsageRequest(
        String partName,
        String partCode,
        BigDecimal quantity,
        String unit,
        BigDecimal unitCost,
        String supplier,
        String documentNumber) {
}
