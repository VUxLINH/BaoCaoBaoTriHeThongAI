package com.smartschool.maintenance.controller;

import com.smartschool.maintenance.entity.Equipment;
import com.smartschool.maintenance.entity.MaintenanceReport;
import com.smartschool.maintenance.entity.ShiftSchedule;
import com.smartschool.maintenance.repository.EquipmentRepository;
import com.smartschool.maintenance.repository.MaintenanceReportRepository;
import com.smartschool.maintenance.repository.ShiftScheduleRepository;
import com.smartschool.maintenance.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final MaintenanceReportRepository reportRepo;
    private final EquipmentRepository equipRepo;
    private final ShiftScheduleRepository shiftRepo;
    private final AiService aiService;

    public ReportController(
            MaintenanceReportRepository reportRepo,
            EquipmentRepository equipRepo,
            ShiftScheduleRepository shiftRepo,
            AiService aiService) {
        this.reportRepo = reportRepo;
        this.equipRepo = equipRepo;
        this.shiftRepo = shiftRepo;
        this.aiService = aiService;
    }

    @GetMapping
    public List<MaintenanceReport> getAllReports() {
        return reportRepo.findAllByOrderByIdDesc();
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeWithAi(
            @RequestParam("equipmentCode") String equipmentCode,
            @RequestParam("description") String description,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        Equipment eq = equipRepo.findByCodeIgnoreCase(equipmentCode).orElse(null);
        if (eq == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mã thiết bị không tồn tại."));
        }
        return ResponseEntity.ok(aiService.analyzeIssue(eq, description, image));
    }

    @PostMapping
    public MaintenanceReport createReport(@RequestBody MaintenanceReport report) {
        if (report.getReportedTime() == null || report.getReportedTime().isBlank()) {
            report.setReportedTime(LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
        }

        if ("WAITING_TECH".equals(report.getStatus())) {
            String onlineTech = shiftRepo.findAll().stream()
                    .filter(s -> Boolean.TRUE.equals(s.getIsOnline()))
                    .map(ShiftSchedule::getTechName)
                    .findFirst()
                    .orElse("Anh Nguyễn Văn B");
            report.setAssignedTechName(onlineTech);
        }

        return reportRepo.save(report);
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptReport(@PathVariable Long id) {
        return reportRepo.findById(id).map(r -> {
            r.setStatus("IN_PROGRESS");
            r.setAcceptedAt(LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm")));
            return ResponseEntity.ok(reportRepo.save(r));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeReport(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String equipmentStatus = body.getOrDefault("equipmentStatus", "Đang hoạt động");
        if (!Equipment.VALID_STATUSES.contains(equipmentStatus)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Trạng thái thiết bị không hợp lệ."));
        }

        return reportRepo.findById(id).map(r -> {
            String today = LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            r.setStatus("COMPLETED");
            r.setRootCauseNote(body.getOrDefault("rootCauseNote", ""));
            r.setReplacedParts(body.getOrDefault("replacedParts", ""));
            r.setCompletedDate(today);

            equipRepo.findByCodeIgnoreCase(r.getEquipmentCode()).ifPresent(eq -> {
                eq.setLastRepairDate(today);
                eq.setStatus(equipmentStatus);
                equipRepo.save(eq);
            });

            return ResponseEntity.ok(reportRepo.save(r));
        }).orElse(ResponseEntity.notFound().build());
    }
}