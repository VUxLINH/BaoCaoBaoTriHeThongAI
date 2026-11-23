package com.smartschool.maintenance.service;

import com.smartschool.maintenance.entity.ShiftSchedule;
import com.smartschool.maintenance.repository.ShiftScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ShiftService {

    private final ShiftScheduleRepository shiftRepository;

    public ShiftService(ShiftScheduleRepository shiftRepository) {
        this.shiftRepository = shiftRepository;
    }

    public List<ShiftSchedule> findAll() {
        return shiftRepository.findAll();
    }

    public ShiftSchedule create(ShiftSchedule shift) {
        return shiftRepository.save(shift);
    }

    @Transactional
    public List<ShiftSchedule> setTechnicianOnline(String techName, boolean online) {
        List<ShiftSchedule> shifts = shiftRepository.findAllByTechNameIgnoreCase(techName);
        for (ShiftSchedule shift : shifts) {
            shift.setIsOnline(online);
        }
        return shiftRepository.saveAll(shifts);
    }

    @Transactional
    public Optional<ShiftSchedule> toggleOnline(Long id) {
        return shiftRepository.findById(id).flatMap(selectedShift -> {
            boolean newStatus = !Boolean.TRUE.equals(selectedShift.getIsOnline());
            List<ShiftSchedule> shifts =
                    shiftRepository.findAllByTechNameIgnoreCase(selectedShift.getTechName());

            for (ShiftSchedule shift : shifts) {
                shift.setIsOnline(newStatus);
            }

            List<ShiftSchedule> savedShifts = shiftRepository.saveAll(shifts);
            for (ShiftSchedule shift : savedShifts) {
                if (id.equals(shift.getId())) {
                    return Optional.of(shift);
                }
            }
            return Optional.empty();
        });
    }
}
