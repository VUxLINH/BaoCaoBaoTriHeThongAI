package com.smartschool.maintenance.service;

import com.smartschool.maintenance.entity.Equipment;
import com.smartschool.maintenance.entity.MaintenanceReport;
import com.smartschool.maintenance.repository.EquipmentRepository;
import com.smartschool.maintenance.repository.MaintenanceReportRepository;
import com.smartschool.maintenance.repository.ShiftScheduleRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ReportServiceTests {

    @Test
    void completeUpdatesReportAndEquipment() {
        MaintenanceReportRepository reportRepository = mock(MaintenanceReportRepository.class);
        EquipmentRepository equipmentRepository = mock(EquipmentRepository.class);
        ShiftScheduleRepository shiftRepository = mock(ShiftScheduleRepository.class);
        ReportService reportService =
                new ReportService(reportRepository, equipmentRepository, shiftRepository);

        MaintenanceReport report = new MaintenanceReport();
        report.setEquipmentCode("TB-A201-MC");
        Equipment equipment = new Equipment();

        when(reportRepository.findById(1L)).thenReturn(Optional.of(report));
        when(equipmentRepository.findByCodeIgnoreCase("TB-A201-MC"))
                .thenReturn(Optional.of(equipment));
        when(reportRepository.save(report)).thenReturn(report);
        when(equipmentRepository.save(equipment)).thenReturn(equipment);

        Optional<MaintenanceReport> result =
                reportService.complete(1L, "Đang hoạt động", "Đã thay dây nguồn", "Dây nguồn");

        assertTrue(result.isPresent());
        assertEquals("COMPLETED", report.getStatus());
        assertEquals("Đã thay dây nguồn", report.getRootCauseNote());
        assertEquals("Dây nguồn", report.getReplacedParts());
        assertTrue(report.getCompletedDate().matches("\\d{2}/\\d{2}/\\d{4}"));
        assertEquals("Đang hoạt động", equipment.getStatus());
        assertEquals(report.getCompletedDate(), equipment.getLastRepairDate());
        verify(reportRepository).save(report);
        verify(equipmentRepository).save(equipment);
    }

    @Test
    void completeReturnsEmptyWhenReportDoesNotExist() {
        MaintenanceReportRepository reportRepository = mock(MaintenanceReportRepository.class);
        EquipmentRepository equipmentRepository = mock(EquipmentRepository.class);
        ShiftScheduleRepository shiftRepository = mock(ShiftScheduleRepository.class);
        ReportService reportService =
                new ReportService(reportRepository, equipmentRepository, shiftRepository);

        when(reportRepository.findById(1L)).thenReturn(Optional.empty());

        assertTrue(reportService.complete(1L, "Đang hoạt động", "Đã sửa", "").isEmpty());
    }
}
