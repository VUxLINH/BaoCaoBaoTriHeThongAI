package com.smartschool.maintenance.repository;

import com.smartschool.maintenance.entity.ShiftSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShiftScheduleRepository extends JpaRepository<ShiftSchedule, Long> {
}