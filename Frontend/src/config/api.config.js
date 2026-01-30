// API Configuration
// Use environment variables with fallback to default values

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
  LOGOUT: `${API_BASE_URL}/api/v1/auth/logout`,
  SIGNUP: `${API_BASE_URL}/api/v1/auth/signup`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/v1/auth/forget-password`,
  RESET_PASSWORD: `${API_BASE_URL}/api/v1/auth/reset-password`,
  
  // Company endpoints
  CREATE_COMPANY: `${API_BASE_URL}/api/v1/company/create-company`,
  GET_API_KEY: `${API_BASE_URL}/api/v1/company/api-key`,
  GET_EMPLOYEE_INFO: `${API_BASE_URL}/api/v1/company/employee-info`,
  GET_PLANS: `${API_BASE_URL}/api/v1/company/plans/active`,
  
  // Chat endpoints (if they exist)
  GET_CHAT: `${API_BASE_URL}/api/v1/chat/get-chat`,
  ADD_MESSAGE: `${API_BASE_URL}/api/v1/chat/add-message`,
};

export { API_BASE_URL, SOCKET_URL };
