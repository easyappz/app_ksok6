import api from './axios';

export const createGame = () => api.post('/api/games/create');
export const listOpenGames = () => api.get('/api/games/open');
export const joinGame = (id) => api.post(`/api/games/${id}/join`);
export const getGame = (id) => api.get(`/api/games/${id}`);
export const makeMove = (id, index) => api.post(`/api/games/${id}/move`, { index });
export const closeGame = (id) => api.post(`/api/games/${id}/close`);
