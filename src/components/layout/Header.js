import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaSearch, FaBars } from 'react-icons/fa';

const Header = () => {
  const [keyword, setKeyword] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  
  const logoutHandler = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search/${keyword}`);
    } else {
      navigate('/');
    }
  };
  
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };
  
  return (
    <header className="bg-primary text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold">E-Shop</Link>
          
          {/* Search Form */}
          <form onSubmit={submitHandler} className="hidden md:flex">
            <div className="flex">
              <input
                type="text"
                name="keyword"
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search Products..."
                className="px-4 py-2 rounded-l text-black"
              />
              <button
                type="submit"
                className="bg-secondary px-4 py-2 rounded-r hover:bg-opacity-90"
              >
                <FaSearch />
              </button>
            </div>
          </form>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white"
            onClick={toggleMobileMenu}
          >
            <FaBars size={24} />
          </button>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/cart" className="flex items-center">
              <FaShoppingCart className="mr-1" />
              Cart
              {cartItems.length > 0 && (
                <span className="ml-1 bg-secondary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="relative group">
                <button className="flex items-center">
                  <FaUser className="mr-1" />
                  {user.name}
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  {user.role === 'vendor' && (
                    <Link
                      to="/vendor/products"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      My Products
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link
                      to="/admin/users"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      Users
                    </Link>
                  )}
                  <button
                    onClick={logoutHandler}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    <FaSignOutAlt className="inline mr-1" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="flex items-center">
                <FaUser className="mr-1" />
                Sign In
              </Link>
            )}
          </nav>
        </div>
        
        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden mt-4">
            <form onSubmit={submitHandler} className="mb-4">
              <div className="flex">
                <input
                  type="text"
                  name="keyword"
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search Products..."
                  className="px-4 py-2 rounded-l text-black w-full"
                />
                <button
                  type="submit"
                  className="bg-secondary px-4 py-2 rounded-r hover:bg-opacity-90"
                >
                  <FaSearch />
                </button>
              </div>
            </form>
            
            <nav className="flex flex-col space-y-2">
              <Link to="/cart" className="flex items-center py-2">
                <FaShoppingCart className="mr-1" />
                Cart
                {cartItems.length > 0 && (
                  <span className="ml-1 bg-secondary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                  </span>
                )}
              </Link>
              
              {user ? (
                <>
                  <Link to="/dashboard" className="py-2">
                    Dashboard
                  </Link>
                  <Link to="/profile" className="py-2">
                    Profile
                  </Link>
                  {user.role === 'vendor' && (
                    <Link to="/vendor/products" className="py-2">
                      My Products
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin/users" className="py-2">
                      Users
                    </Link>
                  )}
                  <button
                    onClick={logoutHandler}
                    className="flex items-center py-2"
                  >
                    <FaSignOutAlt className="mr-1" />
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="flex items-center py-2">
                  <FaUser className="mr-1" />
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;