package com.smartschool.maintenance.repository;

import com.smartschool.maintenance.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    Optional<Equipment> findByCodeIgnoreCase(String code);
}