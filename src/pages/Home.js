import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getProducts } from '../features/product/productSlice';
import { FaArrowRight, FaSpinner } from 'react-icons/fa';
import ProductCard from '../components/products/ProductCard';

const Home = () => {
  const dispatch = useDispatch();
  const { products, isLoading, isError, message } = useSelector((state) => state.product);
  
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    // Fetch products with limit of 8 for featured section
    dispatch(getProducts({ limit: 8 }));
  }, [dispatch]);
  
  useEffect(() => {
    // Extract unique categories from products
    if (products.length > 0) {
      const uniqueCategories = [...new Set(products.map(product => product.category))];
      setCategories(uniqueCategories);
    }
  }, [products]);
  
  // Hero section with call to action
  const Hero = () => (
    <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-16 px-4 rounded-lg mb-12">
      <div className="container mx-auto">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Shop the Latest Products
          </h1>
          <p className="text-lg mb-8">
            Find everything you need at the best prices. Quality products delivered to your doorstep.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/products"
              className="bg-white text-primary font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition duration-300"
            >
              Shop Now
            </Link>
            <Link
              to="/register"
              className="bg-transparent border-2 border-white text-white font-bold py-3 px-6 rounded-lg hover:bg-white hover:text-primary transition duration-300"
            >
              Join Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Categories section
  const Categories = () => (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Shop by Category</h2>
        <Link to="/products" className="text-primary flex items-center hover:underline">
          View All <FaArrowRight className="ml-1" />
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.slice(0, 4).map((category, index) => (
          <Link 
            key={index} 
            to={`/search/${category}`}
            className="bg-gray-100 rounded-lg p-6 text-center hover:bg-gray-200 transition duration-300"
          >
            <div className="text-4xl mb-2">
              {/* Placeholder for category icon */}
              🛒
            </div>
            <h3 className="font-semibold text-lg">{category}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
  
  // Featured products section
  const FeaturedProducts = () => (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Featured Products</h2>
        <Link to="/products" className="text-primary flex items-center hover:underline">
          View All <FaArrowRight className="ml-1" />
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <FaSpinner className="animate-spin text-4xl text-primary" />
        </div>
      ) : isError ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {message}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
  
  // Promotional banner
  const PromoBanner = () => (
    <div className="bg-gray-100 rounded-lg p-8 mb-12 text-center">
      <h2 className="text-2xl font-bold mb-4">Become a Vendor</h2>
      <p className="text-gray-700 mb-6">
        Start selling your products on our platform and reach thousands of customers.
      </p>
      <Link
        to="/register"
        className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-dark transition duration-300"
      >
        Register Now
      </Link>
    </div>
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Hero />
      <Categories />
      <FeaturedProducts />
      <PromoBanner />
    </div>
  );
};

export default Home;