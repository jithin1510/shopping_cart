import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Checkout from '../Checkout';
import { saveShippingAddress, savePaymentMethod } from '../../../features/cart/cartSlice';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock redux actions
jest.mock('../../../features/cart/cartSlice', () => ({
  saveShippingAddress: jest.fn(),
  savePaymentMethod: jest.fn(),
}));

const mockStore = configureStore([thunk]);

describe('Checkout Component', () => {
  let store;
  
  beforeEach(() => {
    store = mockStore({
      cart: {
        shippingAddress: {},
        paymentMethod: '',
      },
    });
    
    saveShippingAddress.mockImplementation(() => ({ type: 'TEST' }));
    savePaymentMethod.mockImplementation(() => ({ type: 'TEST' }));
  });
  
  test('renders shipping form initially', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Checkout />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getByText('Shipping Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Address')).toBeInTheDocument();
    expect(screen.getByLabelText('City')).toBeInTheDocument();
    expect(screen.getByLabelText('Postal Code')).toBeInTheDocument();
    expect(screen.getByLabelText('Country')).toBeInTheDocument();
  });
  
  test('validates shipping form', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Checkout />
        </BrowserRouter>
      </Provider>
    );
    
    // Submit empty form
    fireEvent.click(screen.getByText('Continue'));
    
    // Check for validation errors
    expect(screen.getByText('Address is required')).toBeInTheDocument();
    expect(screen.getByText('City is required')).toBeInTheDocument();
    expect(screen.getByText('Postal code is required')).toBeInTheDocument();
    expect(screen.getByText('Country is required')).toBeInTheDocument();
  });
  
  test('submits shipping form and moves to payment step', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Checkout />
        </BrowserRouter>
      </Provider>
    );
    
    // Fill out form
    fireEvent.change(screen.getByLabelText('Address'), {
      target: { value: '123 Test St' },
    });
    fireEvent.change(screen.getByLabelText('City'), {
      target: { value: 'Test City' },
    });
    fireEvent.change(screen.getByLabelText('Postal Code'), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByLabelText('Country'), {
      target: { value: 'Test Country' },
    });
    
    // Submit form
    fireEvent.click(screen.getByText('Continue'));
    
    // Check if saveShippingAddress was called with correct data
    expect(saveShippingAddress).toHaveBeenCalledWith({
      address: '123 Test St',
      city: 'Test City',
      postalCode: '12345',
      country: 'Test Country',
    });
    
    // Check if payment step is shown
    expect(screen.getByText('Payment Method')).toBeInTheDocument();
  });
  
  test('renders payment form after shipping step', () => {
    store = mockStore({
      cart: {
        shippingAddress: {
          address: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country',
        },
        paymentMethod: '',
      },
    });
    
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <Checkout />
        </BrowserRouter>
      </Provider>
    );
    
    // Fill out form
    fireEvent.change(screen.getByLabelText('Address'), {
      target: { value: '123 Test St' },
    });
    fireEvent.change(screen.getByLabelText('City'), {
      target: { value: 'Test City' },
    });
    fireEvent.change(screen.getByLabelText('Postal Code'), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByLabelText('Country'), {
      target: { value: 'Test Country' },
    });
    
    // Submit form
    fireEvent.click(screen.getByText('Continue'));
    
    // Check if payment step is shown
    expect(screen.getByText('Payment Method')).toBeInTheDocument();
    
    // Select payment method
    const paypalRadio = container.querySelector('input[value="PayPal"]');
    fireEvent.click(paypalRadio);
    
    // Submit payment form
    fireEvent.click(screen.getAllByText('Continue')[1]);
    
    // Check if savePaymentMethod was called with correct data
    expect(savePaymentMethod).toHaveBeenCalledWith('PayPal');
  });
});