package com.smartschool.maintenance.repository;

import com.smartschool.maintenance.entity.MaintenancePartUsage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaintenancePartUsageRepository extends JpaRepository<MaintenancePartUsage, Long> {
}
