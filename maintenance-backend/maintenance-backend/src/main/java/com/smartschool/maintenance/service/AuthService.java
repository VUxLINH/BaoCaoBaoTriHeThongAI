package com.smartschool.maintenance.service;

import com.smartschool.maintenance.entity.User;
import com.smartschool.maintenance.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<User> authenticate(String email, String password) {
        return userRepository.findByEmailIgnoreCase(email)
                .filter(user -> user.getPassword().equals(password));
    }

    public String normalizeRole(String role) {
        if (role == null) {
            return null;
        }

        return switch (role.trim().toUpperCase(Locale.ROOT)) {
            case "REPORTER" -> "REPORTER";
            case "TECH", "TECHNICIAN" -> "TECHNICIAN";
            case "ADMIN" -> "ADMIN";
            default -> null;
        };
    }
}
