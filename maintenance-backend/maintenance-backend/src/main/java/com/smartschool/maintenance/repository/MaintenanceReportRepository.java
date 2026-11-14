package com.smartschool.maintenance.repository;

import com.smartschool.maintenance.entity.MaintenanceReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MaintenanceReportRepository extends JpaRepository<MaintenanceReport, Long> {
    List<MaintenanceReport> findAllByOrderByIdDesc();
}