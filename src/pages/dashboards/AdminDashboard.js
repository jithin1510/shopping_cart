import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaUsers, FaBoxOpen, FaClipboardList, FaChartLine, FaUserPlus, FaStore } from 'react-icons/fa';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  
  // In a real application, these would come from API calls
  const [stats, setStats] = useState({
    totalUsers: 120,
    totalProducts: 450,
    totalOrders: 89,
    totalRevenue: 12580,
    pendingOrders: 14,
    newUsers: 8
  });
  
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
          Here's an overview of your platform's performance.
        </p>
      </div>
      
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<FaUsers className="text-blue-500" size={24} />}
          color="blue"
          link="/admin/users"
        />
        
        <DashboardCard
          title="Total Products"
          value={stats.totalProducts}
          icon={<FaBoxOpen className="text-green-500" size={24} />}
          color="green"
          link="/products"
        />
        
        <DashboardCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<FaClipboardList className="text-purple-500" size={24} />}
          color="purple"
          link="/admin/orders"
        />
        
        <DashboardCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          icon={<FaChartLine className="text-yellow-500" size={24} />}
          color="yellow"
          link="/admin/orders"
        />
        
        <DashboardCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={<FaClipboardList className="text-red-500" size={24} />}
          color="red"
          link="/admin/orders"
        />
        
        <DashboardCard
          title="New Users"
          value={stats.newUsers}
          icon={<FaUserPlus className="text-indigo-500" size={24} />}
          color="indigo"
          link="/admin/users"
        />
      </div>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/users"
            className="bg-primary text-white p-4 rounded-lg flex items-center justify-center hover:bg-primary-dark transition-colors duration-300"
          >
            <FaUsers className="mr-2" /> Manage Users
          </Link>
          <Link
            to="/admin/vendors/create"
            className="bg-secondary text-white p-4 rounded-lg flex items-center justify-center hover:bg-secondary-dark transition-colors duration-300"
          >
            <FaStore className="mr-2" /> Create Vendor
          </Link>
          <Link
            to="/admin/orders"
            className="bg-gray-700 text-white p-4 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors duration-300"
          >
            <FaClipboardList className="mr-2" /> View Orders
          </Link>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-4">
                  <FaUsers className="text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">New user registered</p>
                  <p className="text-gray-500 text-sm">John Doe registered as a new customer</p>
                  <p className="text-gray-400 text-xs mt-1">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-full mr-4">
                  <FaBoxOpen className="text-green-500" />
                </div>
                <div>
                  <p className="font-medium">New product added</p>
                  <p className="text-gray-500 text-sm">Vendor added "Wireless Headphones"</p>
                  <p className="text-gray-400 text-xs mt-1">4 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-purple-100 p-2 rounded-full mr-4">
                  <FaClipboardList className="text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">New order placed</p>
                  <p className="text-gray-500 text-sm">Order #12345 was placed for $129.99</p>
                  <p className="text-gray-400 text-xs mt-1">6 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-yellow-100 p-2 rounded-full mr-4">
                  <FaStore className="text-yellow-500" />
                </div>
                <div>
                  <p className="font-medium">New vendor approved</p>
                  <p className="text-gray-500 text-sm">Tech Gadgets Inc. was approved as a vendor</p>
                  <p className="text-gray-400 text-xs mt-1">1 day ago</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Link to="/admin/activity" className="text-primary hover:underline">
                View All Activity
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;