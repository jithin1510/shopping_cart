import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveShippingAddress, savePaymentMethod } from '../../features/cart/cartSlice';
import { FaArrowRight, FaArrowLeft, FaCreditCard, FaPaypal } from 'react-icons/fa';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { shippingAddress, paymentMethod: savedPaymentMethod } = useSelector((state) => state.cart);
  
  // Form state
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment
  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
  const [country, setCountry] = useState(shippingAddress.country || '');
  const [paymentMethod, setPaymentMethod] = useState(savedPaymentMethod || 'PayPal');
  
  // Form validation
  const [errors, setErrors] = useState({});
  
  const validateShippingForm = () => {
    const newErrors = {};
    
    if (!address.trim()) newErrors.address = 'Address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!country.trim()) newErrors.country = 'Country is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleShippingSubmit = (e) => {
    e.preventDefault();
    
    if (validateShippingForm()) {
      dispatch(
        saveShippingAddress({
          address,
          city,
          postalCode,
          country,
        })
      );
      setStep(2);
    }
  };
  
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    
    dispatch(savePaymentMethod(paymentMethod));
    navigate('/place-order');
  };
  
  const goBack = () => {
    if (step === 1) {
      navigate('/cart');
    } else {
      setStep(1);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Checkout Steps */}
        <div className="flex justify-between mb-8">
          <div className={`flex-1 text-center pb-2 ${step >= 1 ? 'border-b-2 border-primary' : 'border-b-2 border-gray-300'}`}>
            <span className={`font-medium ${step >= 1 ? 'text-primary' : 'text-gray-500'}`}>
              Shipping
            </span>
          </div>
          <div className={`flex-1 text-center pb-2 ${step >= 2 ? 'border-b-2 border-primary' : 'border-b-2 border-gray-300'}`}>
            <span className={`font-medium ${step >= 2 ? 'text-primary' : 'text-gray-500'}`}>
              Payment
            </span>
          </div>
          <div className="flex-1 text-center pb-2 border-b-2 border-gray-300">
            <span className="font-medium text-gray-500">Place Order</span>
          </div>
        </div>
        
        {/* Shipping Form */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Shipping Address</h2>
            
            <form onSubmit={handleShippingSubmit}>
              <div className="mb-4">
                <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full border rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-primary focus:border-primary ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter address"
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="city" className="block text-gray-700 text-sm font-bold mb-2">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`w-full border rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-primary focus:border-primary ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter city"
                />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="postalCode" className="block text-gray-700 text-sm font-bold mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className={`w-full border rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-primary focus:border-primary ${
                    errors.postalCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter postal code"
                />
                {errors.postalCode && (
                  <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>
                )}
              </div>
              
              <div className="mb-6">
                <label htmlFor="country" className="block text-gray-700 text-sm font-bold mb-2">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={`w-full border rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-primary focus:border-primary ${
                    errors.country ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter country"
                />
                {errors.country && (
                  <p className="text-red-500 text-xs mt-1">{errors.country}</p>
                )}
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors duration-300 flex items-center"
                >
                  <FaArrowLeft className="mr-2" />
                  Back to Cart
                </button>
                
                <button
                  type="submit"
                  className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors duration-300 flex items-center"
                >
                  Continue
                  <FaArrowRight className="ml-2" />
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Payment Form */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Payment Method</h2>
            
            <form onSubmit={handlePaymentSubmit}>
              <div className="mb-6">
                <div className="mb-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="PayPal"
                      checked={paymentMethod === 'PayPal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <span className="ml-2 flex items-center">
                      <FaPaypal className="text-blue-600 mr-2" />
                      PayPal or Credit Card
                    </span>
                  </label>
                </div>
                
                <div className="mb-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CreditCard"
                      checked={paymentMethod === 'CreditCard'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <span className="ml-2 flex items-center">
                      <FaCreditCard className="text-gray-600 mr-2" />
                      Credit Card
                    </span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors duration-300 flex items-center"
                >
                  <FaArrowLeft className="mr-2" />
                  Back to Shipping
                </button>
                
                <button
                  type="submit"
                  className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors duration-300 flex items-center"
                >
                  Continue
                  <FaArrowRight className="ml-2" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;