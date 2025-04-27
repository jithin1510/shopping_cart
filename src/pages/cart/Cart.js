import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../../features/cart/cartSlice';
import { FaTrash, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  
  // Calculate prices
  const itemsPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
  const totalPrice = (itemsPrice + shippingPrice + taxPrice).toFixed(2);
  
  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };
  
  const checkoutHandler = () => {
    if (!user) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };
  
  const updateQtyHandler = (item, qty) => {
    const newQty = Number(qty);
    if (newQty > 0 && newQty <= item.countInStock) {
      dispatch(
        addToCart({
          ...item,
          qty: newQty,
        })
      );
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FaShoppingCart className="mx-auto text-5xl text-gray-400 mb-4" />
          <p className="text-xl text-gray-600 mb-6">Your cart is empty</p>
          <Link
            to="/products"
            className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition-colors duration-300"
          >
            <FaArrowLeft className="inline-block mr-2" />
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <tr key={item.product}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-16 w-16 flex-shrink-0">
                            <img
                              className="h-16 w-16 object-cover rounded"
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
                        <div className="text-sm text-gray-900">
                          ${item.price.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={item.qty}
                          onChange={(e) =>
                            updateQtyHandler(item, Number(e.target.value))
                          }
                          className="block w-20 bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        >
                          {[...Array(item.countInStock).keys()].map((x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${(item.price * item.qty).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => removeFromCartHandler(item.product)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4">
              <Link
                to="/products"
                className="text-primary hover:underline flex items-center"
              >
                <FaArrowLeft className="mr-2" />
                Continue Shopping
              </Link>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-4">
                  <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)</span>
                  <span>${itemsPrice.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between border-b pb-4">
                  <span>Shipping</span>
                  <span>${shippingPrice.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between border-b pb-4">
                  <span>Tax</span>
                  <span>${taxPrice.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${totalPrice}</span>
                </div>
              </div>
              
              <button
                type="button"
                className="mt-6 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors duration-300"
                disabled={cartItems.length === 0}
                onClick={checkoutHandler}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;