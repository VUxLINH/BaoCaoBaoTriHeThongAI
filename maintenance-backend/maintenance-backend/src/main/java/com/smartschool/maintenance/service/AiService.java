package com.smartschool.maintenance.service;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.HttpOptions;
import com.google.genai.types.HttpRetryOptions;
import com.google.genai.types.Part;
import com.smartschool.maintenance.entity.Equipment;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.*;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private final ObjectMapper objectMapper;
    private Client geminiClient;
    private boolean geminiConfigured;

    // Model tối ưu tốc độ siêu nhanh, hỗ trợ cả chữ + ảnh
    private static final String MODEL_ID = "gemini-3.5-flash-lite";

    public AiService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void initClient() {
        this.geminiConfigured = geminiApiKey != null
                && !geminiApiKey.isBlank()
                && !geminiApiKey.contains("...");

        if (this.geminiConfigured) {
            // Giới hạn timeout 10 giây, chỉ gọi 1 lần (không retry treo 60s)
            HttpOptions httpOptions = HttpOptions.builder()
                    .timeout(10_000)
                    .retryOptions(HttpRetryOptions.builder().attempts(1).build())
                    .build();

            this.geminiClient = Client.builder()
                    .apiKey(geminiApiKey.trim())
                    .httpOptions(httpOptions)
                    .build();
            log.info("Gemini client configured with model {}; connection will be checked on first request.", MODEL_ID);
        } else {
            log.info("GEMINI_API_KEY is not configured; using the internal fallback.");
        }
    }

    /**
     * 1. AI Phân loại sự cố & Gợi ý tự sửa (Màn hình A3 -> A4)
     */
    public Map<String, Object> analyzeIssue(Equipment eq, String description, MultipartFile image) {
        if (!geminiConfigured || geminiClient == null) {
            Map<String, Object> result = fallbackTriage(eq, description);
            result.put("provider", "fallback");
            result.put("warning", "Gemini chưa được cấu hình; đây là kết quả dự phòng nội bộ.");
            return result;
        }

        long start = System.currentTimeMillis();
        try {
            String prompt = """
                Phân tích sự cố thiết bị trường học sau và trả về DUY NHẤT JSON thuần (không markdown):
                Thiết bị: %s (%s - %s). Mô tả lỗi: "%s".
                Cấu trúc JSON bắt buộc:
                {"severity":"SIMPLE hoặc COMPLEX","title":"Tiêu đề ngắn","notifyTarget":"Người báo cáo / GV hoặc KTV trực","steps":[{"step":"Bước 1: ...","detail":"..."},{"step":"Bước 2: ...","detail":"..."},{"step":"Bước 3: ...","detail":"..."}]}
                Quy tắc: Chập điện, mùi khét, rò nước, hỏng phần cứng -> COMPLEX. Lỗi cáp, nguồn, điều khiển -> SIMPLE.
                """.formatted(eq.getName(), eq.getCategory(), eq.getRoomCode(), description);

            GenerateContentConfig config = GenerateContentConfig.builder()
                    .maxOutputTokens(600)
                    .build();

            GenerateContentResponse response;
            if (image != null && !image.isEmpty()) {
                String mimeType = image.getContentType() != null ? image.getContentType() : "image/jpeg";
                Content content = Content.fromParts(
                        Part.fromText(prompt),
                        Part.fromBytes(image.getBytes(), mimeType)
                );
                response = geminiClient.models.generateContent(MODEL_ID, content, config);
            } else {
                response = geminiClient.models.generateContent(MODEL_ID, prompt, config);
            }

            log.info("Gemini issue analysis completed in {} ms.", System.currentTimeMillis() - start);

            String responseText = response.text();
            if (responseText == null || responseText.isBlank()) {
                throw new IllegalStateException("Gemini returned an empty response.");
            }

            String cleanJson = responseText
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();

            Map<String, Object> result = objectMapper.readValue(
                    cleanJson, new TypeReference<Map<String, Object>>() {});
            result.put("provider", "gemini");
            return result;
        } catch (Exception e) {
            log.error("Gemini issue analysis failed after {} ms.", System.currentTimeMillis() - start, e);
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Gemini không thể phân tích lúc này. Vui lòng thử lại sau.");
        }
    }

    /**
     * 2. Chatbot Trợ lý AI Kỹ thuật (Màn hình B3)
     */
    public Map<String, Object> askTechAssistant(String equipmentName, String question) {
        if (!geminiConfigured || geminiClient == null) {
            Map<String, Object> result = fallbackTechChat(equipmentName, question);
            result.put("provider", "fallback");
            result.put("warning", "Gemini chưa được cấu hình; đây là câu trả lời dự phòng nội bộ.");
            return result;
        }

        long start = System.currentTimeMillis();
        try {
            String prompt = """
                Bạn là AI Trợ lý Kỹ thuật sửa chữa thiết bị trường học.
                Thiết bị: %s. Câu hỏi: "%s".
                Trả lời ngắn gọn tối đa 5 dòng, đánh số 1, 2, 3 các bước kiểm tra.
                """.formatted(equipmentName, question);

            GenerateContentConfig config = GenerateContentConfig.builder()
                    .maxOutputTokens(500)
                    .build();

            GenerateContentResponse response = geminiClient.models.generateContent(MODEL_ID, prompt, config);
            log.info("Gemini technician chat completed in {} ms.", System.currentTimeMillis() - start);

            String responseText = response.text();
            if (responseText == null || responseText.isBlank()) {
                throw new IllegalStateException("Gemini returned an empty response.");
            }

            Map<String, Object> result = new HashMap<>();
            result.put("text", responseText.trim());
            String normalizedQuestion = question.toLowerCase(Locale.ROOT);
            result.put("hasPdfButton", normalizedQuestion.contains("mã lỗi") || normalizedQuestion.contains("sơ đồ"));
            result.put("provider", "gemini");
            return result;
        } catch (Exception e) {
            log.error("Gemini technician chat failed after {} ms.", System.currentTimeMillis() - start, e);
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Gemini không thể trả lời lúc này. Vui lòng thử lại sau.");
        }
    }

    private Map<String, Object> fallbackTriage(Equipment eq, String description) {
        String desc = description != null ? description.toLowerCase() : "";
        boolean isComplex = desc.contains("khét") || desc.contains("cháy")
                || desc.contains("aptomat") || desc.contains("nước")
                || desc.contains("chập") || desc.contains("nổ");

        Map<String, Object> res = new LinkedHashMap<>();
        if (isComplex) {
            res.put("severity", "COMPLEX");
            res.put("title", "Sự cố phức tạp - Cần Kỹ thuật viên xử lý");
            res.put("notifyTarget", "KTV trực: Anh Nguyễn Văn B");
            res.put("steps", List.of(
                    Map.of("step", "Bước 1: Ngắt nguồn điện thiết bị", "detail", "Không tự ý bật lại để tránh chập cháy lan rộng."),
                    Map.of("step", "Bước 2: Giữ nguyên hiện trường", "detail", "Hệ thống đã tự động chuyển thông tin tới KTV đang trực.")
            ));
        } else {
            res.put("severity", "SIMPLE");
            res.put("title", "Lỗi đơn giản - Có thể xử lý ngay");
            res.put("notifyTarget", "Người báo cáo / GV");
            res.put("steps", List.of(
                    Map.of("step", "Bước 1: Kiểm tra cáp kết nối / nguồn điện", "detail", "Đảm bảo dây cắm và công tắc nguồn đã bật chặt."),
                    Map.of("step", "Bước 2: Chọn lại nguồn tín hiệu (Source/Input)", "detail", "Kiểm tra máy đang nhận đúng cổng kết nối."),
                    Map.of("step", "Bước 3: Khởi động lại thiết bị", "detail", "Tắt nguồn 15 giây rồi bật lại để kiểm tra.")
            ));
        }
        return res;
    }

    private Map<String, Object> fallbackTechChat(String equipmentName, String question) {
        String q = question.toLowerCase();
        Map<String, Object> res = new HashMap<>();
        if (q.contains("u4")) {
            res.put("text", "Lỗi U4 là lỗi mất kết nối giữa dàn nóng và dàn lạnh. Hãy kiểm tra:\n1. Đo thông mạch dây tín hiệu F1-F2.\n2. Kiểm tra cầu chì bo mạch dàn nóng.\n3. Nguồn điện cấp vào dàn nóng.");
            res.put("hasPdfButton", true);
        } else {
            res.put("text", "AI Trợ lý cho " + equipmentName + ":\n1. Kiểm tra điện áp nguồn cấp vào.\n2. Kiểm tra cầu chì, tụ khởi động và giắc kết nối.\n3. Đo thông mạch cảm biến nhiệt.");
            res.put("hasPdfButton", false);
        }
        return res;
    }
}