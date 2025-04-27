import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ProductDetails from '../ProductDetails';
import { getProductById } from '../../../features/product/productSlice';
import { addToCart } from '../../../features/cart/cartSlice';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: '123',
  }),
  useNavigate: () => jest.fn(),
}));

// Mock redux actions
jest.mock('../../../features/product/productSlice', () => ({
  getProductById: jest.fn(),
  reset: jest.fn(),
}));

jest.mock('../../../features/cart/cartSlice', () => ({
  addToCart: jest.fn(),
}));

const mockStore = configureStore([thunk]);

describe('ProductDetails Component', () => {
  let store;
  
  beforeEach(() => {
    store = mockStore({
      product: {
        product: {
          data: {
            product: {
              _id: '123',
              name: 'Test Product',
              image: 'test.jpg',
              description: 'Test description',
              price: 99.99,
              countInStock: 5,
              rating: 4.5,
              numReviews: 10,
            },
          },
        },
        isLoading: false,
        isError: false,
        message: '',
      },
    });
    
    getProductById.mockImplementation(() => ({ type: 'TEST' }));
    addToCart.mockImplementation(() => ({ type: 'TEST' }));
  });
  
  test('renders product details correctly', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductDetails />
        </BrowserRouter>
      </Provider>
    );
    
    expect(getProductById).toHaveBeenCalledWith('123');
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('In Stock')).toBeInTheDocument();
    expect(screen.getByText('10 reviews')).toBeInTheDocument();
  });
  
  test('allows adding product to cart', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductDetails />
        </BrowserRouter>
      </Provider>
    );
    
    const addToCartButton = screen.getByText(/Add to Cart/i);
    fireEvent.click(addToCartButton);
    
    expect(addToCart).toHaveBeenCalledWith({
      product: '123',
      name: 'Test Product',
      image: 'test.jpg',
      price: 99.99,
      countInStock: 5,
      qty: 1,
    });
  });
  
  test('displays loading state', () => {
    store = mockStore({
      product: {
        product: null,
        isLoading: true,
        isError: false,
        message: '',
      },
    });
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductDetails />
        </BrowserRouter>
      </Provider>
    );
    
    expect(getProductById).toHaveBeenCalledWith('123');
    expect(screen.queryByText('Test Product')).not.toBeInTheDocument();
  });
  
  test('displays error message', () => {
    store = mockStore({
      product: {
        product: null,
        isLoading: false,
        isError: true,
        message: 'Failed to load product',
      },
    });
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductDetails />
        </BrowserRouter>
      </Provider>
    );
    
    expect(getProductById).toHaveBeenCalledWith('123');
    expect(screen.getByText('Failed to load product')).toBeInTheDocument();
  });
  
  test('handles out of stock products', () => {
    store = mockStore({
      product: {
        product: {
          data: {
            product: {
              _id: '123',
              name: 'Test Product',
              image: 'test.jpg',
              description: 'Test description',
              price: 99.99,
              countInStock: 0,
              rating: 4.5,
              numReviews: 10,
            },
          },
        },
        isLoading: false,
        isError: false,
        message: '',
      },
    });
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductDetails />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    const addToCartButton = screen.getByText('Out of Stock');
    expect(addToCartButton).toBeDisabled();
  });
});