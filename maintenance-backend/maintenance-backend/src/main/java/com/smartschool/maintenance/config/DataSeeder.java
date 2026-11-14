package com.smartschool.maintenance.config;

import com.smartschool.maintenance.entity.*;
import com.smartschool.maintenance.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(
            UserRepository userRepo,
            EquipmentRepository equipRepo,
            MaintenanceReportRepository reportRepo,
            ShiftScheduleRepository shiftRepo) {
        return args -> {
            if (userRepo.count() == 0) {
                User u1 = new User();
                u1.setEmail("lan.gv@school.edu.vn");
                u1.setPassword("123");
                u1.setFullName("Cô Lan (GV)");
                u1.setRole("REPORTER");
                userRepo.save(u1);

                User u2 = new User();
                u2.setEmail("binh.ktv@school.edu.vn");
                u2.setPassword("123");
                u2.setFullName("Anh Nguyễn Văn B");
                u2.setRole("TECHNICIAN");
                u2.setShift("Ca Sáng (07:00 - 11:30)");
                u2.setArea("Giảng đường A & B");
                userRepo.save(u2);

                User u3 = new User();
                u3.setEmail("admin@school.edu.vn");
                u3.setPassword("123");
                u3.setFullName("Quản trị viên CSVC");
                u3.setRole("ADMIN");
                userRepo.save(u3);
            }

            if (equipRepo.count() == 0) {
                Equipment e1 = new Equipment();
                e1.setCode("MC-P302-01");
                e1.setName("Máy chiếu Epson EB-X51");
                e1.setCategory("Máy chiếu");
                e1.setRoomCode("P.302");
                e1.setRoomFullName("Phòng 302 - Giảng đường A");
                e1.setArea("Giảng đường A & B");
                e1.setInstalledDate("15/08/2023");
                e1.setLastMaintenanceDate("10/09/2026");
                e1.setLastRepairDate("12/05/2026");
                e1.setStatus("Đang hoạt động");
                equipRepo.save(e1);

                Equipment e2 = new Equipment();
                e2.setCode("DH-P302-02");
                e2.setName("Điều hòa Daikin Inverter 2HP");
                e2.setCategory("Điều hòa");
                e2.setRoomCode("P.302");
                e2.setRoomFullName("Phòng 302 - Giảng đường A");
                e2.setArea("Giảng đường A & B");
                e2.setInstalledDate("10/10/2023");
                e2.setLastMaintenanceDate("01/08/2026");
                e2.setLastRepairDate("15/04/2026");
                e2.setStatus("Đang hoạt động");
                equipRepo.save(e2);

                Equipment e3 = new Equipment();
                e3.setCode("PC-P105-12");
                e3.setName("Case Máy tính số 12");
                e3.setCategory("Máy tính");
                e3.setRoomCode("P.105");
                e3.setRoomFullName("Phòng 105 - Lab Tin học");
                e3.setArea("Lab Tin học & Tòa C");
                e3.setInstalledDate("20/01/2024");
                e3.setLastMaintenanceDate("15/08/2026");
                e3.setLastRepairDate("02/06/2026");
                e3.setStatus("Đang bảo trì");
                equipRepo.save(e3);
            }

            if (shiftRepo.count() == 0) {
                ShiftSchedule s1 = new ShiftSchedule();
                s1.setShiftName("Ca Sáng (07:00 - 11:30)");
                s1.setTechName("Anh Nguyễn Văn B");
                s1.setArea("Giảng đường A & B");
                s1.setIsOnline(true);
                shiftRepo.save(s1);

                ShiftSchedule s2 = new ShiftSchedule();
                s2.setShiftName("Ca Chiều (13:00 - 17:30)");
                s2.setTechName("Anh Trần Văn C");
                s2.setArea("Lab Tin học & Tòa C");
                s2.setIsOnline(false);
                shiftRepo.save(s2);
            }

            if (reportRepo.count() == 0) {
                MaintenanceReport r1 = new MaintenanceReport();
                r1.setEquipmentCode("DH-P302-02");
                r1.setEquipmentName("Điều hòa Daikin Inverter 2HP");
                r1.setRoomBadge("PHÒNG 302");
                r1.setDescription("Máy lạnh bật 15 phút bị ngắt aptomat, có mùi khét nhẹ và chảy nước ở dàn lạnh.");
                r1.setReporterName("Cô Lan (GV)");
                r1.setReportedTime(LocalDateTime.now()
                        .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
                r1.setAiSeverity("COMPLEX");
                r1.setStatus("WAITING_TECH");
                r1.setAssignedTechName("Anh Nguyễn Văn B");
                reportRepo.save(r1);
            }
        };
    }
}