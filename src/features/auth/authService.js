import axios from 'axios';

const API_URL = '/api/auth/';

// Register user
const register = async (userData) => {
  const response = await axios.post(API_URL + 'register', userData);
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await axios.post(API_URL + 'login', userData);
  
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

// Verify email with OTP
const verifyEmail = async (verificationData) => {
  const response = await axios.post(API_URL + 'verify-email', verificationData);
  
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

// Resend OTP
const resendOTP = async (email) => {
  const response = await axios.post(API_URL + 'resend-otp', { email });
  return response.data;
};

// Get user data
const getMe = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await axios.get(API_URL + 'me', config);
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

const authService = {
  register,
  login,
  verifyEmail,
  resendOTP,
  getMe,
  logout,
};

export default authService;