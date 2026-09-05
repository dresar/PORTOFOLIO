import axios from "axios";

const baseURL = "/api";

export const api = axios.create({
  baseURL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    if (error.response?.data?.error && typeof error.response.data.error === 'object') {
      const errObj = error.response.data.error;
      error.response.data.error = errObj.message || errObj.code || JSON.stringify(errObj);
    }
    return Promise.reject(error);
  }
);

