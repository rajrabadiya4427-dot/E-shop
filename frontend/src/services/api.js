import axios from 'axios';
import { defaultProducts } from '../data/defaultProducts';

const localImages = {};
defaultProducts.forEach(product => {
  localImages[product.name] = product.image_url;
});

const resolveLocalImages = (data) => {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map(item => resolveLocalImages(item));
  }
  if (typeof data === 'object') {
    if (data.name && !data.image_url && localImages[data.name]) {
      data.image_url = localImages[data.name];
    }
    if (data.product && typeof data.product === 'object' && data.product.name) {
      if (!data.product.image_url && localImages[data.product.name]) {
        data.product.image_url = localImages[data.product.name];
      }
    }
    if (data.items && Array.isArray(data.items)) {
      data.items = data.items.map(item => resolveLocalImages(item));
    }
  }
  return data;
};

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
  (response) => {
    response.data = resolveLocalImages(response.data);
    return response;
  },
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
