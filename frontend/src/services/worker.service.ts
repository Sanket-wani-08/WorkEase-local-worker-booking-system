import API from '../api/axios';

export const workerService = {
  searchWorkers: async (params: { category?: string; subcategory?: string }) => {
    const { data } = await API.get('/workers/search', { params });
    return data;
  },
  registerWorker: async (workerData: FormData) => {
    const { data } = await API.post('/workers/register', workerData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
  getWorkerProfile: async () => {
    const { data } = await API.get('/workers/me');
    return data;
  },
  updateWorkerProfile: async (payload: any) => {
    const { data } = await API.put('/workers/me', payload);
    return data;
  },
  getWorkerStats: async () => {
    const { data } = await API.get('/workers/stats');
    return data;
  },
  verifyWorker: async (id: string) => {
    const { data } = await API.put(`/workers/verify/${id}`);
    return data;
  },
  rejectWorker: async (id: string, reason: string) => {
    const { data } = await API.put(`/workers/reject/${id}`, { reason });
    return data;
  },
};
