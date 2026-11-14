package com.smartschool.maintenance.entity;

import jakarta.persistence.*;

import java.util.Set;

@Entity
@Table(name = "equipments")
public class Equipment {
    public static final Set<String> VALID_STATUSES = Set.of(
            "Đang hoạt động",
            "Đang bảo trì",
            "Đã hỏng"
    );

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    private String category;
    private String roomCode;
    private String roomFullName;
    private String area;
    private String installedDate;
    private String lastMaintenanceDate;
    private String lastRepairDate;
    private String status;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getRoomCode() { return roomCode; }
    public void setRoomCode(String roomCode) { this.roomCode = roomCode; }

    public String getRoomFullName() { return roomFullName; }
    public void setRoomFullName(String roomFullName) { this.roomFullName = roomFullName; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public String getInstalledDate() { return installedDate; }
    public void setInstalledDate(String installedDate) { this.installedDate = installedDate; }

    public String getLastMaintenanceDate() { return lastMaintenanceDate; }
    public void setLastMaintenanceDate(String lastMaintenanceDate) { this.lastMaintenanceDate = lastMaintenanceDate; }

    public String getLastRepairDate() { return lastRepairDate; }
    public void setLastRepairDate(String lastRepairDate) { this.lastRepairDate = lastRepairDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}