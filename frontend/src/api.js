import axios from 'axios';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor (handles expired/invalid token)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

const API_URL = 'https://job-tracker-api-vohb.onrender.com/api/applications';

export const getApplications = () => axios.get(API_URL);
export const createApplication = (data) => axios.post(API_URL, data);
export const updateApplication = (id, data) => axios.put(`${API_URL}/${id}`, data);
export const deleteApplication = (id) => axios.delete(`${API_URL}/${id}`);

const MATCHER_URL = 'https://job-tracker-api-vohb.onrender.com/api/matcher';

export const matchResume = (data) => axios.post(MATCHER_URL, data);

const AUTH_URL = 'https://job-tracker-api-vohb.onrender.com/api/auth';

export const signup = (data) => axios.post(`${AUTH_URL}/signup`, data);
export const login = (data) => axios.post(`${AUTH_URL}/login`, data);