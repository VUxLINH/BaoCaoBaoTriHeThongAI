package com.smartschool.maintenance.dto;

import java.util.List;

public record MaintenanceReportCompletionRequest(
        String equipmentStatus,
        String rootCauseNote,
        String replacedParts,
        List<PartUsageRequest> parts) {
}
