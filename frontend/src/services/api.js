import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Default FastAPI port

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const uploadInvoice = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getInvoices = async () => {
  const response = await api.get('/invoices');
  return response.data;
};

export const getAnalytics = async () => {
  const response = await api.get('/analytics');
  return response.data;
};

export default api;
