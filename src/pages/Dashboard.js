import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaBoxOpen, FaClipboardList, FaUsers, FaShoppingBag, FaChartLine } from 'react-icons/fa';
import Sidebar from '../components/layout/Sidebar';
import CustomerDashboard from './dashboards/CustomerDashboard';
import VendorDashboard from './dashboards/VendorDashboard';
import AdminDashboard from './dashboards/AdminDashboard';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    if (!user) return null;
    
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'vendor':
        return <VendorDashboard />;
      case 'customer':
      default:
        return <CustomerDashboard />;
    }
  };
  
  if (!user) {
    return null; // Don't render anything if not authenticated
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="md:w-1/4">
          <Sidebar />
        </div>
        
        {/* Main Content */}
        <div className="md:w-3/4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold mb-6">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
            </h1>
            
            {renderDashboard()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;