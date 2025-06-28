import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000/api/' });

export const login = (data) => API.post('/login/', data);
export const register = (data) => API.post('/register/', data);
