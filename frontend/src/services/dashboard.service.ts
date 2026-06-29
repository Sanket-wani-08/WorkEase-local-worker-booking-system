import API from '../api/axios';

export const dashboardService = {
  getStats: async () => {
    const { data } = await API.get('/dashboard/stats');
    return data;
  },
  getAdvancedStats: async () => {
    const { data } = await API.get('/dashboard/advanced');
    return data;
  },
  getPendingWorkers: async () => {
    const { data } = await API.get('/workers/pending');
    return data;
  },
};
