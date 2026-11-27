package com.smartschool.maintenance.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "maintenance_reports")
public class MaintenanceReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String equipmentCode;
    private String equipmentName;
    private String roomBadge;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String reporterName;
    private String reportedTime;

    private String aiSeverity;
    private Boolean resolvedByAi = false;

    private String status;
    private String assignedTechName;
    private String acceptedAt;

    @Column(columnDefinition = "TEXT")
    private String rootCauseNote;

    @Column(columnDefinition = "TEXT")
    private String replacedParts;
    private String completedDate;
    @Column(name = "has_image_before", nullable = false, columnDefinition = "BOOLEAN NOT NULL DEFAULT FALSE")
    private boolean hasImageBefore;
    @Column(name = "has_image_after", nullable = false, columnDefinition = "BOOLEAN NOT NULL DEFAULT FALSE")
    private boolean hasImageAfter;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEquipmentCode() { return equipmentCode; }
    public void setEquipmentCode(String equipmentCode) { this.equipmentCode = equipmentCode; }

    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }

    public String getRoomBadge() { return roomBadge; }
    public void setRoomBadge(String roomBadge) { this.roomBadge = roomBadge; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getReporterName() { return reporterName; }
    public void setReporterName(String reporterName) { this.reporterName = reporterName; }

    public String getReportedTime() { return reportedTime; }
    public void setReportedTime(String reportedTime) { this.reportedTime = reportedTime; }

    public String getAiSeverity() { return aiSeverity; }
    public void setAiSeverity(String aiSeverity) { this.aiSeverity = aiSeverity; }

    public Boolean getResolvedByAi() { return resolvedByAi; }
    public void setResolvedByAi(Boolean resolvedByAi) { this.resolvedByAi = resolvedByAi; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAssignedTechName() { return assignedTechName; }
    public void setAssignedTechName(String assignedTechName) { this.assignedTechName = assignedTechName; }

    public String getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(String acceptedAt) { this.acceptedAt = acceptedAt; }

    public String getRootCauseNote() { return rootCauseNote; }
    public void setRootCauseNote(String rootCauseNote) { this.rootCauseNote = rootCauseNote; }

    public String getReplacedParts() { return replacedParts; }
    public void setReplacedParts(String replacedParts) { this.replacedParts = replacedParts; }

    public String getCompletedDate() { return completedDate; }
    public void setCompletedDate(String completedDate) { this.completedDate = completedDate; }

    public boolean isHasImageBefore() { return hasImageBefore; }
    public void setHasImageBefore(boolean hasImageBefore) { this.hasImageBefore = hasImageBefore; }

    public boolean isHasImageAfter() { return hasImageAfter; }
    public void setHasImageAfter(boolean hasImageAfter) { this.hasImageAfter = hasImageAfter; }
}