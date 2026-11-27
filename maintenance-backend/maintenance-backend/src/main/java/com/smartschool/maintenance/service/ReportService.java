package com.smartschool.maintenance.service;

import com.smartschool.maintenance.dto.PartUsageRequest;
import com.smartschool.maintenance.entity.Equipment;
import com.smartschool.maintenance.entity.MaintenanceReport;
import com.smartschool.maintenance.entity.MaintenanceReportImage;
import com.smartschool.maintenance.entity.ShiftSchedule;
import com.smartschool.maintenance.repository.EquipmentRepository;
import com.smartschool.maintenance.repository.MaintenanceReportImageRepository;
import com.smartschool.maintenance.repository.MaintenanceReportRepository;
import com.smartschool.maintenance.repository.ShiftScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class ReportService {

    private static final DateTimeFormatter REPORTED_TIME_FORMAT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter TIME_FORMAT =
            DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final String DEFAULT_TECH_NAME = "Anh Nguyễn Văn B";
    private static final long MAX_IMAGE_SIZE_BYTES = 10L * 1024 * 1024;
    private static final List<String> ALLOWED_IMAGE_TYPES =
            List.of("image/jpeg", "image/png", "image/webp");
    private static final String BEFORE_IMAGE = "BEFORE";
    private static final String AFTER_IMAGE = "AFTER";

    private final MaintenanceReportRepository reportRepository;
    private final MaintenanceReportImageRepository imageRepository;
    private final EquipmentRepository equipmentRepository;
    private final ShiftScheduleRepository shiftRepository;
    private final MaintenancePartUsageService partUsageService;

    public ReportService(
            MaintenanceReportRepository reportRepository,
            MaintenanceReportImageRepository imageRepository,
            EquipmentRepository equipmentRepository,
            ShiftScheduleRepository shiftRepository,
            MaintenancePartUsageService partUsageService) {
        this.reportRepository = reportRepository;
        this.imageRepository = imageRepository;
        this.equipmentRepository = equipmentRepository;
        this.shiftRepository = shiftRepository;
        this.partUsageService = partUsageService;
    }

    public List<MaintenanceReport> findAll() {
        return reportRepository.findAllByOrderByIdDesc();
    }

    @Transactional
    public MaintenanceReport create(MaintenanceReport report) {
        return create(report, null, null);
    }

    @Transactional
    public MaintenanceReport create(
            MaintenanceReport report,
            byte[] imageData,
            String imageContentType) {
        validateImage(imageData, imageContentType);
        if (report.getReportedTime() == null || report.getReportedTime().isBlank()) {
            report.setReportedTime(LocalDateTime.now().format(REPORTED_TIME_FORMAT));
        }

        if ("WAITING_TECH".equals(report.getStatus())) {
            report.setAssignedTechName(findOnlineTechnician());
        }

        report.setHasImageBefore(imageData != null);
        MaintenanceReport saved = reportRepository.save(report);
        if (imageData != null) {
            saveImage(saved.getId(), BEFORE_IMAGE, imageData, imageContentType);
        }
        return saved;
    }

    public Optional<MaintenanceReport> accept(Long id) {
        return reportRepository.findById(id).map(report -> {
            report.setStatus("IN_PROGRESS");
            report.setAcceptedAt(LocalTime.now().format(TIME_FORMAT));
            return reportRepository.save(report);
        });
    }

    @Transactional
    public Optional<MaintenanceReport> complete(
            Long id,
            String equipmentStatus,
            String rootCauseNote,
            String replacedParts) {
        return complete(id, equipmentStatus, rootCauseNote, replacedParts, List.of());
    }

    @Transactional
    public Optional<MaintenanceReport> complete(
            Long id,
            String equipmentStatus,
            String rootCauseNote,
            String replacedParts,
            List<PartUsageRequest> parts) {
        return complete(id, equipmentStatus, rootCauseNote, replacedParts, parts, null, null);
    }

    @Transactional
    public Optional<MaintenanceReport> complete(
                Long id,
                String equipmentStatus,
                String rootCauseNote,
                String replacedParts,
                List<PartUsageRequest> parts,
                byte[] imageData,
                String imageContentType) {
        validateImage(imageData, imageContentType);
        return reportRepository.findById(id).map(report -> {
                if ("COMPLETED".equals(report.getStatus())) {
                    throw new IllegalStateException("Phiếu này đã được hoàn tất trước đó.");
                }
            partUsageService.createForReport(report, parts);
            String today = LocalDate.now().format(DATE_FORMAT);
            report.setStatus("COMPLETED");
            report.setRootCauseNote(rootCauseNote);
            report.setReplacedParts(replacedParts);
            report.setCompletedDate(today);
            report.setHasImageAfter(imageData != null);

            equipmentRepository.findByCodeIgnoreCase(report.getEquipmentCode())
                    .ifPresent(equipment -> updateEquipmentAfterRepair(equipment, equipmentStatus, today));

            MaintenanceReport saved = reportRepository.save(report);
            if (imageData != null) {
                saveImage(saved.getId(), AFTER_IMAGE, imageData, imageContentType);
            }
            return saved;
        });
    }

    @Transactional(readOnly = true)
    public Optional<MaintenanceReportImage> findImage(Long reportId, String imageType) {
        return imageRepository.findByReportIdAndImageType(reportId, imageType);
    }

    private String findOnlineTechnician() {
        for (ShiftSchedule shift : shiftRepository.findAll()) {
            if (Boolean.TRUE.equals(shift.getIsOnline())) {
                return shift.getTechName();
            }
        }
        return DEFAULT_TECH_NAME;
    }

    private void updateEquipmentAfterRepair(Equipment equipment, String status, String date) {
        equipment.setLastRepairDate(date);
        equipment.setStatus(status);
        equipmentRepository.save(equipment);
    }

    private void validateImage(byte[] imageData, String imageContentType) {
        if (imageData == null) {
            return;
        }
        if (imageData.length > MAX_IMAGE_SIZE_BYTES) {
            throw new IllegalArgumentException("Ảnh hiện trường không được vượt quá 10 MB.");
        }
        String normalizedType = imageContentType == null
                ? ""
                : imageContentType.toLowerCase(Locale.ROOT);
        if (!ALLOWED_IMAGE_TYPES.contains(normalizedType)) {
            throw new IllegalArgumentException("Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP.");
        }
    }

    private void saveImage(Long reportId, String imageType, byte[] imageData, String imageContentType) {
        MaintenanceReportImage image = new MaintenanceReportImage();
        image.setReportId(reportId);
        image.setImageType(imageType);
        image.setContentType(imageContentType.toLowerCase(Locale.ROOT));
        image.setImageData(imageData);
        imageRepository.save(image);
    }
}
