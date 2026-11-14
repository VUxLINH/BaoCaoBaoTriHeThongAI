const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(endpoint, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  } catch {
    throw new Error('Không thể kết nối tới Server Java (cổng 8080). Hãy kiểm tra lại Spring Boot!');
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (response.ok) {
        throw new Error('Server trả về dữ liệu không hợp lệ.');
      }
    }
  }

  if (!response.ok) {
    const responseMessage =
      text && text.length <= 300 ? text.trim() : '';
    throw new Error(
      data?.message ||
        data?.detail ||
        responseMessage ||
        `Lỗi hệ thống (${response.status})`
    );
  }
  return data;
}

export const api = {
  // Auth
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),

  // Equipments
  getEquipments: () => request('/equipments'),
  createEquipment: (equipment) =>
    request('/equipments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(equipment),
    }),

  // Reports & AI Triage
  getReports: () => request('/reports'),
  analyzeIssueWithAi: (equipmentCode, description, imageFile) => {
    const formData = new FormData();
    formData.append('equipmentCode', equipmentCode);
    formData.append('description', description);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    return request('/reports/analyze', {
      method: 'POST',
      body: formData,
    });
  },
  createReport: (report) =>
    request('/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    }),
  acceptReport: (id) =>
    request(`/reports/${id}/accept`, { method: 'PUT' }),
  completeReport: (id, payload) =>
    request(`/reports/${id}/complete`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),

  // Chatbot AI Kỹ thuật
  askTechAi: (equipmentName, question) =>
    request('/ai/tech-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ equipmentName, question }),
    }),

  // Shifts (Ca trực)
  getShifts: () => request('/shifts'),
  createShift: (shift) =>
    request('/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shift),
    }),
  toggleShiftOnline: (id) =>
    request(`/shifts/${id}/toggle`, { method: 'PUT' }),
};