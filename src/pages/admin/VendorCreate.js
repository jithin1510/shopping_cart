import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createVendor, reset } from '../../features/user/userSlice';
import { FaSpinner, FaUserPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';

const VendorCreate = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  
  const { name, email } = formData;
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.user
  );
  
  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    
    if (isSuccess) {
      toast.success('Vendor created successfully. Verification email sent.');
      setFormData({
        name: '',
        email: '',
      });
    }
    
    return () => {
      dispatch(reset());
    };
  }, [isError, isSuccess, message, dispatch]);
  
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };
  
  const onSubmit = (e) => {
    e.preventDefault();
    
    if (!name || !email) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    dispatch(createVendor({ name, email }));
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            <FaUserPlus className="inline-block mr-2" />
            Create Vendor
          </h1>
          <p className="text-gray-600 mt-2">
            Add a new vendor to the system
          </p>
        </div>
        
        {isError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}
        
        {isSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Vendor created successfully. Verification email sent.
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="name"
            >
              Vendor Name
            </label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              name="name"
              value={name}
              placeholder="Enter vendor name"
              onChange={onChange}
              required
            />
          </div>
          
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email Address
            </label>
            <input
              type="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              name="email"
              value={email}
              placeholder="Enter vendor email"
              onChange={onChange}
              required
            />
            <p className="text-sm text-gray-600 mt-1">
              An OTP will be sent to this email for verification
            </p>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="inline-block animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Vendor'
              )}
            </button>
          </div>
        </form>
        
        <div className="text-center">
          <button
            onClick={() => navigate('/admin/users')}
            className="text-primary hover:underline"
          >
            Back to User Management
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorCreate;