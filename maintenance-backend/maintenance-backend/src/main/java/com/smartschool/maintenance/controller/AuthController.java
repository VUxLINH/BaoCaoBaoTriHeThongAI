package com.smartschool.maintenance.controller;

import com.smartschool.maintenance.entity.User;
import com.smartschool.maintenance.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody(required = false) Map<String, String> body) {
        String email = body == null || body.get("email") == null
                ? ""
                : body.get("email").trim();
        String password = body == null || body.get("password") == null
                ? ""
                : body.get("password");

        if (email.isBlank() || password.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Vui lòng nhập email và mật khẩu."));
        }

        User user = authService.authenticate(email, password).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Email/Mã NV hoặc mật khẩu không chính xác."));
        }

        String role = authService.normalizeRole(user.getRole());
        if (role == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Tài khoản chưa được gán vai trò hợp lệ."));
        }

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "fullName", user.getFullName(),
                "role", role,
                "shift", user.getShift() != null ? user.getShift() : "",
                "area", user.getArea() != null ? user.getArea() : ""
        ));
    }
}