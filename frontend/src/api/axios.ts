import axios from "axios";

const API = axios.create({
  baseURL: "https://workease-backend-zwsf.onrender.com",
  withCredentials: true
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("userToken") || localStorage.getItem("workerToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;