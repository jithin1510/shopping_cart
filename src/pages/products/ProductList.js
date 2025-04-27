import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getProducts, getVendorProducts, deleteProduct } from '../../features/product/productSlice';
import ProductCard from '../../components/products/ProductCard';
import { FaSpinner, FaFilter, FaSort, FaSearch, FaTrash, FaEdit, FaPlus } from 'react-icons/fa';

const ProductList = ({ isVendor = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { keyword } = useParams();
  
  const { products, page, pages, isLoading, isError, message } = useSelector(
    (state) => state.product
  );
  
  // Filter and sort state
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    inStock: false
  });
  
  const [sortOption, setSortOption] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState(keyword || '');
  
  // Get query params
  const queryParams = new URLSearchParams(location.search);
  const pageNumber = queryParams.get('page') || 1;
  
  useEffect(() => {
    if (isVendor) {
      dispatch(getVendorProducts());
    } else {
      const params = {
        keyword,
        page: pageNumber,
        sort: getSortParam(sortOption)
      };
      
      // Add filters to params if they exist
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.inStock) params.inStock = true;
      
      dispatch(getProducts(params));
    }
  }, [dispatch, keyword, pageNumber, isVendor, sortOption, filters]);
  
  // Convert sort option to API parameter
  const getSortParam = (option) => {
    switch (option) {
      case 'priceAsc':
        return 'price';
      case 'priceDesc':
        return '-price';
      case 'nameAsc':
        return 'name';
      case 'nameDesc':
        return '-name';
      case 'newest':
      default:
        return '-createdAt';
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/search/${searchKeyword}`);
    } else {
      navigate('/products');
    }
  };
  
  const handleDeleteProduct = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id));
    }
  };
  
  const handleEditProduct = (id) => {
    navigate(`/product/${id}/edit`);
  };
  
  const handleAddProduct = () => {
    navigate('/product/create');
  };
  
  // Categories for filter
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
  
  // Pagination component
  const Pagination = () => {
    return (
      <div className="flex justify-center mt-8">
        <nav className="inline-flex rounded-md shadow">
          {[...Array(pages).keys()].map((x) => (
            <button
              key={x + 1}
              onClick={() => {
                const searchParams = new URLSearchParams(location.search);
                searchParams.set('page', x + 1);
                navigate({
                  pathname: keyword ? `/search/${keyword}` : '/products',
                  search: searchParams.toString()
                });
              }}
              className={`px-4 py-2 border ${
                Number(pageNumber) === x + 1
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {x + 1}
            </button>
          ))}
        </nav>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
          {isVendor ? 'My Products' : keyword ? `Search: ${keyword}` : 'All Products'}
        </h1>
        
        {isVendor && (
          <button
            onClick={handleAddProduct}
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-primary-dark transition-colors duration-300"
          >
            <FaPlus className="mr-2" /> Add Product
          </button>
        )}
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <FaFilter />
              </button>
            </div>
            
            <div className={`${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full border rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Price Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="Min"
                    className="w-1/2 border rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-primary focus:border-primary"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="Max"
                    className="w-1/2 border rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="inStock"
                    checked={filters.inStock}
                    onChange={handleFilterChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700">In Stock Only</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Sort Options */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FaSort className="text-gray-500 mr-2" />
              <h2 className="text-lg font-semibold">Sort By</h2>
            </div>
            
            <select
              value={sortOption}
              onChange={handleSortChange}
              className="w-full border rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value="newest">Newest</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="nameAsc">Name: A to Z</option>
              <option value="nameDesc">Name: Z to A</option>
            </select>
          </div>
        </div>
        
        {/* Product Grid */}
        <div className="lg:w-3/4">
          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search products..."
                className="flex-grow border rounded-l-md py-2 px-4 text-gray-700 focus:outline-none focus:ring-primary focus:border-primary"
              />
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary-dark transition-colors duration-300"
              >
                <FaSearch />
              </button>
            </form>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="animate-spin text-4xl text-primary" />
            </div>
          ) : isError ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {message}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-xl text-gray-600 mb-4">No products found</p>
              {isVendor && (
                <button
                  onClick={handleAddProduct}
                  className="bg-primary text-white px-4 py-2 rounded-lg flex items-center mx-auto hover:bg-primary-dark transition-colors duration-300"
                >
                  <FaPlus className="mr-2" /> Add Your First Product
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {isVendor
                  ? products.map((product) => (
                      <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
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
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-1 truncate">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 mb-2 truncate">
                            {product.description}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xl">${product.price.toFixed(2)}</span>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditProduct(product._id)}
                                className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product._id)}
                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  : products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
              </div>
              
              {pages > 1 && <Pagination />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;