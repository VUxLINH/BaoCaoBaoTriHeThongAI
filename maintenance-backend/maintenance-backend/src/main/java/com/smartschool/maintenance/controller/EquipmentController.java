package com.smartschool.maintenance.controller;

import com.smartschool.maintenance.entity.Equipment;
import com.smartschool.maintenance.repository.EquipmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/equipments")
public class EquipmentController {

    private final EquipmentRepository equipRepo;

    public EquipmentController(EquipmentRepository equipRepo) {
        this.equipRepo = equipRepo;
    }

    @GetMapping
    public List<Equipment> getAll() {
        return equipRepo.findAll();
    }

    @GetMapping("/{code}")
    public ResponseEntity<?> getByCode(@PathVariable String code) {
        return equipRepo.findByCodeIgnoreCase(code)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404)
                        .body(Map.of("message", "Không tìm thấy thiết bị có mã: " + code)));
    }

    @PostMapping
    public Equipment create(@RequestBody Equipment equipment) {
        return equipRepo.save(equipment);
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

        return equipRepo.findByCodeIgnoreCase(code)
                .<ResponseEntity<?>>map(equipment -> {
                    equipment.setStatus(status);
                    return ResponseEntity.ok(equipRepo.save(equipment));
                })
                .orElseGet(() -> ResponseEntity.status(404)
                        .body(Map.of("message", "Không tìm thấy thiết bị có mã: " + code)));
    }
}