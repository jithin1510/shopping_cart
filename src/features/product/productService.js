import axios from 'axios';

const API_URL = '/api/products/';

// Get all products
const getProducts = async (params = {}) => {
  const { keyword = '', page = 1, limit = 10, sort = '' } = params;
  
  let url = `${API_URL}?page=${page}&limit=${limit}`;
  
  if (keyword) {
    url += `&search=${keyword}`;
  }
  
  if (sort) {
    url += `&sort=${sort}`;
  }
  
  const response = await axios.get(url);
  return response.data;
};

// Get product by ID
const getProductById = async (id) => {
  const response = await axios.get(`${API_URL}${id}`);
  return response.data;
};

// Get vendor products
const getVendorProducts = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await axios.get(`${API_URL}vendor`, config);
  return response.data;
};

// Create product
const createProduct = async (productData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  
  const response = await axios.post(API_URL, productData, config);
  return response.data;
};

// Update product
const updateProduct = async (id, productData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  
  const response = await axios.put(`${API_URL}${id}`, productData, config);
  return response.data;
};

// Delete product
const deleteProduct = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await axios.delete(`${API_URL}${id}`, config);
  return response.data._id;
};

const productService = {
  getProducts,
  getProductById,
  getVendorProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};

export default productService;