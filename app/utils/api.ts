import axios from "axios";

const api = axios.create({
  baseURL: "https://dating-node.onrender.com",
  timeout: 30000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.log('❌ API Error Details:', {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
      status: error.response?.status
    });
    return Promise.reject(error);
  }
);

export default api;