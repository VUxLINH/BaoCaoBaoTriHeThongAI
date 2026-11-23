package com.smartschool.maintenance.service;

import com.smartschool.maintenance.entity.Equipment;
import com.smartschool.maintenance.entity.MaintenanceReport;
import com.smartschool.maintenance.entity.ShiftSchedule;
import com.smartschool.maintenance.repository.EquipmentRepository;
import com.smartschool.maintenance.repository.MaintenanceReportRepository;
import com.smartschool.maintenance.repository.ShiftScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class ReportService {

    private static final DateTimeFormatter REPORTED_TIME_FORMAT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter TIME_FORMAT =
            DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final String DEFAULT_TECH_NAME = "Anh Nguyễn Văn B";

    private final MaintenanceReportRepository reportRepository;
    private final EquipmentRepository equipmentRepository;
    private final ShiftScheduleRepository shiftRepository;

    public ReportService(
            MaintenanceReportRepository reportRepository,
            EquipmentRepository equipmentRepository,
            ShiftScheduleRepository shiftRepository) {
        this.reportRepository = reportRepository;
        this.equipmentRepository = equipmentRepository;
        this.shiftRepository = shiftRepository;
    }

    public List<MaintenanceReport> findAll() {
        return reportRepository.findAllByOrderByIdDesc();
    }

    public MaintenanceReport create(MaintenanceReport report) {
        if (report.getReportedTime() == null || report.getReportedTime().isBlank()) {
            report.setReportedTime(LocalDateTime.now().format(REPORTED_TIME_FORMAT));
        }

        if ("WAITING_TECH".equals(report.getStatus())) {
            report.setAssignedTechName(findOnlineTechnician());
        }

        return reportRepository.save(report);
    }

    public Optional<MaintenanceReport> accept(Long id) {
        return reportRepository.findById(id).map(report -> {
            report.setStatus("IN_PROGRESS");
            report.setAcceptedAt(LocalTime.now().format(TIME_FORMAT));
            return reportRepository.save(report);
        });
    }

    @Transactional
    public Optional<MaintenanceReport> complete(
            Long id,
            String equipmentStatus,
            String rootCauseNote,
            String replacedParts) {
        return reportRepository.findById(id).map(report -> {
            String today = LocalDate.now().format(DATE_FORMAT);
            report.setStatus("COMPLETED");
            report.setRootCauseNote(rootCauseNote);
            report.setReplacedParts(replacedParts);
            report.setCompletedDate(today);

            equipmentRepository.findByCodeIgnoreCase(report.getEquipmentCode())
                    .ifPresent(equipment -> updateEquipmentAfterRepair(equipment, equipmentStatus, today));

            return reportRepository.save(report);
        });
    }

    private String findOnlineTechnician() {
        for (ShiftSchedule shift : shiftRepository.findAll()) {
            if (Boolean.TRUE.equals(shift.getIsOnline())) {
                return shift.getTechName();
            }
        }
        return DEFAULT_TECH_NAME;
    }

    private void updateEquipmentAfterRepair(Equipment equipment, String status, String date) {
        equipment.setLastRepairDate(date);
        equipment.setStatus(status);
        equipmentRepository.save(equipment);
    }
}
