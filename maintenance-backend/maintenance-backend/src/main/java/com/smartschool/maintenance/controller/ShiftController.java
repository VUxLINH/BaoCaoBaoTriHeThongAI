package com.smartschool.maintenance.controller;

import com.smartschool.maintenance.entity.ShiftSchedule;
import com.smartschool.maintenance.repository.ShiftScheduleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shifts")
public class ShiftController {

    private final ShiftScheduleRepository shiftRepo;

    public ShiftController(ShiftScheduleRepository shiftRepo) {
        this.shiftRepo = shiftRepo;
    }

    @GetMapping
    public List<ShiftSchedule> getAll() {
        return shiftRepo.findAll();
    }

    @PostMapping
    public ShiftSchedule create(@RequestBody ShiftSchedule shift) {
        return shiftRepo.save(shift);
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggleOnline(@PathVariable Long id) {
        return shiftRepo.findById(id).map(s -> {
            s.setIsOnline(!Boolean.TRUE.equals(s.getIsOnline()));
            return ResponseEntity.ok(shiftRepo.save(s));
        }).orElse(ResponseEntity.notFound().build());
    }
}