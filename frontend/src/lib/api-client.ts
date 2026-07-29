import axios from 'axios';

/**
 * Same-origin requests via the Vite dev proxy (or reverse proxy in prod) → backend.
 * JWT access_token cookie is set/sent automatically with withCredentials.
 */
const apiClient = axios.create({
  baseURL: '',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

function redirectToLogin() {
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = String(error.config?.url ?? '');
      const isAuthEndpoint =
        url.includes('/api/auth/login') ||
        url.includes('/api/auth/register') ||
        url.includes('/api/auth/me');

      // Let login/register/me pages handle their own 401s
      if (!isAuthEndpoint) {
        redirectToLogin();
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
