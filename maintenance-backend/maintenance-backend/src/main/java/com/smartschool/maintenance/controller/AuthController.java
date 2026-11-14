package com.smartschool.maintenance.controller;

import com.smartschool.maintenance.entity.User;
import com.smartschool.maintenance.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepo;

    public AuthController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim();
        String password = body.getOrDefault("password", "");
        String selectedTabRole = body.get("selectedTabRole");

        User user = userRepo.findByEmailIgnoreCase(email).orElse(null);
        if (user == null || !user.getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Email/Mã NV hoặc mật khẩu không chính xác."));
        }

        if (!"ADMIN".equals(user.getRole()) && selectedTabRole != null) {
            String expectedRole = "reporter".equals(selectedTabRole) ? "REPORTER" : "TECHNICIAN";
            if (!user.getRole().equals(expectedRole)) {
                String label = "REPORTER".equals(user.getRole()) ? "Người báo cáo" : "Kỹ thuật viên";
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Tài khoản này thuộc vai trò \"" + label + "\". Vui lòng chọn đúng vai trò."));
            }
        }

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "fullName", user.getFullName(),
                "role", user.getRole(),
                "shift", user.getShift() != null ? user.getShift() : "",
                "area", user.getArea() != null ? user.getArea() : ""
        ));
    }
}