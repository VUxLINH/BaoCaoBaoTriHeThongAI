package com.smartschool.maintenance.service;

import com.smartschool.maintenance.dto.PartUsageRequest;
import com.smartschool.maintenance.dto.PartUsageResponse;
import com.smartschool.maintenance.entity.MaintenancePartUsage;
import com.smartschool.maintenance.entity.MaintenanceReport;
import com.smartschool.maintenance.entity.MaintenanceTask;
import com.smartschool.maintenance.repository.MaintenancePartUsageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class MaintenancePartUsageService {
    private static final DateTimeFormatter LEGACY_DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final MaintenancePartUsageRepository repository;

    public MaintenancePartUsageService(MaintenancePartUsageRepository repository) {
        this.repository = repository;
    }

    public void createForReport(MaintenanceReport report, List<PartUsageRequest> requests) {
        createForSource(report, null, requests);
    }

    public void createForTask(MaintenanceTask task, List<PartUsageRequest> requests) {
        createForSource(null, task, requests);
    }

    @Transactional(readOnly = true)
    public List<PartUsageResponse> findByMonth(int year, int month) {
        YearMonth selectedMonth = YearMonth.of(year, month);
        LocalDate start = selectedMonth.atDay(1);
        LocalDate end = selectedMonth.atEndOfMonth();

        return repository.findAll().stream()
                .map(this::toResponse)
                .flatMap(Optional::stream)
                .filter(row -> row.completedDate() != null
                        && !row.completedDate().isBefore(start)
                        && !row.completedDate().isAfter(end))
                .sorted((left, right) -> {
                    int dateOrder = left.completedDate().compareTo(right.completedDate());
                    if (dateOrder != 0) return dateOrder;
                    int equipmentOrder = String.valueOf(left.equipmentCode())
                            .compareToIgnoreCase(String.valueOf(right.equipmentCode()));
                    return equipmentOrder != 0 ? equipmentOrder
                            : String.valueOf(left.partName()).compareToIgnoreCase(String.valueOf(right.partName()));
                })
                .toList();
    }

    private void createForSource(
            MaintenanceReport report,
            MaintenanceTask task,
            List<PartUsageRequest> requests) {
        if (requests == null || requests.isEmpty()) return;
        if (requests.size() > 100) {
            throw new IllegalArgumentException("Mỗi phiếu chỉ được ghi tối đa 100 dòng linh kiện.");
        }
        if ((report == null) == (task == null)) {
            throw new IllegalArgumentException("Nguồn sử dụng linh kiện không hợp lệ.");
        }

        List<MaintenancePartUsage> usages = new ArrayList<>();
        for (PartUsageRequest request : requests) {
            validate(request);
            MaintenancePartUsage usage = new MaintenancePartUsage();
            usage.setReport(report);
            usage.setMaintenanceTask(task);
            usage.setPartName(request.partName().trim());
            usage.setPartCode(clean(request.partCode()));
            usage.setQuantity(request.quantity());
            usage.setUnit(request.unit().trim());
            usage.setUnitCost(request.unitCost());
            usage.setSupplier(clean(request.supplier()));
            usage.setDocumentNumber(clean(request.documentNumber()));
            usages.add(usage);
        }
        repository.saveAll(usages);
    }

    private void validate(PartUsageRequest request) {
        if (request == null
                || request.partName() == null || request.partName().isBlank()
                || request.partName().length() > 255
                || request.quantity() == null || request.quantity().signum() <= 0
                || request.quantity().stripTrailingZeros().scale() > 3
                || request.quantity().precision() > 12
                || request.unit() == null || request.unit().isBlank()
                || request.unit().length() > 40
                || request.unitCost() == null || request.unitCost().signum() < 0
                || request.unitCost().scale() > 2
                || request.unitCost().precision() > 14
                || tooLong(request.partCode(), 100)
                || tooLong(request.supplier(), 255)
                || tooLong(request.documentNumber(), 100)) {
            throw new IllegalArgumentException(
                    "Thông tin linh kiện không hợp lệ: cần tên, số lượng > 0, đơn vị và đơn giá hợp lệ.");
        }
    }

    private boolean tooLong(String value, int maxLength) {
        return value != null && value.length() > maxLength;
    }

    private Optional<PartUsageResponse> toResponse(MaintenancePartUsage usage) {
        MaintenanceReport report = usage.getReport();
        MaintenanceTask task = usage.getMaintenanceTask();
        if (report != null) {
            LocalDate completedDate = parseReportDate(report.getCompletedDate());
            if (!"COMPLETED".equals(report.getStatus()) || completedDate == null) return Optional.empty();
            BigDecimal totalCost = usage.getQuantity().multiply(usage.getUnitCost())
                    .setScale(2, RoundingMode.HALF_UP);
            return Optional.of(new PartUsageResponse(
                    "Sự cố",
                    report.getId(),
                    completedDate,
                    report.getEquipmentCode(),
                    report.getEquipmentName(),
                    report.getRoomBadge(),
                    report.getDescription(),
                    report.getAssignedTechName(),
                    usage.getPartName(),
                    usage.getPartCode(),
                    usage.getQuantity(),
                    usage.getUnit(),
                    usage.getUnitCost(),
                    totalCost,
                    usage.getSupplier(),
                    usage.getDocumentNumber()));
        }
        if (task == null || !MaintenanceTask.COMPLETED.equals(task.getStatus())
                || task.getCompletedAt() == null) {
            return Optional.empty();
        }
        BigDecimal totalCost = usage.getQuantity().multiply(usage.getUnitCost())
                .setScale(2, RoundingMode.HALF_UP);
        return Optional.of(new PartUsageResponse(
                "Bảo trì định kỳ",
                task.getId(),
                task.getCompletedAt().toLocalDate(),
                task.getEquipment().getCode(),
                task.getEquipment().getName(),
                task.getEquipment().getRoomFullName() == null
                        ? task.getEquipment().getRoomCode() : task.getEquipment().getRoomFullName(),
                task.getNotes(),
                task.getTechnician().getFullName(),
                usage.getPartName(),
                usage.getPartCode(),
                usage.getQuantity(),
                usage.getUnit(),
                usage.getUnitCost(),
                totalCost,
                usage.getSupplier(),
                usage.getDocumentNumber()));
    }

    private LocalDate parseReportDate(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalDate.parse(value, LEGACY_DATE_FORMAT);
        } catch (DateTimeParseException ignored) {
            try {
                return LocalDate.parse(value);
            } catch (DateTimeParseException alsoIgnored) {
                return null;
            }
        }
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
