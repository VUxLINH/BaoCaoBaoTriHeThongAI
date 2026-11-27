package com.smartschool.maintenance.controller;

import com.smartschool.maintenance.entity.Equipment;
import com.smartschool.maintenance.service.EquipmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/equipments")
public class EquipmentController {

    private final EquipmentService equipmentService;

    public EquipmentController(EquipmentService equipmentService) {
        this.equipmentService = equipmentService;
    }

    @GetMapping
    public List<Equipment> getAll() {
        return equipmentService.findAll();
    }

    @GetMapping("/{code}")
    public ResponseEntity<?> getByCode(@PathVariable String code) {
        return equipmentService.findByCode(code)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404)
                        .body(Map.of("message", "Không tìm thấy thiết bị có mã: " + code)));
    }

    @PostMapping
    public Equipment create(@RequestBody Equipment equipment) {
        return equipmentService.create(equipment);
    }

    @PutMapping("/{code}/details")
    public ResponseEntity<?> updateDetails(
            @PathVariable String code,
            @RequestBody(required = false) Equipment details) {
        if (details == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Thiếu thông tin chi tiết thiết bị."));
        }
        try {
            return equipmentService.updateDetails(code, details)
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(404)
                            .body(Map.of("message", "Không tìm thấy thiết bị có mã: " + code)));
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(Map.of("message", error.getMessage()));
        }
    }

    @PutMapping("/{code}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String code,
            @RequestBody(required = false) Map<String, String> body) {
        String status = body == null ? null : body.get("status");
        if (status == null || !Equipment.VALID_STATUSES.contains(status)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Trạng thái thiết bị không hợp lệ."));
        }

        return equipmentService.updateStatus(code, status)
                .<ResponseEntity<?>>map(equipment -> {
                    return ResponseEntity.ok(equipment);
                })
                .orElseGet(() -> ResponseEntity.status(404)
                        .body(Map.of("message", "Không tìm thấy thiết bị có mã: " + code)));
    }
}