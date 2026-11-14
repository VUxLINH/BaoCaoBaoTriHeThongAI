package com.smartschool.maintenance.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "shift_schedules")
public class ShiftSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String shiftName;
    private String techName;
    private String area;
    private Boolean isOnline = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getShiftName() { return shiftName; }
    public void setShiftName(String shiftName) { this.shiftName = shiftName; }

    public String getTechName() { return techName; }
    public void setTechName(String techName) { this.techName = techName; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public Boolean getIsOnline() { return isOnline; }
    public void setIsOnline(Boolean isOnline) { this.isOnline = isOnline; }
}