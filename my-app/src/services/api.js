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
  updateEquipmentStatus: (code, status) =>
    request(`/equipments/${encodeURIComponent(code)}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }),
  createEquipment: (equipment) =>
    request('/equipments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(equipment),
    }),
  updateEquipmentDetails: (code, details) =>
    request(`/equipments/${encodeURIComponent(code)}/details`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details),
    }),
  getTechnicians: () => request('/auth/technicians'),

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
  createReport: (payload) => {
    const { image, ...report } = payload;
    const formData = new FormData();
    formData.append(
      'report',
      new Blob([JSON.stringify(report)], { type: 'application/json' })
    );
    if (image) {
      formData.append('image', image);
    }
    return request('/reports', {
      method: 'POST',
      body: formData,
    });
  },
  acceptReport: (id) =>
    request(`/reports/${id}/accept`, { method: 'PUT' }),
  completeReport: (id, payload) => {
    const { image, ...completion } = payload;
    const formData = new FormData();
    formData.append(
      'completion',
      new Blob([JSON.stringify(completion)], { type: 'application/json' })
    );
    if (image) {
      formData.append('image', image);
    }
    return request(`/reports/${id}/complete`, {
      method: 'PUT',
      body: formData,
    });
  },
  getReportImageUrl: (id, imageType) =>
    `${API_BASE_URL}/reports/${id}/images/${imageType}`,

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
  setTechnicianPresence: (email, isOnline) =>
    request('/shifts/presence', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, isOnline }),
    }),
  toggleShiftOnline: (id) =>
    request(`/shifts/${id}/toggle`, { method: 'PUT' }),

  // Preventive maintenance
  getMaintenanceTasks: () => request('/maintenance-tasks'),
  getPartUsages: (year, month) =>
    request(`/part-usages?year=${encodeURIComponent(year)}&month=${encodeURIComponent(month)}`),
  getMaintenanceTaskImageUrl: (id) => `${API_BASE_URL}/maintenance-tasks/${id}/image`,
  createMaintenanceTask: (task) =>
    request('/maintenance-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    }),
  startMaintenanceTask: (id) =>
    request(`/maintenance-tasks/${id}/start`, { method: 'PUT' }),
  acknowledgeMaintenanceTask: (id) =>
    request(`/maintenance-tasks/${id}/acknowledge`, { method: 'PUT' }),
  completeMaintenanceTask: (id, payload) => {
    const formData = new FormData();
    formData.append('resultNotes', payload.resultNotes);
    formData.append('replacedParts', payload.replacedParts || '');
    formData.append('parts', JSON.stringify(payload.parts || []));
    if (payload.image) {
      formData.append('image', payload.image);
    }
    return request(`/maintenance-tasks/${id}/complete`, {
      method: 'PUT',
      body: formData,
    });
  },
};