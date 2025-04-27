import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductById, reset } from '../../features/product/productSlice';
import { addToCart } from '../../features/cart/cartSlice';
import { FaArrowLeft, FaStar, FaShoppingCart, FaSpinner } from 'react-icons/fa';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [qty, setQty] = useState(1);
  
  const { product, isLoading, isError, message } = useSelector(
    (state) => state.product
  );
  
  useEffect(() => {
    dispatch(getProductById(id));
    
    return () => {
      dispatch(reset());
    };
  }, [dispatch, id]);
  
  const addToCartHandler = () => {
    dispatch(
      addToCart({
        product: product.data.product._id,
        name: product.data.product.name,
        image: product.data.product.image,
        price: product.data.product.price,
        countInStock: product.data.product.countInStock,
        qty,
      })
    );
    navigate('/cart');
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-primary" />
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
        <Link
          to="/products"
          className="text-primary hover:underline flex items-center"
        >
          <FaArrowLeft className="mr-2" />
          Back to Products
        </Link>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-primary" />
      </div>
    );
  }
  
  const productData = product.data.product;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/products"
        className="text-primary hover:underline flex items-center mb-6"
      >
        <FaArrowLeft className="mr-2" />
        Back to Products
      </Link>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Product Image */}
          <div className="md:w-1/2">
            <img
              src={productData.image}
              alt={productData.name}
              className="w-full h-96 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
              }}
            />
          </div>
          
          {/* Product Details */}
          <div className="md:w-1/2 p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {productData.name}
            </h1>
            
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400 mr-2">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={
                      index < Math.floor(productData.rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {productData.numReviews} reviews
              </span>
            </div>
            
            <div className="border-t border-b py-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">Price:</span>
                <span className="text-2xl font-bold text-gray-800">
                  ${productData.price.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Status:</span>
                <span
                  className={
                    productData.countInStock > 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                >
                  {productData.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{productData.description}</p>
            </div>
            
            {productData.countInStock > 0 && (
              <div className="mb-6">
                <div className="flex items-center">
                  <span className="mr-4 text-gray-700">Quantity:</span>
                  <select
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="block bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  >
                    {[...Array(productData.countInStock).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>
                        {x + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            <button
              onClick={addToCartHandler}
              disabled={productData.countInStock === 0}
              className={`w-full py-3 px-6 rounded-md flex items-center justify-center ${
                productData.countInStock === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-dark'
              } transition-colors duration-300`}
            >
              <FaShoppingCart className="mr-2" />
              {productData.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;