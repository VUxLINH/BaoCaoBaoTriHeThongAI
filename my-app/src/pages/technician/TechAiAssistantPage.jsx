import { api } from '../../services/api';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import MobileAppLayout from '../../layouts/MobileAppLayout';

export default function TechAiAssistantPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const equipmentName = state?.equipmentName || 'Điều hòa Daikin Inverter 2HP';

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async (textToSend) => {
    const question = (textToSend || input).trim();
    if (!question || isSending) return;

    setMessages((prev) => [...prev, { id: Date.now(), sender: 'USER', text: question }]);
    setInput('');
    setIsSending(true);

    try {
      const reply = await api.askTechAi(equipmentName, question);
      if (!reply || typeof reply.text !== 'string' || !reply.text.trim()) {
        throw new Error('Backend trả về câu trả lời không hợp lệ.');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: 'AI',
          text: reply.text,
          hasPdfButton: reply.hasPdfButton,
          provider: reply.provider,
          warning: reply.warning,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: 'AI',
          text: err instanceof Error
            ? err.message
            : 'Không thể nhận phản hồi từ Gemini. Vui lòng thử lại.',
          provider: 'error',
          hasPdfButton: false,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <MobileAppLayout>
      <header className="white-topbar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} />
        </button>
        <h2>Trợ lý AI Kỹ thuật</h2>
      </header>

      <div className="ai-chat-shell">
        <div className="ai-context-bar">
          <div className="ai-context-pill">Ngữ cảnh: {equipmentName}</div>
        </div>

        <div className="chat-messages-area">
          {messages.length === 0 && (
            <p className="chat-ai-text">Nhập câu hỏi hoặc chọn gợi ý để bắt đầu trò chuyện.</p>
          )}
          {messages.map((msg) =>
            msg.sender === 'USER' ? (
              <div key={msg.id} className="chat-bubble-user">
                {msg.text}
              </div>
            ) : (
              <div key={msg.id} className="chat-bubble-ai">
                <div className="chat-ai-label">
                  {msg.provider === 'gemini'
                    ? 'Gemini:'
                    : msg.provider === 'fallback'
                      ? 'AI nội bộ (chưa dùng Gemini):'
                      : 'Lỗi Gemini:'}
                </div>
                <div className="chat-ai-text">{msg.text}</div>
                {msg.warning && <div className="chat-ai-text">{msg.warning}</div>}
                {msg.hasPdfButton && (
                  <button
                    type="button"
                    className="pdf-btn"
                    onClick={() =>
                      alert(`Đang mở tài liệu sơ đồ mạch kỹ thuật cho: ${equipmentName}`)
                    }
                  >
                    Xem sơ đồ mạch PDF
                  </button>
                )}
              </div>
            )
          )}
        </div>

        <div className="chat-footer">
          <div className="quick-prompts-row">
            <button
              type="button"
              className="prompt-chip"
              disabled={isSending}
              onClick={() => sendMessage('Lịch sử lỗi máy này?')}
            >
              Lịch sử lỗi máy này?
            </button>
            <button
              type="button"
              className="prompt-chip"
              disabled={isSending}
              onClick={() => sendMessage('Thông số tụ khởi động')}
            >
              Thông số tụ khởi động
            </button>
          </div>

          <form onSubmit={handleSubmit} className="chat-input-row">
            <input
              type="text"
              className="form-input"
              placeholder="Hỏi AI về kỹ thuật sửa chữa..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending}
            />
            <button type="submit" className="chat-send-btn" disabled={isSending}>
              {isSending ? 'Đang gửi...' : 'Gửi'}
            </button>
          </form>
        </div>
      </div>
    </MobileAppLayout>
  );
}