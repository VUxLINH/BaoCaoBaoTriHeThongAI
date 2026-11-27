package com.smartschool.maintenance.service;

import com.smartschool.maintenance.dto.MaintenanceTaskRequest;
import com.smartschool.maintenance.dto.MaintenanceTaskResponse;
import com.smartschool.maintenance.dto.PartUsageRequest;
import com.smartschool.maintenance.entity.Equipment;
import com.smartschool.maintenance.entity.MaintenanceTask;
import com.smartschool.maintenance.entity.MaintenanceTaskImage;
import com.smartschool.maintenance.entity.User;
import com.smartschool.maintenance.repository.EquipmentRepository;
import com.smartschool.maintenance.repository.MaintenanceTaskImageRepository;
import com.smartschool.maintenance.repository.MaintenanceTaskRepository;
import com.smartschool.maintenance.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.List;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Service
public class MaintenanceTaskService {
    private static final long MAX_IMAGE_SIZE_BYTES = 10L * 1024 * 1024;
    private static final List<String> ALLOWED_IMAGE_TYPES =
            List.of("image/jpeg", "image/png", "image/webp");
    private static final DateTimeFormatter LEGACY_DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final MaintenanceTaskRepository taskRepository;
    private final MaintenanceTaskImageRepository imageRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final MaintenancePartUsageService partUsageService;

    public MaintenanceTaskService(
            MaintenanceTaskRepository taskRepository,
            MaintenanceTaskImageRepository imageRepository,
            EquipmentRepository equipmentRepository,
            UserRepository userRepository,
            MaintenancePartUsageService partUsageService) {
        this.taskRepository = taskRepository;
        this.imageRepository = imageRepository;
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
        this.partUsageService = partUsageService;
    }

    @Transactional(readOnly = true)
    public List<MaintenanceTaskResponse> findAll() {
        return taskRepository.findAllByOrderByScheduledDateAscIdAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public MaintenanceTaskResponse create(MaintenanceTaskRequest request) {
        if (request == null || request.equipmentCode() == null
                || request.equipmentCode().isBlank()
                || request.technicianId() == null
                || request.scheduledDate() == null) {
            throw new IllegalArgumentException("Vui lòng chọn thiết bị, KTV và ngày bảo trì.");
        }

        Equipment equipment = equipmentRepository.findByCodeIgnoreCase(request.equipmentCode().trim())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thiết bị được chọn."));
        User technician = userRepository.findById(request.technicianId())
                .filter(user -> "TECHNICIAN".equalsIgnoreCase(user.getRole())
                        || "TECH".equalsIgnoreCase(user.getRole()))
                .orElseThrow(() -> new IllegalArgumentException("Tài khoản KTV không hợp lệ."));

        MaintenanceTask task = new MaintenanceTask();
        task.setEquipment(equipment);
        task.setTechnician(technician);
        task.setScheduledDate(request.scheduledDate());
        LocalTime scheduledTime = request.scheduledTime() == null
                ? LocalTime.of(9, 0) : request.scheduledTime();
        int durationMinutes = request.durationMinutes() == null
                ? 60 : request.durationMinutes();
        if (durationMinutes < 15 || durationMinutes > 480) {
            throw new IllegalArgumentException("Thời lượng bảo trì phải từ 15 đến 480 phút.");
        }
        if (scheduledTime.plusMinutes(durationMinutes).isBefore(scheduledTime)) {
            throw new IllegalArgumentException("Lịch bảo trì không được kéo dài sang ngày hôm sau.");
        }
        ensureNoScheduleConflict(
                equipment, technician, request.scheduledDate(), scheduledTime, durationMinutes);
        task.setScheduledTime(scheduledTime);
        task.setDurationMinutes(durationMinutes);
        task.setNotes(clean(request.notes()));
        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public Optional<MaintenanceTaskResponse> acknowledge(Long id) {
        return taskRepository.findById(id).map(task -> {
            if (!MaintenanceTask.SCHEDULED.equals(task.getStatus())) {
                throw new IllegalStateException("Chỉ có thể nhận lịch đang chờ xác nhận.");
            }
            task.setStatus(MaintenanceTask.ACKNOWLEDGED);
            return toResponse(taskRepository.save(task));
        });
    }

    @Transactional
    public Optional<MaintenanceTaskResponse> start(Long id) {
        return taskRepository.findById(id).map(task -> {
            if (!MaintenanceTask.ACKNOWLEDGED.equals(task.getStatus())) {
                throw new IllegalStateException("KTV cần xác nhận nhận lịch trước khi bắt đầu.");
            }
            task.setStatus(MaintenanceTask.IN_PROGRESS);
            return toResponse(taskRepository.save(task));
        });
    }

    @Transactional
    public Optional<MaintenanceTaskResponse> complete(
            Long id,
            String resultNotes,
            String replacedParts,
            byte[] imageData,
            String imageContentType) {
        return complete(id, resultNotes, replacedParts, imageData, imageContentType, List.of());
    }

    @Transactional
    public Optional<MaintenanceTaskResponse> complete(
            Long id,
            String resultNotes,
            String replacedParts,
            byte[] imageData,
            String imageContentType,
            List<PartUsageRequest> parts) {
        if (resultNotes == null || resultNotes.isBlank()) {
            throw new IllegalArgumentException("Vui lòng nhập kết quả bảo trì.");
        }
        if (imageData != null) {
            if (imageData.length > MAX_IMAGE_SIZE_BYTES) {
                throw new IllegalArgumentException("Ảnh minh chứng không được vượt quá 10 MB.");
            }
            if (imageContentType == null
                    || !ALLOWED_IMAGE_TYPES.contains(imageContentType.toLowerCase())) {
                throw new IllegalArgumentException("Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP.");
            }
        }

        return taskRepository.findById(id).map(task -> {
            if (!MaintenanceTask.IN_PROGRESS.equals(task.getStatus())) {
                throw new IllegalStateException("Hãy bắt đầu lịch bảo trì trước khi hoàn tất.");
            }

            partUsageService.createForTask(task, parts);
            LocalDate today = LocalDate.now();
            task.setStatus(MaintenanceTask.COMPLETED);
            task.setResultNotes(resultNotes.trim());
            task.setReplacedParts(clean(replacedParts));
            task.setCompletedAt(LocalDateTime.now());
            if (imageData != null) {
                MaintenanceTaskImage image = new MaintenanceTaskImage();
                image.setTaskId(task.getId());
                image.setContentType(imageContentType.toLowerCase());
                image.setImageData(imageData);
                imageRepository.save(image);
                task.setHasEvidenceImage(true);
            }
            task.getEquipment().setLastMaintenanceDate(today.format(LEGACY_DATE_FORMAT));
            equipmentRepository.save(task.getEquipment());
            return toResponse(taskRepository.save(task));
        });
    }

    @Transactional(readOnly = true)
    public Optional<MaintenanceTaskImage> findImage(Long id) {
        return taskRepository.existsById(id) ? imageRepository.findById(id) : Optional.empty();
    }

    private MaintenanceTaskResponse toResponse(MaintenanceTask task) {
        Equipment equipment = task.getEquipment();
        User technician = task.getTechnician();
        return new MaintenanceTaskResponse(
                task.getId(),
                equipment.getCode(),
                equipment.getName(),
                equipment.getRoomFullName() == null ? equipment.getRoomCode() : equipment.getRoomFullName(),
                technician.getId(),
                technician.getFullName(),
                task.getScheduledDate(),
                task.getScheduledTime(),
                task.getDurationMinutes(),
                task.getStatus(),
                task.getNotes(),
                task.getResultNotes(),
                task.getReplacedParts(),
                task.getCompletedAt(),
                task.isHasEvidenceImage());
    }

    private void ensureNoScheduleConflict(
            Equipment equipment,
            User technician,
            LocalDate scheduledDate,
            LocalTime scheduledTime,
            int durationMinutes) {
        LocalTime newEnd = scheduledTime.plusMinutes(durationMinutes);
        boolean conflict = taskRepository.findAll().stream()
                .filter(existing -> scheduledDate.equals(existing.getScheduledDate()))
                .filter(existing -> List.of(
                                MaintenanceTask.SCHEDULED,
                                MaintenanceTask.ACKNOWLEDGED,
                                MaintenanceTask.IN_PROGRESS)
                        .contains(existing.getStatus()))
                .filter(existing -> equipment.getId().equals(existing.getEquipment().getId())
                        || technician.getId().equals(existing.getTechnician().getId()))
                .anyMatch(existing -> {
                    LocalTime existingStart = existing.getScheduledTime() == null
                            ? LocalTime.of(9, 0) : existing.getScheduledTime();
                    int existingDuration = existing.getDurationMinutes() == null
                            ? 60 : existing.getDurationMinutes();
                    LocalTime existingEnd = existingStart.plusMinutes(existingDuration);
                    return scheduledTime.isBefore(existingEnd) && existingStart.isBefore(newEnd);
                });
        if (conflict) {
            throw new IllegalArgumentException("KTV hoặc thiết bị đã có lịch bảo trì trùng giờ.");
        }
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
