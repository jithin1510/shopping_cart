import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getVendorProducts } from '../../features/product/productSlice';
import { FaBoxOpen, FaClipboardList, FaPlus, FaChartLine, FaSpinner } from 'react-icons/fa';

const VendorDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { products, isLoading } = useSelector((state) => state.product);
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    outOfStock: 0,
    totalSales: 0,
    pendingOrders: 0
  });
  
  useEffect(() => {
    dispatch(getVendorProducts());
  }, [dispatch]);
  
  useEffect(() => {
    if (products.length > 0) {
      const outOfStock = products.filter(product => product.countInStock === 0).length;
      
      setStats({
        totalProducts: products.length,
        outOfStock,
        totalSales: 0, // This would come from an API call in a real app
        pendingOrders: 0 // This would come from an API call in a real app
      });
    }
  }, [products]);
  
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
          Here's an overview of your store performance and products.
        </p>
      </div>
      
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <DashboardCard
          title="Total Products"
          value={stats.totalProducts}
          icon={<FaBoxOpen className="text-blue-500" size={24} />}
          color="blue"
          link="/vendor/products"
        />
        
        <DashboardCard
          title="Out of Stock"
          value={stats.outOfStock}
          icon={<FaBoxOpen className="text-red-500" size={24} />}
          color="red"
          link="/vendor/products"
        />
        
        <DashboardCard
          title="Total Sales"
          value={`$${stats.totalSales.toFixed(2)}`}
          icon={<FaChartLine className="text-green-500" size={24} />}
          color="green"
          link="/vendor/orders"
        />
        
        <DashboardCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={<FaClipboardList className="text-yellow-500" size={24} />}
          color="yellow"
          link="/vendor/orders"
        />
      </div>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/product/create"
            className="bg-primary text-white p-4 rounded-lg flex items-center justify-center hover:bg-primary-dark transition-colors duration-300"
          >
            <FaPlus className="mr-2" /> Add New Product
          </Link>
          <Link
            to="/vendor/products"
            className="bg-secondary text-white p-4 rounded-lg flex items-center justify-center hover:bg-secondary-dark transition-colors duration-300"
          >
            <FaBoxOpen className="mr-2" /> Manage Inventory
          </Link>
        </div>
      </div>
      
      {/* Recent Products */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Products</h2>
          <Link to="/vendor/products" className="text-primary hover:underline">
            View All
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <FaSpinner className="animate-spin text-4xl text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 text-center text-gray-500">
              <FaBoxOpen className="mx-auto text-4xl mb-4 text-gray-400" />
              <p>You haven't added any products yet</p>
              <Link
                to="/product/create"
                className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
              >
                Add Your First Product
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
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
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.slice(0, 5).map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={product.image}
                            alt={product.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/40x40?text=No+Image';
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${product.price.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.countInStock > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.countInStock > 0
                          ? `${product.countInStock} in stock`
                          : 'Out of stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/product/${product._id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/product/${product._id}`}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;