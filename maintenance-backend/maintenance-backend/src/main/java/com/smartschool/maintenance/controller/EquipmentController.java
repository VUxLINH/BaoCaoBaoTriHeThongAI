package com.smartschool.maintenance.controller;

import com.smartschool.maintenance.entity.Equipment;
import com.smartschool.maintenance.entity.EquipmentImage;
import com.smartschool.maintenance.service.EquipmentService;
import com.smartschool.maintenance.service.EquipmentImageService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/equipments")
public class EquipmentController {

    private final EquipmentService equipmentService;
    private final EquipmentImageService equipmentImageService;

    public EquipmentController(
            EquipmentService equipmentService,
            EquipmentImageService equipmentImageService) {
        this.equipmentService = equipmentService;
        this.equipmentImageService = equipmentImageService;
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
    public ResponseEntity<?> create(@RequestBody Equipment equipment) {
        try {
            return ResponseEntity.ok(equipmentService.create(equipment));
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(Map.of("message", error.getMessage()));
        }
    }

    @PostMapping(value = "/{code}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadImage(
            @PathVariable String code,
            @RequestParam("image") MultipartFile image) {
        try {
            equipmentImageService.save(code, image);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(Map.of("message", error.getMessage()));
        } catch (IOException error) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Không thể đọc ảnh thiết bị."));
        }
    }

    @GetMapping("/{code}/image")
    public ResponseEntity<byte[]> getImage(@PathVariable String code) {
        return equipmentImageService.findByEquipmentCode(code)
                .map(this::imageResponse)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<?> delete(@PathVariable String code) {
        if (equipmentService.deleteByCode(code)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(404)
                .body(Map.of("message", "Không tìm thấy thiết bị có mã: " + code));
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

    private ResponseEntity<byte[]> imageResponse(EquipmentImage image) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                .contentType(MediaType.parseMediaType(image.getContentType()))
                .body(image.getImageData());
    }
}