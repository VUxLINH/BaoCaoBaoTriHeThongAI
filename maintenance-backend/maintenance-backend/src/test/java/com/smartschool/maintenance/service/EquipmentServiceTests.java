package com.smartschool.maintenance.service;

import com.smartschool.maintenance.entity.Equipment;
import com.smartschool.maintenance.entity.MaintenanceTask;
import com.smartschool.maintenance.entity.User;
import com.smartschool.maintenance.repository.EquipmentRepository;
import com.smartschool.maintenance.repository.EquipmentImageRepository;
import com.smartschool.maintenance.repository.MaintenanceTaskRepository;
import com.smartschool.maintenance.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class EquipmentServiceTests {

    @Test
    void deleteRemovesEquipmentAndKeepsMaintenanceTaskSnapshot() {
        EquipmentRepository equipmentRepository = mock(EquipmentRepository.class);
        MaintenanceTaskRepository taskRepository = mock(MaintenanceTaskRepository.class);
        Equipment equipment = new Equipment();
        equipment.setId(5L);
        equipment.setCode("TB-01");
        equipment.setName("Máy chiếu");
        equipment.setRoomCode("P.302");
        MaintenanceTask task = new MaintenanceTask();
        task.setEquipment(equipment);
        when(equipmentRepository.findByCodeIgnoreCase("TB-01"))
                .thenReturn(Optional.of(equipment));
        when(taskRepository.findAllByEquipment(equipment)).thenReturn(List.of(task));
        EquipmentImageRepository imageRepository = mock(EquipmentImageRepository.class);
        EquipmentService service = new EquipmentService(
                equipmentRepository,
                taskRepository,
                imageRepository,
                mock(UserRepository.class));

        assertTrue(service.deleteByCode("TB-01"));

        assertNull(task.getEquipment());
        assertEquals("TB-01", task.getEquipmentCode());
        assertEquals("Máy chiếu", task.getEquipmentName());
        assertEquals("P.302", task.getEquipmentRoomName());
        verify(taskRepository).saveAllAndFlush(List.of(task));
        verify(imageRepository).deleteById(equipment.getId());
        verify(equipmentRepository).delete(equipment);
    }

    @Test
    void deleteReturnsFalseWhenEquipmentDoesNotExist() {
        EquipmentRepository equipmentRepository = mock(EquipmentRepository.class);
        MaintenanceTaskRepository taskRepository = mock(MaintenanceTaskRepository.class);
        when(equipmentRepository.findByCodeIgnoreCase("MISSING")).thenReturn(Optional.empty());
        EquipmentService service = new EquipmentService(
                equipmentRepository,
                taskRepository,
                mock(EquipmentImageRepository.class),
                mock(UserRepository.class));

        assertFalse(service.deleteByCode("MISSING"));

        verify(taskRepository, never()).findAllByEquipment(
                org.mockito.ArgumentMatchers.any(Equipment.class));
        verify(equipmentRepository, never()).delete(
                org.mockito.ArgumentMatchers.any(Equipment.class));
    }

    @Test
    void updateDetailsResolvesSelectedTechnicianFromTheKtvList() {
        EquipmentRepository equipmentRepository = mock(EquipmentRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        Equipment equipment = new Equipment();
        equipment.setCode("TB-01");
        User technician = new User();
        technician.setId(8L);
        technician.setRole("TECH");
        technician.setFullName("Nguyễn Văn A");
        Equipment details = new Equipment();
        details.setResponsibleTechnicianId(8L);
        when(equipmentRepository.findByCodeIgnoreCase("TB-01"))
                .thenReturn(Optional.of(equipment));
        when(userRepository.findById(8L)).thenReturn(Optional.of(technician));
        when(equipmentRepository.save(equipment)).thenReturn(equipment);
        EquipmentService service = new EquipmentService(
                equipmentRepository,
                mock(MaintenanceTaskRepository.class),
                mock(EquipmentImageRepository.class),
                userRepository);

        Equipment updated = service.updateDetails("TB-01", details).orElseThrow();

        assertEquals(8L, updated.getResponsibleTechnicianId());
        assertEquals("Nguyễn Văn A", updated.getResponsiblePerson());
    }
}
