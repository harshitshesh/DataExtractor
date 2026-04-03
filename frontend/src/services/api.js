import axios from 'axios';

// Use the environment variable, with a fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

console.log('[API] Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 min timeout for large invoice processing
  headers: {
    'Accept': 'application/json',
  },
});

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('[API] Network error — backend may be unreachable at:', API_BASE_URL);
    } else if (error.response) {
      console.error(`[API] Server error ${error.response.status}:`, error.response.data);
    }
    return Promise.reject(error);
  }
);

export const uploadInvoice = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 180000, // 3 min timeout for uploads (OCR + AI can be slow)
  });
  return response.data;
};

export const getInvoices = async () => {
  const response = await api.get('/invoices');
  return response.data;
};

export const clearInvoices = async () => {
  const response = await api.delete('/invoices');
  return response.data;
};

export const getAnalytics = async () => {
  const response = await api.get('/analytics');
  return response.data;
};

export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
