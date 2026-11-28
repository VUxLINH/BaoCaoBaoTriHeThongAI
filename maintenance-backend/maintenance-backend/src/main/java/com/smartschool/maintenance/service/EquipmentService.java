package com.smartschool.maintenance.service;

import com.smartschool.maintenance.entity.Equipment;
import com.smartschool.maintenance.entity.MaintenanceTask;
import com.smartschool.maintenance.entity.User;
import com.smartschool.maintenance.repository.EquipmentRepository;
import com.smartschool.maintenance.repository.EquipmentImageRepository;
import com.smartschool.maintenance.repository.MaintenanceTaskRepository;
import com.smartschool.maintenance.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final MaintenanceTaskRepository maintenanceTaskRepository;
    private final EquipmentImageRepository equipmentImageRepository;
    private final UserRepository userRepository;

    public EquipmentService(
            EquipmentRepository equipmentRepository,
            MaintenanceTaskRepository maintenanceTaskRepository,
            EquipmentImageRepository equipmentImageRepository,
            UserRepository userRepository) {
        this.equipmentRepository = equipmentRepository;
        this.maintenanceTaskRepository = maintenanceTaskRepository;
        this.equipmentImageRepository = equipmentImageRepository;
        this.userRepository = userRepository;
    }

    public List<Equipment> findAll() {
        return equipmentRepository.findAll();
    }

    public Optional<Equipment> findByCode(String code) {
        return equipmentRepository.findByCodeIgnoreCase(code);
    }

    public Equipment create(Equipment equipment) {
        applyResponsibleTechnician(equipment, equipment);
        return equipmentRepository.save(equipment);
    }

    @Transactional
    public boolean deleteByCode(String code) {
        Equipment equipment = equipmentRepository.findByCodeIgnoreCase(code).orElse(null);
        if (equipment == null) return false;

        List<MaintenanceTask> history = maintenanceTaskRepository.findAllByEquipment(equipment);
        for (MaintenanceTask task : history) {
            task.setEquipmentCode(equipment.getCode());
            task.setEquipmentName(equipment.getName());
            task.setEquipmentRoomName(equipment.getRoomFullName() == null
                    ? equipment.getRoomCode()
                    : equipment.getRoomFullName());
            task.setEquipment(null);
        }
        if (!history.isEmpty()) {
            maintenanceTaskRepository.saveAllAndFlush(history);
        }

        equipmentImageRepository.deleteById(equipment.getId());
        equipmentRepository.delete(equipment);
        return true;
    }

    public Optional<Equipment> updateDetails(String code, Equipment details) {
        if (details.getMaintenanceIntervalMonths() != null
                && details.getMaintenanceIntervalMonths() < 1) {
            throw new IllegalArgumentException("Chu kỳ bảo trì phải từ 1 tháng trở lên.");
        }

        return findByCode(code).map(equipment -> {
            equipment.setManufacturer(clean(details.getManufacturer()));
            equipment.setModel(clean(details.getModel()));
            equipment.setSerialNumber(clean(details.getSerialNumber()));
            equipment.setResponsibleUnit(clean(details.getResponsibleUnit()));
            applyResponsibleTechnician(equipment, details);
            equipment.setWarrantyExpiryDate(details.getWarrantyExpiryDate());
            equipment.setMaintenanceIntervalMonths(details.getMaintenanceIntervalMonths());
            equipment.setSafetyNotes(clean(details.getSafetyNotes()));
            return equipmentRepository.save(equipment);
        });
    }

    public Optional<Equipment> updateStatus(String code, String status) {
        return findByCode(code).map(equipment -> {
            equipment.setStatus(status);
            return equipmentRepository.save(equipment);
        });
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private void applyResponsibleTechnician(Equipment equipment, Equipment details) {
        Long technicianId = details.getResponsibleTechnicianId();
        if (technicianId == null) {
            equipment.setResponsibleTechnicianId(null);
            equipment.setResponsiblePerson(clean(details.getResponsiblePerson()));
            return;
        }

        User technician = userRepository.findById(technicianId)
                .filter(user -> "TECHNICIAN".equalsIgnoreCase(user.getRole())
                        || "TECH".equalsIgnoreCase(user.getRole()))
                .orElseThrow(() -> new IllegalArgumentException(
                        "Người phụ trách phải là kỹ thuật viên hợp lệ."));
        equipment.setResponsibleTechnicianId(technician.getId());
        equipment.setResponsiblePerson(technician.getFullName());
    }
}
