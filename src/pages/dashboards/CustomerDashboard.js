import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaShoppingBag, FaClipboardList, FaUser, FaShoppingCart } from 'react-icons/fa';

const CustomerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  
  // Dashboard card component
  const DashboardCard = ({ title, value, icon, color, link }) => (
    <Link to={link} className="block">
      <div className={`bg-${color}-100 border-l-4 border-${color}-500 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300`}>
        <div className="flex items-center">
          <div className={`rounded-full bg-${color}-200 p-3 mr-4`}>
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </div>
    </Link>
  );
  
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Welcome back, {user.name}!</h2>
        <p className="text-gray-600">
          Here's an overview of your activity and recent orders.
        </p>
      </div>
      
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <DashboardCard
          title="My Orders"
          value="View Orders"
          icon={<FaClipboardList className="text-blue-500" size={24} />}
          color="blue"
          link="/orders"
        />
        
        <DashboardCard
          title="Shopping Cart"
          value={`${cartItems.length} Items`}
          icon={<FaShoppingCart className="text-green-500" size={24} />}
          color="green"
          link="/cart"
        />
        
        <DashboardCard
          title="Browse Products"
          value="Shop Now"
          icon={<FaShoppingBag className="text-purple-500" size={24} />}
          color="purple"
          link="/products"
        />
        
        <DashboardCard
          title="My Profile"
          value="Update Info"
          icon={<FaUser className="text-yellow-500" size={24} />}
          color="yellow"
          link="/profile"
        />
      </div>
      
      {/* Recent Orders Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <Link to="/orders" className="text-primary hover:underline">
            View All
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 text-center text-gray-500">
            <FaClipboardList className="mx-auto text-4xl mb-4 text-gray-400" />
            <p>Your recent orders will appear here</p>
            <Link
              to="/products"
              className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
      
      {/* Featured Products Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recommended for You</h2>
          <Link to="/products" className="text-primary hover:underline">
            View All
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 text-center text-gray-500">
            <FaShoppingBag className="mx-auto text-4xl mb-4 text-gray-400" />
            <p>Personalized recommendations will appear here</p>
            <Link
              to="/products"
              className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
            >
              Explore Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;