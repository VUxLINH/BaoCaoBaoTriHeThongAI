package com.smartschool.maintenance.controller;

import com.smartschool.maintenance.dto.MaintenanceTaskRequest;
import com.smartschool.maintenance.dto.MaintenanceTaskResponse;
import com.smartschool.maintenance.dto.PartUsageRequest;
import com.smartschool.maintenance.entity.MaintenanceTaskImage;
import com.smartschool.maintenance.service.MaintenanceTaskService;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/maintenance-tasks")
public class MaintenanceTaskController {
    private final MaintenanceTaskService taskService;
    private final ObjectMapper objectMapper;

    public MaintenanceTaskController(
            MaintenanceTaskService taskService,
            ObjectMapper objectMapper) {
        this.taskService = taskService;
        this.objectMapper = objectMapper;
    }

    @PutMapping("/{id}/acknowledge")
    public ResponseEntity<?> acknowledge(@PathVariable Long id) {
        try {
            return taskService.acknowledge(id)
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (IllegalStateException error) {
            return ResponseEntity.badRequest().body(Map.of("message", error.getMessage()));
        }
    }

    @GetMapping
    public List<MaintenanceTaskResponse> getAll() {
        return taskService.findAll();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody(required = false) MaintenanceTaskRequest request) {
        try {
            return ResponseEntity.ok(taskService.create(request));
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body(Map.of("message", error.getMessage()));
        }
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<?> start(@PathVariable Long id) {
        try {
            return taskService.start(id)
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (IllegalStateException error) {
            return ResponseEntity.badRequest().body(Map.of("message", error.getMessage()));
        }
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> complete(
            @PathVariable Long id,
            @RequestParam(required = false) String resultNotes,
            @RequestParam(required = false) String replacedParts,
            @RequestParam(required = false) String parts,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {
        try {
            List<PartUsageRequest> partUsages = parts == null || parts.isBlank()
                    ? List.of()
                    : objectMapper.readValue(parts, new TypeReference<ArrayList<PartUsageRequest>>() {});
            return taskService.complete(
                            id,
                            resultNotes,
                            replacedParts,
                            image == null || image.isEmpty() ? null : image.getBytes(),
                            image == null || image.isEmpty() ? null : image.getContentType(),
                            partUsages)
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (IllegalArgumentException | IllegalStateException error) {
            return ResponseEntity.badRequest().body(Map.of("message", error.getMessage()));
        } catch (tools.jackson.core.JacksonException error) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Danh sách linh kiện có định dạng không hợp lệ."));
        }
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getImage(@PathVariable Long id) {
        return taskService.findImage(id)
                .map(this::imageResponse)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private ResponseEntity<byte[]> imageResponse(MaintenanceTaskImage image) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .contentType(MediaType.parseMediaType(image.getContentType()))
                .body(image.getImageData());
    }
}
