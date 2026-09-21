const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('vc_token');
  }
  return null;
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('vc_token', token);
  }
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('vc_token');
    localStorage.removeItem('vc_user');
  }
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const data = await res.json();
      errorMsg = data.detail || data.message || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Auth
  register: (userData: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request('/auth/me'),
  verifyEmail: () => request('/auth/verify-email', { method: 'POST' }),
  verifyPhone: () => request('/auth/verify-phone', { method: 'POST' }),

  // Districts
  getDistricts: () => request('/districts'),
  detectDistrict: (address: string, lat?: number, lng?: number) => {
    const params = new URLSearchParams();
    if (address) params.append('address', address);
    if (lat) params.append('lat', lat.toString());
    if (lng) params.append('lng', lng.toString());
    return request(`/districts/detect?${params.toString()}`);
  },

  // Donors
  getDonorProfile: () => request('/donors/profile'),
  updateDonorProfile: (data: any) => request('/donors/profile', { method: 'PUT', body: JSON.stringify(data) }),
  submitScreening: (answers: any) => request('/donors/screening', { method: 'POST', body: JSON.stringify({ answers }) }),
  getDigitalCard: () => request('/donors/digital-card'),
  getDonorAchievements: () => request('/donors/achievements'),

  // Emergency Requests
  createEmergencyRequest: (reqData: any) => request('/requests', { method: 'POST', body: JSON.stringify(reqData) }),
  listEmergencyRequests: (filters: any = {}) => {
    const params = new URLSearchParams();
    if (filters.blood_group) params.append('blood_group', filters.blood_group);
    if (filters.district) params.append('district', filters.district);
    if (filters.urgency) params.append('urgency', filters.urgency);
    if (filters.status) params.append('status', filters.status);
    return request(`/requests?${params.toString()}`);
  },
  getRequestDetail: (id: string) => request(`/requests/${id}`),
  updateRequestStatus: (id: string, status: string) => request(`/requests/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Chain Rescue
  getChainRescue: (requestId: string) => request(`/chain-rescue/${requestId}`),
  escalateChainRescue: (requestId: string) => request(`/chain-rescue/${requestId}/escalate`, { method: 'POST' }),

  // Inventory
  getInventorySummary: (district?: string) => {
    const p = district ? `?district=${encodeURIComponent(district)}` : '';
    return request(`/inventory/summary${p}`);
  },
  listInventoryItems: (filters: any = {}) => {
    const params = new URLSearchParams(filters);
    return request(`/inventory/items?${params.toString()}`);
  },

  // Chat
  listConversations: () => request('/chat/conversations'),
  getMessages: (conversationId: string) => request(`/chat/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: string, message_text: string) => request('/chat/messages', {
    method: 'POST',
    body: JSON.stringify({ conversation_id: conversationId, message_text })
  }),

  // Certificates
  listCertificates: () => request('/certificates'),
  verifyCertificatePublic: (code: string) => request(`/certificates/verify/${code}`),
  getCertificatePdfUrl: (certId: string) => `${API_BASE}/certificates/${certId}/pdf`,

  // ML Demand Forecast
  get7DayForecast: (district?: string) => {
    const p = district ? `?district=${encodeURIComponent(district)}` : '';
    return request(`/forecast/7-days${p}`);
  },

  // Admin
  getAdminOverview: () => request('/admin/overview'),
  listAdminUsers: (filters: any = {}) => request(`/admin/users?${new URLSearchParams(filters).toString()}`),
  toggleUserVerification: (userId: string) => request(`/admin/users/${userId}/verify`, { method: 'PUT' }),
  getAdminAuditLogs: () => request('/admin/audit-logs'),
  getAdminInventoryPdfUrl: () => `${API_BASE}/admin/reports/inventory-pdf`,

  // Notifications
  listNotifications: () => request('/notifications'),
  markNotificationRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/notifications/mark-all-read', { method: 'PUT' }),
};
