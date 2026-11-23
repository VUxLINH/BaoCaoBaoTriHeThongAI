package com.smartschool.maintenance.controller;

import com.smartschool.maintenance.entity.ShiftSchedule;
import com.smartschool.maintenance.entity.User;
import com.smartschool.maintenance.repository.UserRepository;
import com.smartschool.maintenance.service.ShiftService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shifts")
public class ShiftController {

    private final ShiftService shiftService;
    private final UserRepository userRepo;

    public ShiftController(ShiftService shiftService, UserRepository userRepo) {
        this.shiftService = shiftService;
        this.userRepo = userRepo;
    }

    @GetMapping
    public List<ShiftSchedule> getAll() {
        return shiftService.findAll();
    }

    @PostMapping
    public ShiftSchedule create(@RequestBody ShiftSchedule shift) {
        return shiftService.create(shift);
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

        List<ShiftSchedule> shifts = shiftService.setTechnicianOnline(user.getFullName(), isOnline);
        if (shifts.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "Tài khoản chưa có ca trực được phân công theo đúng họ tên."));
        }

        return ResponseEntity.ok(shifts);
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggleOnline(@PathVariable Long id) {
        return shiftService.toggleOnline(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}