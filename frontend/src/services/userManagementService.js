import api from './api';

// Get all users
export const getAllUsers = async () => {
  try {
    const response = await api.get('/api/v1/users');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/api/v1/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get available roles
export const getAvailableRoles = async () => {
  try {
    const response = await api.get('/api/v1/users/roles');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create new user
export const createUser = async (userData) => {
  try {
    const response = await api.post('/api/v1/users', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update user
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/api/v1/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/api/v1/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
