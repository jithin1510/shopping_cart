import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaArrowLeft, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const OrderDetails = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        
        const { data } = await axios.get(`/api/orders/${id}`, config);
        setOrder(data.data.order);
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
    
    if (user && id) {
      fetchOrder();
    }
  }, [id, user]);
  
  const handlePayment = async () => {
    try {
      setPaymentLoading(true);
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      // Simulate payment result
      const paymentResult = {
        id: Math.random().toString(36).substring(2, 15),
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        email_address: user.email,
      };
      
      const { data } = await axios.put(
        `/api/orders/${id}/pay`,
        paymentResult,
        config
      );
      
      setOrder(data.data.order);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Payment failed. Please try again.'
      );
    } finally {
      setPaymentLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link
          to="/profile"
          className="text-primary hover:underline flex items-center"
        >
          <FaArrowLeft className="mr-2" />
          Back to Profile
        </Link>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Order not found
        </div>
        <Link
          to="/profile"
          className="text-primary hover:underline flex items-center"
        >
          <FaArrowLeft className="mr-2" />
          Back to Profile
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Order #{order._id.substring(order._id.length - 8)}
          </h1>
          <Link
            to="/profile"
            className="text-primary hover:underline flex items-center"
          >
            <FaArrowLeft className="mr-2" />
            Back to Profile
          </Link>
        </div>
        
        {/* Order Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Order Status</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-8">
                    {order.isPaid ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaTimes className="text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Payment</p>
                    {order.isPaid ? (
                      <p className="text-sm text-gray-600">
                        Paid on {new Date(order.paidAt).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">Not paid</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8">
                    {order.isDelivered ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaTimes className="text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Delivery</p>
                    {order.isDelivered ? (
                      <p className="text-sm text-gray-600">
                        Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">Not delivered</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Order Info</h2>
              <p className="text-gray-700 mb-1">
                <strong>Date:</strong>{' '}
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Order ID:</strong> {order._id}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Payment Method:</strong> {order.paymentMethod}
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Shipping and Payment Info */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shipping Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Shipping</h3>
                  <p className="text-gray-700 mb-1">
                    <strong>Name:</strong> {order.user.name}
                  </p>
                  <p className="text-gray-700 mb-1">
                    <strong>Email:</strong> {order.user.email}
                  </p>
                  <p className="text-gray-700 mb-1">
                    <strong>Address:</strong> {order.shippingAddress.address},{' '}
                    {order.shippingAddress.city} {order.shippingAddress.postalCode},{' '}
                    {order.shippingAddress.country}
                  </p>
                </div>
                
                {/* Payment Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Payment</h3>
                  <p className="text-gray-700 mb-1">
                    <strong>Method:</strong> {order.paymentMethod}
                  </p>
                  {order.isPaid ? (
                    <p className="text-green-600 font-medium">
                      Paid on {new Date(order.paidAt).toLocaleDateString()}
                    </p>
                  ) : (
                    <p className="text-red-600 font-medium">Not Paid</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Order Items</h3>
              
              <div className="border rounded-lg overflow-hidden">
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
                    {order.orderItems.map((item) => (
                      <tr key={item._id}>
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
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>
                    $
                    {order.orderItems
                      .reduce((acc, item) => acc + item.price * item.qty, 0)
                      .toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>${order.shippingPrice.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${order.taxPrice.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between font-bold text-lg pt-3 border-t">
                  <span>Total:</span>
                  <span>${order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              {!order.isPaid && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handlePayment}
                    disabled={paymentLoading}
                    className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {paymentLoading ? (
                      <div className="flex items-center justify-center">
                        <FaSpinner className="animate-spin mr-2" />
                        Processing...
                      </div>
                    ) : (
                      'Pay Now'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;