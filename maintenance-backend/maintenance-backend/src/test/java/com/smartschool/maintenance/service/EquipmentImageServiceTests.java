package com.smartschool.maintenance.service;

import com.smartschool.maintenance.entity.Equipment;
import com.smartschool.maintenance.entity.EquipmentImage;
import com.smartschool.maintenance.repository.EquipmentImageRepository;
import com.smartschool.maintenance.repository.EquipmentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class EquipmentImageServiceTests {

    @Test
    void saveStoresImageForEquipment() throws Exception {
        EquipmentRepository equipmentRepository = mock(EquipmentRepository.class);
        EquipmentImageRepository imageRepository = mock(EquipmentImageRepository.class);
        Equipment equipment = new Equipment();
        equipment.setId(4L);
        when(equipmentRepository.findByCodeIgnoreCase("TB-01"))
                .thenReturn(Optional.of(equipment));
        when(imageRepository.findById(4L)).thenReturn(Optional.empty());
        EquipmentImageService service =
                new EquipmentImageService(equipmentRepository, imageRepository);
        MockMultipartFile file = new MockMultipartFile(
                "image", "equipment.png", "image/png", new byte[] {1, 2, 3});

        service.save("TB-01", file);

        var imageCaptor = org.mockito.ArgumentCaptor.forClass(EquipmentImage.class);
        verify(imageRepository).save(imageCaptor.capture());
        assertEquals(4L, imageCaptor.getValue().getEquipmentId());
        assertEquals("image/png", imageCaptor.getValue().getContentType());
        assertEquals(3, imageCaptor.getValue().getImageData().length);
    }

    @Test
    void saveRejectsUnsupportedImageType() {
        EquipmentRepository equipmentRepository = mock(EquipmentRepository.class);
        EquipmentImageRepository imageRepository = mock(EquipmentImageRepository.class);
        Equipment equipment = new Equipment();
        equipment.setId(4L);
        when(equipmentRepository.findByCodeIgnoreCase("TB-01"))
                .thenReturn(Optional.of(equipment));
        EquipmentImageService service =
                new EquipmentImageService(equipmentRepository, imageRepository);
        MockMultipartFile file = new MockMultipartFile(
                "image", "equipment.gif", "image/gif", new byte[] {1});

        assertThrows(IllegalArgumentException.class, () -> service.save("TB-01", file));

        verify(imageRepository, never()).save(any(EquipmentImage.class));
    }
}
