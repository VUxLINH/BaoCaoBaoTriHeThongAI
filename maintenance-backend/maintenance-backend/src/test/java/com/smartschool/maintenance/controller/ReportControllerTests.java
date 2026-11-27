package com.smartschool.maintenance.controller;

import com.smartschool.maintenance.dto.MaintenanceReportCompletionRequest;
import com.smartschool.maintenance.entity.Equipment;
import com.smartschool.maintenance.entity.MaintenanceReport;
import com.smartschool.maintenance.service.AiService;
import com.smartschool.maintenance.service.EquipmentService;
import com.smartschool.maintenance.service.ReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;

class ReportControllerTests {
    private final ReportService reportService = mock(ReportService.class);
    private final EquipmentService equipmentService = mock(EquipmentService.class);
    private final AiService aiService = mock(AiService.class);
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = standaloneSetup(
                new ReportController(reportService, equipmentService, aiService))
                .build();
    }

    @Test
    void createReportAcceptsAndPersistsReporterImage() throws Exception {
        byte[] imageBytes = {1, 2, 3};
        MockMultipartFile reportPart = new MockMultipartFile(
                "report",
                "report.json",
                "application/json",
                """
                {
                  "equipmentCode": "TB-01",
                  "equipmentName": "Thiết bị",
                  "description": "Có lỗi",
                  "reporterName": "Người báo",
                  "status": "WAITING_TECH"
                }
                """.getBytes(StandardCharsets.UTF_8));
        MockMultipartFile imagePart = new MockMultipartFile(
                "image", "before.png", "image/png", imageBytes);
        Equipment equipment = new Equipment();
        when(equipmentService.findByCode("TB-01")).thenReturn(Optional.of(equipment));
        MaintenanceReport savedReport = new MaintenanceReport();
        savedReport.setId(4L);
        savedReport.setHasImageBefore(true);
        when(reportService.create(
                any(MaintenanceReport.class), any(byte[].class), eq("image/png")))
                .thenReturn(savedReport);

        mockMvc.perform(multipart("/api/reports").file(reportPart).file(imagePart))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasImageBefore").value(true));

        ArgumentCaptor<MaintenanceReport> reportCaptor =
                ArgumentCaptor.forClass(MaintenanceReport.class);
        ArgumentCaptor<byte[]> imageCaptor = ArgumentCaptor.forClass(byte[].class);
        verify(reportService).create(reportCaptor.capture(), imageCaptor.capture(), eq("image/png"));
        assertArrayEquals(imageBytes, imageCaptor.getValue());
        org.junit.jupiter.api.Assertions.assertEquals(
                "TB-01", reportCaptor.getValue().getEquipmentCode());
    }

    @Test
    void completeReportAcceptsAndPersistsTechnicianImage() throws Exception {
        byte[] imageBytes = {4, 5, 6};
        MockMultipartFile completionPart = new MockMultipartFile(
                "completion",
                "completion.json",
                "application/json",
                """
                {
                  "equipmentStatus": "Đang hoạt động",
                  "rootCauseNote": "Đã thay dây nguồn",
                  "replacedParts": "Dây nguồn",
                  "parts": []
                }
                """.getBytes(StandardCharsets.UTF_8));
        MockMultipartFile imagePart = new MockMultipartFile(
                "image", "after.jpg", "image/jpeg", imageBytes);
        MaintenanceReport savedReport = new MaintenanceReport();
        savedReport.setId(5L);
        savedReport.setHasImageAfter(true);
        when(reportService.complete(
                eq(5L),
                eq("Đang hoạt động"),
                eq("Đã thay dây nguồn"),
                eq("Dây nguồn"),
                eq(List.of()),
                any(byte[].class),
                eq("image/jpeg")))
                .thenReturn(Optional.of(savedReport));

        mockMvc.perform(multipart("/api/reports/5/complete")
                        .file(completionPart)
                        .file(imagePart)
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        }))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasImageAfter").value(true));

        ArgumentCaptor<byte[]> imageCaptor = ArgumentCaptor.forClass(byte[].class);
        verify(reportService).complete(
                eq(5L),
                eq("Đang hoạt động"),
                eq("Đã thay dây nguồn"),
                eq("Dây nguồn"),
                eq(List.of()),
                imageCaptor.capture(),
                eq("image/jpeg"));
        assertArrayEquals(imageBytes, imageCaptor.getValue());
    }
}
