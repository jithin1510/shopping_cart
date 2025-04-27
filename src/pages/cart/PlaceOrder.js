import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../../features/cart/cartSlice';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { cartItems, shippingAddress, paymentMethod } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  
  // Calculate prices
  const itemsPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
  const totalPrice = (itemsPrice + shippingPrice + taxPrice).toFixed(2);
  
  // Check if shipping address and payment method are set
  if (!shippingAddress.address) {
    navigate('/checkout');
    return null;
  }
  
  if (!paymentMethod) {
    navigate('/checkout');
    return null;
  }
  
  const placeOrderHandler = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      const orderItems = cartItems.map((item) => ({
        product: item.product,
        qty: item.qty,
      }));
      
      const orderData = {
        orderItems,
        shippingAddress,
        paymentMethod,
        taxPrice,
        shippingPrice,
        totalPrice,
      };
      
      const { data } = await axios.post('/api/orders', orderData, config);
      
      // Clear cart after successful order
      dispatch(clearCart());
      
      // Navigate to order details page
      navigate(`/order/${data.data.order._id}`);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Checkout Steps */}
        <div className="flex justify-between mb-8">
          <div className="flex-1 text-center pb-2 border-b-2 border-primary">
            <span className="font-medium text-primary">Shipping</span>
          </div>
          <div className="flex-1 text-center pb-2 border-b-2 border-primary">
            <span className="font-medium text-primary">Payment</span>
          </div>
          <div className="flex-1 text-center pb-2 border-b-2 border-primary">
            <span className="font-medium text-primary">Place Order</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shipping Information */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Shipping</h3>
              <p className="text-gray-700 mb-1">
                <strong>Address:</strong> {shippingAddress.address}, {shippingAddress.city}{' '}
                {shippingAddress.postalCode}, {shippingAddress.country}
              </p>
            </div>
            
            {/* Payment Information */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Payment Method</h3>
              <p className="text-gray-700 mb-1">
                <strong>Method:</strong> {paymentMethod}
              </p>
            </div>
          </div>
          
          <hr className="my-6" />
          
          {/* Order Items */}
          <h3 className="text-lg font-semibold mb-4">Order Items</h3>
          
          {cartItems.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-600">Your cart is empty</p>
              <Link
                to="/products"
                className="text-primary hover:underline mt-2 inline-block"
              >
                Go Shopping
              </Link>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <tr key={item.product}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 object-cover rounded"
                              src={item.image}
                              alt={item.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <Link
                              to={`/product/${item.product}`}
                              className="text-sm font-medium text-gray-900 hover:text-primary"
                            >
                              {item.name}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.qty}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${(item.price * item.qty).toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Order Summary */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Order Total</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Items:</span>
                <span>${itemsPrice.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>${shippingPrice.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${taxPrice.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span>${totalPrice}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <Link
              to="/checkout"
              className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors duration-300 flex items-center"
            >
              <FaArrowLeft className="mr-2" />
              Back
            </Link>
            
            <button
              type="button"
              className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary-dark transition-colors duration-300 flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={cartItems.length === 0 || isLoading}
              onClick={placeOrderHandler}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Place Order'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;