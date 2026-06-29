import API from '../api/axios';

export const userService = {
  getUserProfile: async () => {
    const { data } = await API.get('/user/me');
    return data;
  },
  updateUserProfile: async (payload: any) => {
    const { data } = await API.put('/user/me', payload);
    return data;
  },
};
