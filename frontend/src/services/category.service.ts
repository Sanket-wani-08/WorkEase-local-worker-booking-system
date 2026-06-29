import API from '../api/axios';

export const categoryService = {
  getCategories: async () => {
    const { data } = await API.get('/categories');
    return data;
  },
  createCategory: async (categoryData: any) => {
    const { data } = await API.post('/categories', categoryData);
    return data;
  },
  updateCategory: async (id: string, categoryData: any) => {
    const { data } = await API.put(`/categories/${id}`, categoryData);
    return data;
  },
  deleteCategory: async (id: string) => {
    const { data } = await API.delete(`/categories/${id}`);
    return data;
  },
};
