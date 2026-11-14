package com.smartschool.maintenance.controller;

import com.smartschool.maintenance.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/tech-chat")
    public ResponseEntity<?> chat(@RequestBody(required = false) Map<String, String> body) {
        String question = body == null ? null : body.get("question");
        if (question == null || question.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Vui lòng nhập câu hỏi trước khi gửi."));
        }

        String equipmentName = body.get("equipmentName");
        if (equipmentName == null || equipmentName.isBlank()) {
            equipmentName = "Thiết bị trường học";
        }

        return ResponseEntity.ok(aiService.askTechAssistant(equipmentName, question.trim()));
    }
}