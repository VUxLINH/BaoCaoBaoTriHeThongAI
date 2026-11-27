package com.smartschool.maintenance.repository;

import com.smartschool.maintenance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    List<User> findAllByRoleIgnoreCase(String role);
}