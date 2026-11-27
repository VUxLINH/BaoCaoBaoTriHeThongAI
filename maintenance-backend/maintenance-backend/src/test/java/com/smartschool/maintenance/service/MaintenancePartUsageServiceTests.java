package com.smartschool.maintenance.service;

import com.smartschool.maintenance.dto.PartUsageRequest;
import com.smartschool.maintenance.entity.MaintenancePartUsage;
import com.smartschool.maintenance.entity.MaintenanceReport;
import com.smartschool.maintenance.entity.MaintenanceTask;
import com.smartschool.maintenance.entity.Equipment;
import com.smartschool.maintenance.entity.User;
import com.smartschool.maintenance.repository.MaintenancePartUsageRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class MaintenancePartUsageServiceTests {

    @Test
    void monthlyReportIncludesCompletedUsagesAndCalculatesLineTotal() {
        MaintenancePartUsageRepository repository = mock(MaintenancePartUsageRepository.class);
        MaintenancePartUsageService service = new MaintenancePartUsageService(repository);

        MaintenanceReport report = new MaintenanceReport();
        report.setId(5L);
        report.setEquipmentCode("TB-A201-MC");
        report.setEquipmentName("Máy chiếu");
        report.setRoomBadge("A201");
        report.setAssignedTechName("KTV");
        report.setDescription("Thay dây nguồn");
        report.setStatus("COMPLETED");
        report.setCompletedDate("14/03/2026");

        MaintenancePartUsage usage = new MaintenancePartUsage();
        usage.setReport(report);
        usage.setPartName("Dây nguồn");
        usage.setQuantity(new BigDecimal("2"));
        usage.setUnit("cái");
        usage.setUnitCost(new BigDecimal("125000"));

        Equipment taskEquipment = new Equipment();
        taskEquipment.setCode("TB-02");
        taskEquipment.setName("Quạt");
        User technician = new User();
        technician.setFullName("KTV");
        MaintenanceTask task = new MaintenanceTask();
        task.setId(8L);
        task.setEquipment(taskEquipment);
        task.setTechnician(technician);
        task.setNotes("Thay tụ điện");
        task.setStatus(MaintenanceTask.COMPLETED);
        task.setCompletedAt(LocalDateTime.of(2026, 3, 15, 14, 30));
        MaintenancePartUsage routineUsage = new MaintenancePartUsage();
        routineUsage.setMaintenanceTask(task);
        routineUsage.setPartName("Tụ điện");
        routineUsage.setQuantity(new BigDecimal("1"));
        routineUsage.setUnit("cái");
        routineUsage.setUnitCost(new BigDecimal("75000"));

        when(repository.findAll()).thenReturn(List.of(usage, routineUsage));

        var result = service.findByMonth(2026, 3);

        assertEquals(2, result.size());
        assertEquals(new BigDecimal("250000.00"), result.get(0).totalCost());
        assertEquals("Sự cố", result.get(0).sourceType());
        assertEquals("Bảo trì định kỳ", result.get(1).sourceType());
        assertEquals(new BigDecimal("75000.00"), result.get(1).totalCost());
        assertEquals(0, service.findByMonth(2026, 4).size());
    }

    @Test
    void partUsageRejectsZeroQuantityBeforeSaving() {
        MaintenancePartUsageRepository repository = mock(MaintenancePartUsageRepository.class);
        MaintenancePartUsageService service = new MaintenancePartUsageService(repository);
        MaintenanceReport report = new MaintenanceReport();
        PartUsageRequest invalid = new PartUsageRequest(
                "Dây nguồn", null, BigDecimal.ZERO, "cái", BigDecimal.ZERO, null, null);

        assertThrows(
                IllegalArgumentException.class,
                () -> service.createForReport(report, List.of(invalid)));
        verify(repository, org.mockito.Mockito.never())
                .saveAll(org.mockito.ArgumentMatchers.anyList());
    }
}
