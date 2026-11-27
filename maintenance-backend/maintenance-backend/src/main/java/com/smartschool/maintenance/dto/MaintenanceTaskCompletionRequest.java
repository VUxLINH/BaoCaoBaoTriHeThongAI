package com.smartschool.maintenance.dto;

public record MaintenanceTaskCompletionRequest(
        String resultNotes,
        String replacedParts) {
}
