import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, reset } from '../../features/auth/authSlice';
import { FaUser, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const { name, email, password, confirmPassword } = formData;
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );
  
  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    
    // Redirect to verify email page after successful registration
    if (isSuccess) {
      toast.success('Registration successful! Please verify your email.');
      navigate('/verify-email', { state: { email } });
    }
    
    // If user is already logged in and verified, redirect to dashboard
    if (user && user.isVerified) {
      navigate('/dashboard');
    }
    
    return () => {
      dispatch(reset());
    };
  }, [user, isError, isSuccess, message, navigate, dispatch, email]);
  
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };
  
  const onSubmit = (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
    } else {
      const userData = {
        name,
        email,
        password,
      };
      
      dispatch(register(userData));
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            <FaUser className="inline-block mr-2" />
            Register
          </h1>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>
        
        {isError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="name"
            >
              Full Name
            </label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              name="name"
              value={name}
              placeholder="Enter your full name"
              onChange={onChange}
              required
            />
          </div>
          
          <div className="mb-4">
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
              placeholder="Enter your email"
              onChange={onChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              name="password"
              value={password}
              placeholder="Enter your password"
              onChange={onChange}
              required
              minLength="6"
            />
          </div>
          
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              type="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              placeholder="Confirm your password"
              onChange={onChange}
              required
              minLength="6"
            />
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
                  Registering...
                </>
              ) : (
                'Register'
              )}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;