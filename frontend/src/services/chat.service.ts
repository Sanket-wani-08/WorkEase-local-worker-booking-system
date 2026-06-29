import API from '../api/axios';

export const chatService = {
  getMessages: async (bookingId: string) => {
    const { data } = await API.get(`/messages/${bookingId}`);
    return data;
  },
};
