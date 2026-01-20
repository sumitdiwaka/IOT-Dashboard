import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://iot-dashboard-kmje.onrender.com';


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
    console.error('API Error:', errorMessage);
    return Promise.reject(errorMessage);
  }
);

// Device APIs
export const deviceAPI = {
  getAllDevices: () => api.get('/api/devices'),
  getDevice: (id) => api.get(`/api/devices/${id}`),
  createDevice: (data) => api.post('/api/devices', data),
  updateDevice: (id, data) => api.put(`/api/devices/${id}`, data),
  deleteDevice: (id) => api.delete(`/api/devices/${id}`),
  getDeviceData: (id, params) => api.get(`/api/devices/${id}/data`, { params }),
  getDeviceStats: (id) => api.get(`/api/devices/${id}/stats`),
};

// Dashboard APIs
export const dashboardAPI = {
  getSummary: () => api.get('/api/dashboard/summary'),
  getMetrics: () => api.get('/api/dashboard/metrics'),
  getTimeSeries: (params) => api.get('/api/dashboard/timeseries', { params }),
};

export const healthCheck = () => api.get('/health');

export default api;