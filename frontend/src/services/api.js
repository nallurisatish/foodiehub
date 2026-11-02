import axios from 'axios';

// Dynamically determine the correct API Base URL
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  // In production / deployed environment (e.g. on Render):
  // NEVER use localhost/127.0.0.1 URLs. Force relative '/api/v1'
  // so requests are served by the same host without Mixed Content or CORS failures!
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
      return '/api/v1';
    }
  }

  return envUrl || '/api/v1';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor to attach Authorization Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('foodiehub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthorized / expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      // If unauthorized and token is invalid, clear stale token
    }
    return Promise.reject(error);
  }
);

export default api;
