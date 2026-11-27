package com.smartschool.maintenance.service;

import com.smartschool.maintenance.entity.Equipment;
import com.smartschool.maintenance.entity.MaintenanceTask;
import com.smartschool.maintenance.entity.MaintenanceTaskImage;
import com.smartschool.maintenance.entity.User;
import com.smartschool.maintenance.dto.MaintenanceTaskRequest;
import com.smartschool.maintenance.repository.EquipmentRepository;
import com.smartschool.maintenance.repository.MaintenanceTaskImageRepository;
import com.smartschool.maintenance.repository.MaintenanceTaskRepository;
import com.smartschool.maintenance.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class MaintenanceTaskServiceTests {

    @Test
    void acknowledgeMovesScheduledTaskToAcknowledged() {
        MaintenanceTaskRepository taskRepository = mock(MaintenanceTaskRepository.class);
        MaintenanceTask task = new MaintenanceTask();
        task.setStatus(MaintenanceTask.SCHEDULED);
        Equipment equipment = new Equipment();
        equipment.setCode("TB-01");
        equipment.setName("Thiết bị");
        User technician = new User();
        technician.setId(7L);
        technician.setFullName("KTV");
        task.setEquipment(equipment);
        task.setTechnician(technician);
        when(taskRepository.findById(3L)).thenReturn(Optional.of(task));
        when(taskRepository.save(task)).thenReturn(task);
        MaintenanceTaskService service = new MaintenanceTaskService(
                taskRepository,
                mock(MaintenanceTaskImageRepository.class),
                mock(EquipmentRepository.class),
                mock(UserRepository.class),
                mock(MaintenancePartUsageService.class));

        assertEquals(MaintenanceTask.ACKNOWLEDGED, service.acknowledge(3L).orElseThrow().status());
    }

    @Test
    void createRejectsOverlappingTechnicianSchedule() {
        MaintenanceTaskRepository taskRepository = mock(MaintenanceTaskRepository.class);
        EquipmentRepository equipmentRepository = mock(EquipmentRepository.class);
        UserRepository userRepository = mock(UserRepository.class);

        Equipment equipment = new Equipment();
        equipment.setId(2L);
        equipment.setCode("TB-02");
        User technician = new User();
        technician.setId(7L);
        technician.setRole("TECHNICIAN");

        MaintenanceTask existing = new MaintenanceTask();
        existing.setEquipment(equipment);
        existing.setTechnician(technician);
        existing.setScheduledDate(LocalDate.of(2026, 3, 14));
        existing.setScheduledTime(LocalTime.of(9, 0));
        existing.setDurationMinutes(60);
        existing.setStatus(MaintenanceTask.SCHEDULED);
        when(taskRepository.findAll()).thenReturn(List.of(existing));
        when(equipmentRepository.findByCodeIgnoreCase("TB-02")).thenReturn(Optional.of(equipment));
        when(userRepository.findById(7L)).thenReturn(Optional.of(technician));

        MaintenanceTaskService service = new MaintenanceTaskService(
                taskRepository,
                mock(MaintenanceTaskImageRepository.class),
                equipmentRepository,
                userRepository,
                mock(MaintenancePartUsageService.class));

        assertThrows(
                IllegalArgumentException.class,
                () -> service.create(new MaintenanceTaskRequest(
                        "TB-02", 7L, LocalDate.of(2026, 3, 14), LocalTime.of(9, 30), 60, "")));
        verify(taskRepository, org.mockito.Mockito.never())
                .save(org.mockito.ArgumentMatchers.any(MaintenanceTask.class));
    }

    @Test
    void startAndCompleteMaintenanceTaskUpdatesEquipmentHistory() {
        MaintenanceTaskRepository taskRepository = mock(MaintenanceTaskRepository.class);
        MaintenanceTaskImageRepository imageRepository = mock(MaintenanceTaskImageRepository.class);
        EquipmentRepository equipmentRepository = mock(EquipmentRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        MaintenancePartUsageService partUsageService = mock(MaintenancePartUsageService.class);
        MaintenanceTaskService service =
                new MaintenanceTaskService(
                        taskRepository, imageRepository, equipmentRepository, userRepository,
                        partUsageService);

        Equipment equipment = new Equipment();
        equipment.setCode("TB-A201-MC");
        equipment.setName("Máy chiếu");
        User technician = new User();
        technician.setId(7L);
        technician.setFullName("Kỹ thuật viên");
        MaintenanceTask task = new MaintenanceTask();
        task.setId(1L);
        task.setEquipment(equipment);
        task.setTechnician(technician);
        task.setStatus(MaintenanceTask.ACKNOWLEDGED);

        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(taskRepository.save(task)).thenReturn(task);
        when(imageRepository.save(org.mockito.ArgumentMatchers.any(MaintenanceTaskImage.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(equipmentRepository.save(equipment)).thenReturn(equipment);

        assertEquals(MaintenanceTask.IN_PROGRESS, service.start(1L).orElseThrow().status());
        var completed = service.complete(
                        1L,
                        "Đã vệ sinh và kiểm tra hoạt động.",
                        "Bộ lọc",
                        new byte[] {1, 2, 3},
                        "image/png")
                .orElseThrow();

        assertEquals(MaintenanceTask.COMPLETED, completed.status());
        assertEquals("Đã vệ sinh và kiểm tra hoạt động.", completed.resultNotes());
        assertEquals("Bộ lọc", completed.replacedParts());
        assertTrue(completed.hasEvidenceImage());
        assertTrue(equipment.getLastMaintenanceDate().matches("\\d{2}/\\d{2}/\\d{4}"));
        verify(taskRepository, times(2)).save(task);
        verify(imageRepository).save(org.mockito.ArgumentMatchers.any(MaintenanceTaskImage.class));
        verify(equipmentRepository).save(equipment);
    }

    @Test
    void startRequiresAcknowledgement() {
        MaintenanceTaskRepository taskRepository = mock(MaintenanceTaskRepository.class);
        MaintenanceTask task = new MaintenanceTask();
        task.setStatus(MaintenanceTask.SCHEDULED);
        when(taskRepository.findById(3L)).thenReturn(Optional.of(task));
        MaintenanceTaskService service = new MaintenanceTaskService(
                taskRepository,
                mock(MaintenanceTaskImageRepository.class),
                mock(EquipmentRepository.class),
                mock(UserRepository.class),
                mock(MaintenancePartUsageService.class));

        assertThrows(IllegalStateException.class, () -> service.start(3L));
        verify(taskRepository, org.mockito.Mockito.never()).save(task);
    }

    @Test
    void completeRequiresTaskToBeInProgress() {
        MaintenanceTaskRepository taskRepository = mock(MaintenanceTaskRepository.class);
        MaintenanceTaskService service = new MaintenanceTaskService(
                taskRepository,
                mock(MaintenanceTaskImageRepository.class),
                mock(EquipmentRepository.class),
                mock(UserRepository.class),
                mock(MaintenancePartUsageService.class));
        MaintenanceTask task = new MaintenanceTask();
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));

        assertThrows(
                IllegalStateException.class,
                () -> service.complete(1L, "Hoàn tất", null, null, null));
    }
}
