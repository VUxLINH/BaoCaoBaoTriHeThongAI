package com.smartschool.maintenance.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "maintenance_tasks")
public class MaintenanceTask {
    public static final String SCHEDULED = "SCHEDULED";
    public static final String ACKNOWLEDGED = "ACKNOWLEDGED";
    public static final String IN_PROGRESS = "IN_PROGRESS";
    public static final String COMPLETED = "COMPLETED";
    public static final String CANCELLED = "CANCELLED";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @Column(name = "equipment_code")
    private String equipmentCode;

    @Column(name = "equipment_name")
    private String equipmentName;

    @Column(name = "equipment_room_name")
    private String equipmentRoomName;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "technician_id", nullable = false)
    private User technician;

    @Column(nullable = false)
    private LocalDate scheduledDate;

    private LocalTime scheduledTime;
    private Integer durationMinutes;

    @Column(nullable = false)
    private String status = SCHEDULED;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(columnDefinition = "TEXT")
    private String resultNotes;

    @Column(columnDefinition = "TEXT")
    private String replacedParts;
    private LocalDateTime completedAt;
    private boolean hasEvidenceImage;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Equipment getEquipment() { return equipment; }
    public void setEquipment(Equipment equipment) { this.equipment = equipment; }

    public String getEquipmentCode() { return equipmentCode; }
    public void setEquipmentCode(String equipmentCode) { this.equipmentCode = equipmentCode; }

    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }

    public String getEquipmentRoomName() { return equipmentRoomName; }
    public void setEquipmentRoomName(String equipmentRoomName) {
        this.equipmentRoomName = equipmentRoomName;
    }

    public User getTechnician() { return technician; }
    public void setTechnician(User technician) { this.technician = technician; }

    public LocalDate getScheduledDate() { return scheduledDate; }
    public void setScheduledDate(LocalDate scheduledDate) { this.scheduledDate = scheduledDate; }

    public LocalTime getScheduledTime() { return scheduledTime; }
    public void setScheduledTime(LocalTime scheduledTime) { this.scheduledTime = scheduledTime; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getResultNotes() { return resultNotes; }
    public void setResultNotes(String resultNotes) { this.resultNotes = resultNotes; }

    public String getReplacedParts() { return replacedParts; }
    public void setReplacedParts(String replacedParts) { this.replacedParts = replacedParts; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public boolean isHasEvidenceImage() { return hasEvidenceImage; }
    public void setHasEvidenceImage(boolean hasEvidenceImage) {
        this.hasEvidenceImage = hasEvidenceImage;
    }
}
