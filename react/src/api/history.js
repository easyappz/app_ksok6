import api from './axios';

export const getHistory = () => api.get('/api/history');
