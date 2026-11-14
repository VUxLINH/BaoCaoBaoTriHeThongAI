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
}