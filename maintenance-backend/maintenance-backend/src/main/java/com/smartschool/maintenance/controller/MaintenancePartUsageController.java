package com.smartschool.maintenance.controller;

import com.smartschool.maintenance.dto.PartUsageResponse;
import com.smartschool.maintenance.service.MaintenancePartUsageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.DateTimeException;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/part-usages")
public class MaintenancePartUsageController {
    private final MaintenancePartUsageService service;

    public MaintenancePartUsageController(MaintenancePartUsageService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<?> getByMonth(
            @RequestParam int year,
            @RequestParam int month) {
        try {
            YearMonth.of(year, month);
            List<PartUsageResponse> usages = service.findByMonth(year, month);
            return ResponseEntity.ok(usages);
        } catch (DateTimeException error) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Tháng hoặc năm báo cáo không hợp lệ."));
        }
    }
}
