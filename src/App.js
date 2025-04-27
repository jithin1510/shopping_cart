import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loadUser } from './features/auth/authSlice';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ProductDetails from './pages/products/ProductDetails';
import Cart from './pages/cart/Cart';
import Checkout from './pages/cart/Checkout';
import PlaceOrder from './pages/cart/PlaceOrder';
// import OrderDetails from './pages/cart/OrderDetails';
// import Profile from './pages/user/Profile';
import PrivateRoute from './components/routing/PrivateRoute';
import RoleRoute from './components/routing/RoleRoute';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/products/ProductList';
import ProductCreate from './pages/products/ProductCreate';
import ProductEdit from './pages/products/ProductEdit';
// import OrderList from './pages/orders/OrderList';
// import AdminOrderDetails from './pages/orders/OrderDetails';
import UserList from './pages/admin/UserList';
import VendorCreate from './pages/admin/VendorCreate';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <Router>
      <Header />
      <main className="py-3">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/search/:keyword" element={<ProductList />} />
          <Route path="/products" element={<ProductList />} />
          
          {/* Private Routes */}
          {/* <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} /> */}
          <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
          <Route path="/place-order" element={<PrivateRoute><PlaceOrder /></PrivateRoute>} />
          {/* <Route path="/order/:id" element={<PrivateRoute><OrderDetails /></PrivateRoute>} /> */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          {/* <Route path="/orders" element={<PrivateRoute><OrderList /></PrivateRoute>} /> */}
          
          {/* Customer Routes */}
          <Route path="/product/create" element={
            <RoleRoute roles={['customer', 'vendor']}>
              <ProductCreate />
            </RoleRoute>
          } />
          
          {/* Vendor Routes */}
          <Route path="/vendor/products" element={
            <RoleRoute roles={['vendor']}>
              <ProductList isVendor={true} />
            </RoleRoute>
          } />
          <Route path="/product/:id/edit" element={
            <RoleRoute roles={['vendor']}>
              <ProductEdit />
            </RoleRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/users" element={
            <RoleRoute roles={['admin']}>
              <UserList />
            </RoleRoute>
          } />
          <Route path="/admin/vendors/create" element={
            <RoleRoute roles={['admin']}>
              <VendorCreate />
            </RoleRoute>
          } />
          <Route path="/admin/orders" element={
            <RoleRoute roles={['admin']}>
              {/* <OrderList isAdmin={true} /> */}
            </RoleRoute>
          } />
          <Route path="/admin/order/:id" element={
            <RoleRoute roles={['admin']}>
              {/* <AdminOrderDetails /> */}
            </RoleRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;


