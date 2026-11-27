package com.smartschool.maintenance.controller;

import com.smartschool.maintenance.dto.MaintenanceReportCompletionRequest;
import com.smartschool.maintenance.entity.Equipment;
import com.smartschool.maintenance.entity.MaintenanceReport;
import com.smartschool.maintenance.entity.MaintenanceReportImage;
import com.smartschool.maintenance.service.AiService;
import com.smartschool.maintenance.service.EquipmentService;
import com.smartschool.maintenance.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private static final Set<String> VALID_REPORT_STATUSES =
            Set.of("WAITING_TECH", "IN_PROGRESS", "COMPLETED");

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

        if (equipmentCode.isBlank() || description.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Vui lòng chọn thiết bị và nhập mô tả sự cố."));
        }

        Equipment eq = equipmentService.findByCode(equipmentCode).orElse(null);
        if (eq == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mã thiết bị không tồn tại."));
        }
        return ResponseEntity.ok(aiService.analyzeIssue(eq, description, image));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createReport(@RequestBody(required = false) MaintenanceReport report) {
        return createReport(report, null);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createReportWithImage(
            @RequestPart("report") MaintenanceReport report,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return createReport(report, image);
    }

    private ResponseEntity<?> createReport(MaintenanceReport report, MultipartFile image) {
        if (report == null
                || isBlank(report.getEquipmentCode())
                || isBlank(report.getEquipmentName())
                || isBlank(report.getDescription())
                || isBlank(report.getReporterName())
                || isBlank(report.getStatus())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Vui lòng nhập đủ thông tin thiết bị, mô tả, người báo và trạng thái."));
        }

        if (!VALID_REPORT_STATUSES.contains(report.getStatus())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Trạng thái phiếu báo không hợp lệ."));
        }

        if (equipmentService.findByCode(report.getEquipmentCode()).isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Mã thiết bị không tồn tại."));
        }

        try {
            byte[] imageData = image == null || image.isEmpty() ? null : image.getBytes();
            return ResponseEntity.ok(reportService.create(
                    report,
                    imageData,
                    image == null ? null : image.getContentType()));
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(Map.of("message", error.getMessage()));
        } catch (IOException error) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Không đọc được ảnh hiện trường."));
        }
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptReport(@PathVariable Long id) {
        return reportService.accept(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping(value = "/{id}/complete", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> completeReport(
            @PathVariable Long id,
            @RequestBody(required = false) MaintenanceReportCompletionRequest body) {
        return completeReport(id, body, null);
    }

    @PutMapping(value = "/{id}/complete", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> completeReportWithImage(
            @PathVariable Long id,
            @RequestPart("completion") MaintenanceReportCompletionRequest body,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return completeReport(id, body, image);
    }

    private ResponseEntity<?> completeReport(
            Long id,
            MaintenanceReportCompletionRequest body,
            MultipartFile image) {
        if (body == null || isBlank(body.rootCauseNote())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Vui lòng nhập nguyên nhân và cách sửa."));
        }

        String equipmentStatus = body.equipmentStatus() == null
                ? "Đang hoạt động" : body.equipmentStatus();
        if (!Equipment.VALID_STATUSES.contains(equipmentStatus)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Trạng thái thiết bị không hợp lệ."));
        }

        try {
            byte[] imageData = image == null || image.isEmpty() ? null : image.getBytes();
            return reportService.complete(
                            id,
                            equipmentStatus,
                            body.rootCauseNote(),
                            body.replacedParts() == null ? "" : body.replacedParts(),
                            body.parts(),
                            imageData,
                            image == null ? null : image.getContentType())
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (IllegalArgumentException | IllegalStateException error) {
            return ResponseEntity.badRequest().body(Map.of("message", error.getMessage()));
        } catch (IOException error) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Không đọc được ảnh nghiệm thu."));
        }
    }

    @GetMapping("/{id}/images/before")
    public ResponseEntity<byte[]> getBeforeImage(@PathVariable Long id) {
        return reportService.findImage(id, "BEFORE")
                .map(this::imageResponse)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/images/after")
    public ResponseEntity<byte[]> getAfterImage(@PathVariable Long id) {
        return reportService.findImage(id, "AFTER")
                .map(this::imageResponse)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private ResponseEntity<byte[]> imageResponse(MaintenanceReportImage image) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .contentType(MediaType.parseMediaType(image.getContentType()))
                .body(image.getImageData());
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}