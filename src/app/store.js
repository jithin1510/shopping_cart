import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import userReducer from '../features/user/userSlice';
import productReducer from '../features/product/productSlice';
import cartReducer from '../features/cart/cartSlice';
// import orderReducer from '../features/order/orderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    product: productReducer,
    cart: cartReducer,
    // order: orderReducer,
  },
});