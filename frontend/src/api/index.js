import api from './axios';

const extractError = (err, fallback = 'Something went wrong') =>
  err?.response?.data?.message || err?.message || fallback;

export const authApi = {
  login: (payload) => api.post('/auth/login', payload),
  me: () => api.get('/auth/me')
};

export const employeeApi = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  remove: (id) => api.delete(`/employees/${id}`)
};

export const attendanceApi = {
  getAll: (params) => api.get('/attendance', { params }),
  mark: (data) => api.post('/attendance', data),
  summary: (params) => api.get('/attendance/summary', { params }),
  getByEmployee: (id, params) => api.get(`/attendance/employee/${id}`, { params }),
  exportCsv: (params) =>
    api.get('/attendance/export', { params, responseType: 'blob' })
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats')
};

export const departmentApi = {
  getAll: () => api.get('/departments')
};

export { extractError };