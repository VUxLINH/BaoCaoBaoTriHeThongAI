package com.smartschool.maintenance.controller;

import com.smartschool.maintenance.entity.Equipment;
import com.smartschool.maintenance.entity.MaintenanceReport;
import com.smartschool.maintenance.service.AiService;
import com.smartschool.maintenance.service.EquipmentService;
import com.smartschool.maintenance.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final EquipmentService equipmentService;
    private final AiService aiService;

    public ReportController(
            ReportService reportService,
            EquipmentService equipmentService,
            AiService aiService) {
        this.reportService = reportService;
        this.equipmentService = equipmentService;
        this.aiService = aiService;
    }

    @GetMapping
    public List<MaintenanceReport> getAllReports() {
        return reportService.findAll();
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeWithAi(
            @RequestParam("equipmentCode") String equipmentCode,
            @RequestParam("description") String description,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        Equipment eq = equipmentService.findByCode(equipmentCode).orElse(null);
        if (eq == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mã thiết bị không tồn tại."));
        }
        return ResponseEntity.ok(aiService.analyzeIssue(eq, description, image));
    }

    @PostMapping
    public MaintenanceReport createReport(@RequestBody MaintenanceReport report) {
        return reportService.create(report);
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptReport(@PathVariable Long id) {
        return reportService.accept(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeReport(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String equipmentStatus = body.getOrDefault("equipmentStatus", "Đang hoạt động");
        if (!Equipment.VALID_STATUSES.contains(equipmentStatus)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Trạng thái thiết bị không hợp lệ."));
        }

        return reportService.complete(
                        id,
                        equipmentStatus,
                        body.getOrDefault("rootCauseNote", ""),
                        body.getOrDefault("replacedParts", ""))
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}