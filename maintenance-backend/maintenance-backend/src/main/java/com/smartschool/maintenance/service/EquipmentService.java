package com.smartschool.maintenance.service;

import com.smartschool.maintenance.entity.Equipment;
import com.smartschool.maintenance.repository.EquipmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;

    public EquipmentService(EquipmentRepository equipmentRepository) {
        this.equipmentRepository = equipmentRepository;
    }

    public List<Equipment> findAll() {
        return equipmentRepository.findAll();
    }

    public Optional<Equipment> findByCode(String code) {
        return equipmentRepository.findByCodeIgnoreCase(code);
    }

    public Equipment create(Equipment equipment) {
        return equipmentRepository.save(equipment);
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
            equipment.setResponsiblePerson(clean(details.getResponsiblePerson()));
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
}
