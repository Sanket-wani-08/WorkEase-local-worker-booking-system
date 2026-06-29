import API from '../api/axios';

export const authService = {
  loginUser: async (credentials: any) => {
    const { data } = await API.post('/auth/login', credentials);
    return data;
  },
  loginWorker: async (credentials: any) => {
    const { data } = await API.post('/workers/login', credentials);
    return data;
  },
  registerUser: async (userData: any) => {
    const { data } = await API.post('/auth/register', userData);
    return data;
  },
  forgotPasswordUser: async (payload: any) => {
    const { data } = await API.post('/auth/forgot-password', payload);
    return data;
  },
  forgotPasswordWorker: async (payload: any) => {
    const { data } = await API.post('/workers/forgot-password', payload);
    return data;
  },
  resetPasswordUser: async (token: string, payload: any) => {
    const { data } = await API.put(`/auth/reset-password/${token}`, payload);
    return data;
  },
  resetPasswordWorker: async (token: string, payload: any) => {
    const { data } = await API.put(`/workers/reset-password/${token}`, payload);
    return data;
  },
  resetPasswordAnswerUser: async (payload: any) => {
    const { data } = await API.post('/auth/reset-password-answer', payload);
    return data;
  },
  resetPasswordAnswerWorker: async (payload: any) => {
    const { data } = await API.post('/workers/reset-password-answer', payload);
    return data;
  },
};
