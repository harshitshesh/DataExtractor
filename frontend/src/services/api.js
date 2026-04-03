import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Docker backend

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 min timeout for large invoice processing
});

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
