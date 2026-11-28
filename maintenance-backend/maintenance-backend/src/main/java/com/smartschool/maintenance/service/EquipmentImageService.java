package com.smartschool.maintenance.service;

import com.smartschool.maintenance.entity.Equipment;
import com.smartschool.maintenance.entity.EquipmentImage;
import com.smartschool.maintenance.repository.EquipmentImageRepository;
import com.smartschool.maintenance.repository.EquipmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

@Service
public class EquipmentImageService {
    private static final long MAX_IMAGE_SIZE_BYTES = 10L * 1024 * 1024;
    private static final Set<String> ALLOWED_IMAGE_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp");

    private final EquipmentRepository equipmentRepository;
    private final EquipmentImageRepository imageRepository;

    public EquipmentImageService(
            EquipmentRepository equipmentRepository,
            EquipmentImageRepository imageRepository) {
        this.equipmentRepository = equipmentRepository;
        this.imageRepository = imageRepository;
    }

    @Transactional
    public void save(String code, MultipartFile file) throws IOException {
        Equipment equipment = equipmentRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thiết bị."));
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn ảnh thiết bị.");
        }
        if (file.getSize() > MAX_IMAGE_SIZE_BYTES) {
            throw new IllegalArgumentException("Ảnh thiết bị không được vượt quá 10 MB.");
        }

        String contentType = file.getContentType() == null
                ? ""
                : file.getContentType().toLowerCase(Locale.ROOT);
        if (!ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP.");
        }

        EquipmentImage image = imageRepository.findById(equipment.getId())
                .orElseGet(EquipmentImage::new);
        image.setEquipmentId(equipment.getId());
        image.setContentType(contentType);
        image.setImageData(file.getBytes());
        imageRepository.save(image);
    }

    @Transactional(readOnly = true)
    public Optional<EquipmentImage> findByEquipmentCode(String code) {
        return equipmentRepository.findByCodeIgnoreCase(code)
                .flatMap(equipment -> imageRepository.findById(equipment.getId()));
    }
}
