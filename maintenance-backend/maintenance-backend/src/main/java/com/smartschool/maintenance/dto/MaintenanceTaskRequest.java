package com.smartschool.maintenance.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record MaintenanceTaskRequest(
        String equipmentCode,
        Long technicianId,
        LocalDate scheduledDate,
        LocalTime scheduledTime,
        Integer durationMinutes,
        String notes) {
}
