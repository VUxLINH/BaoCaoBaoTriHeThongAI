package com.smartschool.maintenance.service;

import com.smartschool.maintenance.entity.Equipment;
import com.smartschool.maintenance.entity.MaintenanceReport;
import com.smartschool.maintenance.entity.MaintenanceReportImage;
import com.smartschool.maintenance.repository.EquipmentRepository;
import com.smartschool.maintenance.repository.MaintenanceReportImageRepository;
import com.smartschool.maintenance.repository.MaintenanceReportRepository;
import com.smartschool.maintenance.repository.ShiftScheduleRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ReportServiceTests {

    @Test
    void completeUpdatesReportAndEquipment() {
        MaintenanceReportRepository reportRepository = mock(MaintenanceReportRepository.class);
        MaintenanceReportImageRepository imageRepository = mock(MaintenanceReportImageRepository.class);
        EquipmentRepository equipmentRepository = mock(EquipmentRepository.class);
        ShiftScheduleRepository shiftRepository = mock(ShiftScheduleRepository.class);
        MaintenancePartUsageService partUsageService = mock(MaintenancePartUsageService.class);
        ReportService reportService =
                new ReportService(
                        reportRepository, imageRepository, equipmentRepository, shiftRepository, partUsageService);

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
        MaintenanceReportImageRepository imageRepository = mock(MaintenanceReportImageRepository.class);
        EquipmentRepository equipmentRepository = mock(EquipmentRepository.class);
        ShiftScheduleRepository shiftRepository = mock(ShiftScheduleRepository.class);
        MaintenancePartUsageService partUsageService = mock(MaintenancePartUsageService.class);
        ReportService reportService =
                new ReportService(
                        reportRepository, imageRepository, equipmentRepository, shiftRepository, partUsageService);

        when(reportRepository.findById(1L)).thenReturn(Optional.empty());

        assertTrue(reportService.complete(1L, "Đang hoạt động", "Đã sửa", "").isEmpty());
    }

    @Test
    void completedReportCannotBeCompletedAgain() {
        MaintenanceReportRepository reportRepository = mock(MaintenanceReportRepository.class);
        ReportService reportService = new ReportService(
                reportRepository,
                mock(MaintenanceReportImageRepository.class),
                mock(EquipmentRepository.class),
                mock(ShiftScheduleRepository.class),
                mock(MaintenancePartUsageService.class));
        MaintenanceReport report = new MaintenanceReport();
        report.setStatus("COMPLETED");
        when(reportRepository.findById(1L)).thenReturn(Optional.of(report));

        assertThrows(
                IllegalStateException.class,
                () -> reportService.complete(1L, "Đang hoạt động", "Đã sửa", ""));
    }

    @Test
    void createStoresReporterImageAndMarksReport() {
        MaintenanceReportRepository reportRepository = mock(MaintenanceReportRepository.class);
        MaintenanceReportImageRepository imageRepository = mock(MaintenanceReportImageRepository.class);
        ReportService reportService = new ReportService(
                reportRepository,
                imageRepository,
                mock(EquipmentRepository.class),
                mock(ShiftScheduleRepository.class),
                mock(MaintenancePartUsageService.class));
        MaintenanceReport report = new MaintenanceReport();
        report.setStatus("WAITING_TECH");
        report.setEquipmentCode("TB-01");
        when(reportRepository.save(report)).thenAnswer(invocation -> {
            report.setId(11L);
            return report;
        });

        MaintenanceReport saved = reportService.create(report, new byte[] {1, 2, 3}, "image/png");

        assertTrue(saved.isHasImageBefore());
        ArgumentCaptor<MaintenanceReportImage> imageCaptor =
                ArgumentCaptor.forClass(MaintenanceReportImage.class);
        verify(imageRepository).save(imageCaptor.capture());
        assertEquals(11L, imageCaptor.getValue().getReportId());
        assertEquals("BEFORE", imageCaptor.getValue().getImageType());
        assertEquals("image/png", imageCaptor.getValue().getContentType());
    }

    @Test
    void completeStoresTechnicianImageAndMarksReport() {
        MaintenanceReportRepository reportRepository = mock(MaintenanceReportRepository.class);
        MaintenanceReportImageRepository imageRepository = mock(MaintenanceReportImageRepository.class);
        ReportService reportService = new ReportService(
                reportRepository,
                imageRepository,
                mock(EquipmentRepository.class),
                mock(ShiftScheduleRepository.class),
                mock(MaintenancePartUsageService.class));
        MaintenanceReport report = new MaintenanceReport();
        report.setId(12L);
        report.setStatus("IN_PROGRESS");
        report.setEquipmentCode("TB-01");
        when(reportRepository.findById(12L)).thenReturn(Optional.of(report));
        when(reportRepository.save(report)).thenReturn(report);

        reportService.complete(
                12L,
                "Đang hoạt động",
                "Đã sửa xong",
                "",
                java.util.List.of(),
                new byte[] {4, 5, 6},
                "image/jpeg");

        assertTrue(report.isHasImageAfter());
        ArgumentCaptor<MaintenanceReportImage> imageCaptor =
                ArgumentCaptor.forClass(MaintenanceReportImage.class);
        verify(imageRepository).save(imageCaptor.capture());
        assertEquals(12L, imageCaptor.getValue().getReportId());
        assertEquals("AFTER", imageCaptor.getValue().getImageType());
        assertEquals("image/jpeg", imageCaptor.getValue().getContentType());
    }
}
