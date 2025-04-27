import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FaHome, 
  FaShoppingBag, 
  FaClipboardList, 
  FaUser, 
  FaUsers, 
  FaPlus, 
  FaStore,
  FaBoxOpen,
  FaCog
} from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  
  // Check if the current path matches the link
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  // Base class for all links
  const linkClass = "flex items-center py-3 px-4 rounded-lg";
  
  // Active link class
  const activeLinkClass = `${linkClass} bg-primary text-white`;
  
  // Inactive link class
  const inactiveLinkClass = `${linkClass} hover:bg-gray-200`;
  
  return (
    <div className="bg-white shadow-md rounded-lg p-4 h-full">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-600">Welcome, {user?.name}</p>
      </div>
      
      <nav className="space-y-2">
        {/* Common links for all users */}
        <Link
          to="/dashboard"
          className={isActive('/dashboard') ? activeLinkClass : inactiveLinkClass}
        >
          <FaHome className="mr-3" />
          Dashboard
        </Link>
        
        <Link
          to="/profile"
          className={isActive('/profile') ? activeLinkClass : inactiveLinkClass}
        >
          <FaUser className="mr-3" />
          Profile
        </Link>
        
        <Link
          to="/orders"
          className={isActive('/orders') ? activeLinkClass : inactiveLinkClass}
        >
          <FaClipboardList className="mr-3" />
          My Orders
        </Link>
        
        {/* Vendor specific links */}
        {user && (user.role === 'vendor' || user.role === 'admin') && (
          <>
            <div className="pt-4 border-t border-gray-200 mt-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Vendor</h3>
            </div>
            
            <Link
              to="/vendor/products"
              className={isActive('/vendor/products') ? activeLinkClass : inactiveLinkClass}
            >
              <FaBoxOpen className="mr-3" />
              My Products
            </Link>
            
            <Link
              to="/product/create"
              className={isActive('/product/create') ? activeLinkClass : inactiveLinkClass}
            >
              <FaPlus className="mr-3" />
              Add Product
            </Link>
            
            <Link
              to="/vendor/orders"
              className={isActive('/vendor/orders') ? activeLinkClass : inactiveLinkClass}
            >
              <FaShoppingBag className="mr-3" />
              Orders
            </Link>
          </>
        )}
        
        {/* Admin specific links */}
        {user && user.role === 'admin' && (
          <>
            <div className="pt-4 border-t border-gray-200 mt-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Admin</h3>
            </div>
            
            <Link
              to="/admin/users"
              className={isActive('/admin/users') ? activeLinkClass : inactiveLinkClass}
            >
              <FaUsers className="mr-3" />
              Users
            </Link>
            
            <Link
              to="/admin/vendors/create"
              className={isActive('/admin/vendors/create') ? activeLinkClass : inactiveLinkClass}
            >
              <FaStore className="mr-3" />
              Create Vendor
            </Link>
            
            <Link
              to="/admin/orders"
              className={isActive('/admin/orders') ? activeLinkClass : inactiveLinkClass}
            >
              <FaClipboardList className="mr-3" />
              All Orders
            </Link>
            
            <Link
              to="/admin/settings"
              className={isActive('/admin/settings') ? activeLinkClass : inactiveLinkClass}
            >
              <FaCog className="mr-3" />
              Settings
            </Link>
          </>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;