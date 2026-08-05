import axios from 'axios';

// Get backend URL from environment or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchTickets = async () => {
  const response = await api.get('/tickets');
  return response.data;
};

export const resolveTicket = async (id) => {
  const response = await api.post(`/tickets/${id}/resolve`);
  return response.data;
};

export const simulateTelemetry = async (payload) => {
  const response = await api.post('/telemetry', payload);
  return response.data;
};

export default api;
