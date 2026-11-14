package com.smartschool.maintenance.controller;

import com.smartschool.maintenance.entity.ShiftSchedule;
import com.smartschool.maintenance.entity.User;
import com.smartschool.maintenance.repository.ShiftScheduleRepository;
import com.smartschool.maintenance.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shifts")
public class ShiftController {

    private final ShiftScheduleRepository shiftRepo;
    private final UserRepository userRepo;

    public ShiftController(ShiftScheduleRepository shiftRepo, UserRepository userRepo) {
        this.shiftRepo = shiftRepo;
        this.userRepo = userRepo;
    }

    @GetMapping
    public List<ShiftSchedule> getAll() {
        return shiftRepo.findAll();
    }

    @PostMapping
    public ShiftSchedule create(@RequestBody ShiftSchedule shift) {
        return shiftRepo.save(shift);
    }

    @PutMapping("/presence")
    public ResponseEntity<?> updateTechnicianPresence(@RequestBody Map<String, Object> body) {
        Object emailValue = body.get("email");
        Object onlineValue = body.get("isOnline");
        if (!(emailValue instanceof String email) || email.isBlank()
                || !(onlineValue instanceof Boolean isOnline)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Thiếu email hoặc trạng thái trực hợp lệ."));
        }

        User user = userRepo.findByEmailIgnoreCase(email.trim()).orElse(null);
        if (user == null || !("TECH".equalsIgnoreCase(user.getRole())
                || "TECHNICIAN".equalsIgnoreCase(user.getRole()))) {
            return ResponseEntity.status(403)
                    .body(Map.of("message", "Không tìm thấy tài khoản kỹ thuật viên hợp lệ."));
        }

        List<ShiftSchedule> shifts = shiftRepo.findAllByTechNameIgnoreCase(user.getFullName());
        if (shifts.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "Tài khoản chưa có ca trực được phân công theo đúng họ tên."));
        }

        shifts.forEach(shift -> shift.setIsOnline(isOnline));
        return ResponseEntity.ok(shiftRepo.saveAll(shifts));
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggleOnline(@PathVariable Long id) {
        return shiftRepo.findById(id).map(s -> {
            boolean newStatus = !Boolean.TRUE.equals(s.getIsOnline());
            List<ShiftSchedule> assignedShifts =
                    shiftRepo.findAllByTechNameIgnoreCase(s.getTechName());
            assignedShifts.forEach(shift -> shift.setIsOnline(newStatus));
            List<ShiftSchedule> savedShifts = shiftRepo.saveAll(assignedShifts);
            return savedShifts.stream()
                    .filter(shift -> shift.getId().equals(id))
                    .findFirst()
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        }).orElse(ResponseEntity.notFound().build());
    }
}