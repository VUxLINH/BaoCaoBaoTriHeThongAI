package com.smartschool.maintenance.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record MaintenanceTaskResponse(
        Long id,
        String equipmentCode,
        String equipmentName,
        String roomName,
        Long technicianId,
        String technicianName,
        LocalDate scheduledDate,
        LocalTime scheduledTime,
        Integer durationMinutes,
        String status,
        String notes,
        String resultNotes,
        String replacedParts,
        LocalDateTime completedAt,
        boolean hasEvidenceImage) {
}
