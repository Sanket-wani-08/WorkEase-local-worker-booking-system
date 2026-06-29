import API from '../api/axios';

export const bookingService = {
  getBooking: async (id: string) => {
    const { data } = await API.get(`/bookings/${id}`);
    return data;
  },
  getMyBookings: async () => {
    const { data } = await API.get('/bookings/my-bookings');
    return data;
  },
  getWorkerBookings: async () => {
    const { data } = await API.get('/bookings/worker-bookings');
    return data;
  },
  getAllBookings: async () => {
    const { data } = await API.get('/bookings/all');
    return data;
  },
  createBooking: async (bookingData: any) => {
    const { data } = await API.post('/bookings', bookingData);
    return data;
  },
  updateBookingStatus: async (id: string, status: string) => {
    const { data } = await API.put(`/bookings/${id}/status`, { status });
    return data;
  },
  cancelBooking: async (id: string) => {
    const { data } = await API.put(`/bookings/${id}/cancel`);
    return data;
  },
  requestPayment: async (id: string, paymentStatus: string) => {
    const { data } = await API.put(`/bookings/${id}/payment`, { paymentStatus });
    return data;
  },
  verifyPayment: async (paymentData: any) => {
    const { data } = await API.post('/bookings/verify-payment', paymentData);
    return data;
  },
  getRazorpayKey: async () => {
    const { data } = await API.get('/bookings/razorpay-key');
    return data;
  },
};
