import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  getProfile: () => api.get('/auth/profile'),
};

export const userAPI = {
  getAllUsers: () => api.get('/users'),
  createUser: (data) => api.post('/users', data),
  getUser: (userId) => api.get(`/users/${userId}`),
  updateUser: (userId, data) => api.put(`/users/${userId}`, data),
  disableUser: (userId) => api.patch(`/users/${userId}/disable`),
  resetPassword: (userId, newPassword) =>
    api.post(`/users/${userId}/reset-password`, { newPassword }),
};

export const warrantyAPI = {
  createForm: (data) => api.post('/warranty', data),
  getAllForms: () => api.get('/warranty'),
  getFormDetail: (formId) => api.get(`/warranty/${formId}`),
  deleteForm: (formId) => api.delete(`/warranty/${formId}`),
  searchForms: (search, filterType) =>
    api.get('/warranty/search', { params: { search, filterType } }),
};

export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
};

export const exportAPI = {
  exportWarrantyForms: (days = 'all') =>
    api.get('/export/warranty', { params: { days }, responseType: 'blob' }),
  exportByBranch: (branch, days = 'all') =>
    api.get('/export/branch', { params: { branch, days }, responseType: 'blob' }),
  exportEmployeeData: (employeeId, days = 'all') =>
    api.get('/export/employee', { params: { employeeId, days }, responseType: 'blob' }),
};

export default api;
