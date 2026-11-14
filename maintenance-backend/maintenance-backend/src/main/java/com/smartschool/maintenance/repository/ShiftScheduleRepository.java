package com.smartschool.maintenance.repository;

import com.smartschool.maintenance.entity.ShiftSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShiftScheduleRepository extends JpaRepository<ShiftSchedule, Long> {
    List<ShiftSchedule> findAllByTechNameIgnoreCase(String techName);
}