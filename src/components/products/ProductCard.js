import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../features/cart/cartSlice';
import { FaStar, FaShoppingCart } from 'react-icons/fa';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  
  const addToCartHandler = () => {
    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        countInStock: product.countInStock,
        qty: 1,
      })
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/product/${product._id}`}>
        <div className="h-48 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
            }}
          />
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <h3 className="font-semibold text-lg mb-1 hover:text-primary truncate">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400 mr-1">
            {[...Array(5)].map((_, index) => (
              <FaStar
                key={index}
                className={
                  index < Math.floor(product.rating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }
              />
            ))}
          </div>
          <span className="text-gray-600 text-sm">
            ({product.numReviews} reviews)
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-bold text-xl">${product.price.toFixed(2)}</span>
          
          <button
            onClick={addToCartHandler}
            className="bg-primary text-white p-2 rounded-full hover:bg-primary-dark transition-colors duration-300"
            disabled={product.countInStock === 0}
          >
            <FaShoppingCart />
          </button>
        </div>
        
        {product.countInStock === 0 && (
          <div className="mt-2 text-red-600 text-sm">Out of stock</div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;