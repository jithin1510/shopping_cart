import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductById, updateProduct, reset } from '../../features/product/productSlice';
import { FaSpinner, FaSave, FaImage } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    countInStock: '',
    image: ''
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  
  const { product, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.product
  );
  
  useEffect(() => {
    dispatch(getProductById(id));
    
    return () => {
      dispatch(reset());
    };
  }, [dispatch, id]);
  
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        countInStock: product.countInStock || '',
        image: product.image || ''
      });
      
      if (product.image) {
        setImagePreview(product.image);
      }
    }
  }, [product]);
  
  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    
    if (isSuccess && message) {
      toast.success(message);
      navigate('/vendor/products');
    }
  }, [isError, isSuccess, message, navigate]);
  
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setImageFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // In a real app, you would upload the image to a server/cloud storage
      // and get back a URL to store in the product data
      // For now, we'll just use a placeholder URL
      setFormData((prevState) => ({
        ...prevState,
        image: 'https://via.placeholder.com/300x300?text=Product+Image',
      }));
    }
  };
  
  const onSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.countInStock) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // In a real app, you would first upload the image and get the URL
    // Then include that URL in the product data
    
    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      countInStock: parseInt(formData.countInStock),
      image: formData.image || 'https://via.placeholder.com/300x300?text=No+Image'
    };
    
    dispatch(updateProduct({ id, productData }));
  };
  
  const categories = [
    'Electronics',
    'Clothing',
    'Books',
    'Home & Kitchen',
    'Beauty',
    'Toys',
    'Sports',
    'Automotive',
    'Other'
  ];
  
  if (isLoading && !product) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Product</h1>
        
        {isError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Product Name
              </label>
              <input
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="name"
                name="name"
                value={formData.name}
                placeholder="Enter product name"
                onChange={onChange}
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="description"
                name="description"
                value={formData.description}
                placeholder="Enter product description"
                onChange={onChange}
                rows="4"
                required
              ></textarea>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="price"
                name="price"
                value={formData.price}
                placeholder="Enter price"
                onChange={onChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="countInStock">
                Count In Stock
              </label>
              <input
                type="number"
                min="0"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="countInStock"
                name="countInStock"
                value={formData.countInStock}
                placeholder="Enter stock quantity"
                onChange={onChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                Category
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="category"
                name="category"
                value={formData.category}
                onChange={onChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
                Product Image
              </label>
              
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col w-full h-32 border-2 border-dashed hover:bg-gray-100 hover:border-gray-300 cursor-pointer">
                  <div className="flex flex-col items-center justify-center pt-7">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-24 h-24 object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                        }}
                      />
                    ) : (
                      <>
                        <FaImage className="w-8 h-8 text-gray-400" />
                        <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                          Select a photo
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="opacity-0"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="inline-block animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <FaSave className="inline-block mr-2" />
                  Update Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEdit;