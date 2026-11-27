package com.smartschool.maintenance.repository;

import com.smartschool.maintenance.entity.MaintenanceReportImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MaintenanceReportImageRepository
        extends JpaRepository<MaintenanceReportImage, Long> {
    Optional<MaintenanceReportImage> findByReportIdAndImageType(Long reportId, String imageType);
}
