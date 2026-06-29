import API from '../api/axios';

export const reviewService = {
  submitReview: async (reviewData: any) => {
    const { data } = await API.post('/reviews', reviewData);
    return data;
  },
};
