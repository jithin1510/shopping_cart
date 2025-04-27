import axios from 'axios';

const API_URL = '/api/users/';

// Get all users (admin only)
const getUsers = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await axios.get(API_URL, config);
  return response.data;
};

// Get user by ID (admin only)
const getUserById = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await axios.get(`${API_URL}${id}`, config);
  return response.data;
};

// Update user profile
const updateProfile = async (userData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await axios.put(`${API_URL}profile`, userData, config);
  return response.data;
};

// Update user password
const updatePassword = async (passwordData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await axios.put(`${API_URL}password`, passwordData, config);
  return response.data;
};

// Create vendor (admin only)
const createVendor = async (vendorData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await axios.post(`${API_URL}vendors`, vendorData, config);
  return response.data;
};

// Update user (admin only)
const updateUser = async (id, userData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await axios.put(`${API_URL}${id}`, userData, config);
  return response.data;
};

// Delete user (admin only)
const deleteUser = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await axios.delete(`${API_URL}${id}`, config);
  return response.data;
};

const userService = {
  getUsers,
  getUserById,
  updateProfile,
  updatePassword,
  createVendor,
  updateUser,
  deleteUser,
};

export default userService;