import axios from 'axios';

const BASE_URL = import.meta.env.MODE ==="development" ? 'http://localhost:5000/api' :"/api";

const apiInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor to format errors and retrieve backend messages
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const api = {
  get: async (endpoint) => {
    const res = await apiInstance.get(endpoint);
    return res.data;
  },

  post: async (endpoint, data) => {
    const res = await apiInstance.post(endpoint, data);
    return res.data;
  },

  upload: async (endpoint, formData) => {
    const res = await apiInstance.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },

  put: async (endpoint, data) => {
    const res = await apiInstance.put(endpoint, data);
    return res.data;
  },

  delete: async (endpoint) => {
    const res = await apiInstance.delete(endpoint);
    return res.data;
  }
};
