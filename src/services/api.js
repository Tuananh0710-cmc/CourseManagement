import axios from 'axios';

// Thay 'YOUR_PROJECT_ID' bằng Project ID thực tế trên MockAPI.io của bạn
// Ví dụ: https://651a2b3c4d5e6f7a8b9c0d1e.mockapi.io/api/v1
const BASE_URL = 'https://6ad767ee95e98f36aef26718.mockapi.io/api/v1';
// ==================== KHÓA HỌC (COURSES) ====================

// Lấy danh sách tất cả khóa học
export const getCourses = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/courses`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tải danh sách khóa học:', error);
    throw error;
  }
};

// Thêm mới một khóa học
export const addCourse = async (courseData) => {
  try {
    const response = await axios.post(`${BASE_URL}/courses`, courseData);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi thêm khóa học:', error);
    throw error;
  }
};

// Cập nhật thông tin khóa học theo ID
export const updateCourse = async (id, courseData) => {
  try {
    const response = await axios.put(`${BASE_URL}/courses/${id}`, courseData);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật khóa học:', error);
    throw error;
  }
};

// Xóa khóa học theo ID
export const deleteCourse = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/courses/${id}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa khóa học:', error);
    throw error;
  }
};

// ==================== DANH MỤC (CATEGORIES) ====================

// Lấy danh sách tất cả danh mục
export const getCategories = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/categories`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tải danh sách danh mục:', error);
    throw error;
  }
};

// Thêm mới một danh mục
export const addCategory = async (categoryData) => {
  try {
    const response = await axios.post(`${BASE_URL}/categories`, categoryData);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi thêm danh mục:', error);
    throw error;
  }
};

// Cập nhật tên danh mục theo ID
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await axios.put(`${BASE_URL}/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật danh mục:', error);
    throw error;
  }
};

// Xóa danh mục theo ID
export const deleteCategory = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa danh mục:', error);
    throw error;
  }
};