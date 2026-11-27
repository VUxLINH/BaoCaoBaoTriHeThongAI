package com.smartschool.maintenance.repository;

import com.smartschool.maintenance.entity.MaintenanceTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaintenanceTaskRepository extends JpaRepository<MaintenanceTask, Long> {
    List<MaintenanceTask> findAllByOrderByScheduledDateAscIdAsc();
}
