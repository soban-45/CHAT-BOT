import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000/api/' });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('access');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem('refresh')
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          'http://localhost:8000/api/token/refresh/',
          {
            refresh: localStorage.getItem('refresh'),
          }
        );

        const newAccess = res.data.access;
        localStorage.setItem('access', newAccess);

        originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;

        return API(originalRequest); 
      } catch (refreshError) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);

export const getThreads = () => API.get('/thread_list/');
export const createThread = (title) => API.post('/thread/', { title });
export const getMessages = (threadId) =>
  API.get(`/thread_message/?thread_id=${threadId}`);
export const sendMessage = (threadId, content) =>
  API.post(`/thread_message/?thread_id=${threadId}`, { content });

export const uploadDocument = (threadId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  return API.post(`/upload_document/?thread_id=${threadId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
