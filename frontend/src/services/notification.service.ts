import API from '../api/axios';

export const notificationService = {
  getNotifications: async () => {
    const { data } = await API.get('/notifications');
    return data;
  },
  getUnreadCount: async () => {
    const { data } = await API.get('/notifications/unread-count');
    return data;
  },
  markAsRead: async (id: string) => {
    const { data } = await API.put(`/notifications/${id}/read`);
    return data;
  },
  markAllAsRead: async () => {
    const { data } = await API.put('/notifications/read-all');
    return data;
  },
};
