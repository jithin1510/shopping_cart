const mongoose = require('mongoose');
const request = require('supertest');
const { app } = require('../server');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

// Mock jwt.verify
jest.mock('jsonwebtoken');

describe('Order Controller', () => {
  let vendorToken, customerToken, adminToken;
  let vendor, customer, admin;
  let product1, product2;
  
  beforeAll(async () => {
    // Connect to test database
    try {
      await mongoose.connect(process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/test-shopping-cart', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
      });
      console.log('Connected to test database');
      
      // Create test users
      vendor = await User.create({
        name: 'Test Vendor',
        email: 'vendor@example.com',
        password: 'password123',
        role: 'vendor',
        isVerified: true
      });
      
      customer = await User.create({
        name: 'Test Customer',
        email: 'customer@example.com',
        password: 'password123',
        role: 'customer',
        isVerified: true
      });
      
      admin = await User.create({
        name: 'Test Admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        isVerified: true
      });
      
      // Generate tokens
      vendorToken = `Bearer ${vendor.getSignedJwtToken()}`;
      customerToken = `Bearer ${customer.getSignedJwtToken()}`;
      adminToken = `Bearer ${admin.getSignedJwtToken()}`;
      
      // Mock jwt.verify to return the appropriate user
      jwt.verify.mockImplementation((token, secret) => {
        if (token === vendorToken.split(' ')[1]) {
          return { id: vendor._id, role: 'vendor' };
        } else if (token === customerToken.split(' ')[1]) {
          return { id: customer._id, role: 'customer' };
        } else if (token === adminToken.split(' ')[1]) {
          return { id: admin._id, role: 'admin' };
        }
        throw new Error('Invalid token');
      });
    } catch (error) {
      console.error(`Error connecting to test database: ${error.message}`);
      throw new Error(`Failed to connect to test database: ${error.message}`);
    }
  });

  afterAll(async () => {
    // Disconnect from test database
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear the products and orders collections before each test
    await Product.deleteMany({});
    await Order.deleteMany({});
    
    // Create test products
    product1 = await Product.create({
      name: 'Test Product 1',
      description: 'Description for test product 1',
      price: 19.99,
      category: 'Electronics',
      countInStock: 10,
      vendor: vendor._id
    });
    
    product2 = await Product.create({
      name: 'Test Product 2',
      description: 'Description for test product 2',
      price: 29.99,
      category: 'Clothing',
      countInStock: 15,
      vendor: vendor._id
    });
  });

  describe('POST /api/orders', () => {
    it('should create a new order as customer', async () => {
      const orderData = {
        orderItems: [
          {
            product: product1._id,
            qty: 2
          },
          {
            product: product2._id,
            qty: 1
          }
        ],
        shippingAddress: {
          address: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'PayPal',
        taxPrice: 7.50,
        shippingPrice: 10.00,
        totalPrice: 87.48 // (19.99 * 2) + 29.99 + 7.50 + 10.00
      };
      
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', customerToken)
        .send(orderData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.order).toBeDefined();
      expect(res.body.data.order.user.toString()).toBe(customer._id.toString());
      expect(res.body.data.order.orderItems).toHaveLength(2);
      expect(res.body.data.order.totalPrice).toBe(orderData.totalPrice);
      
      // Check if product stock was updated
      const updatedProduct1 = await Product.findById(product1._id);
      const updatedProduct2 = await Product.findById(product2._id);
      expect(updatedProduct1.countInStock).toBe(8); // 10 - 2
      expect(updatedProduct2.countInStock).toBe(14); // 15 - 1
    });

    it('should not create an order with insufficient stock', async () => {
      const orderData = {
        orderItems: [
          {
            product: product1._id,
            qty: 20 // More than available stock (10)
          }
        ],
        shippingAddress: {
          address: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'PayPal',
        taxPrice: 7.50,
        shippingPrice: 10.00,
        totalPrice: 417.30 // (19.99 * 20) + 7.50 + 10.00
      };
      
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', customerToken)
        .send(orderData);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('out of stock');
    });

    it('should not create an order without authentication', async () => {
      const orderData = {
        orderItems: [
          {
            product: product1._id,
            qty: 2
          }
        ],
        shippingAddress: {
          address: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'PayPal',
        taxPrice: 7.50,
        shippingPrice: 10.00,
        totalPrice: 47.48 // (19.99 * 2) + 7.50 + 10.00
      };
      
      const res = await request(app)
        .post('/api/orders')
        .send(orderData);
      
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toBe('Not authorized to access this route');
    });
  });

  describe('GET /api/orders/myorders', () => {
    it('should get customer orders', async () => {
      // Create an order for the customer
      await Order.create({
        user: customer._id,
        orderItems: [
          {
            product: product1._id,
            name: product1.name,
            image: product1.image,
            price: product1.price,
            qty: 2
          }
        ],
        shippingAddress: {
          address: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'PayPal',
        taxPrice: 7.50,
        shippingPrice: 10.00,
        totalPrice: 47.48
      });
      
      const res = await request(app)
        .get('/api/orders/myorders')
        .set('Authorization', customerToken);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.orders).toHaveLength(1);
      expect(res.body.data.orders[0].user.toString()).toBe(customer._id.toString());
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should get order by ID', async () => {
      // Create an order
      const order = await Order.create({
        user: customer._id,
        orderItems: [
          {
            product: product1._id,
            name: product1.name,
            image: product1.image,
            price: product1.price,
            qty: 2
          }
        ],
        shippingAddress: {
          address: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'PayPal',
        taxPrice: 7.50,
        shippingPrice: 10.00,
        totalPrice: 47.48
      });
      
      const res = await request(app)
        .get(`/api/orders/${order._id}`)
        .set('Authorization', customerToken);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.order._id.toString()).toBe(order._id.toString());
    });

    it('should not allow access to another user\'s order', async () => {
      // Create another customer
      const anotherCustomer = await User.create({
        name: 'Another Customer',
        email: 'another@example.com',
        password: 'password123',
        role: 'customer',
        isVerified: true
      });
      
      const anotherCustomerToken = `Bearer ${anotherCustomer.getSignedJwtToken()}`;
      
      // Mock jwt.verify for the new token
      jwt.verify.mockImplementation((token, secret) => {
        if (token === vendorToken.split(' ')[1]) {
          return { id: vendor._id, role: 'vendor' };
        } else if (token === customerToken.split(' ')[1]) {
          return { id: customer._id, role: 'customer' };
        } else if (token === adminToken.split(' ')[1]) {
          return { id: admin._id, role: 'admin' };
        } else if (token === anotherCustomerToken.split(' ')[1]) {
          return { id: anotherCustomer._id, role: 'customer' };
        }
        throw new Error('Invalid token');
      });
      
      // Create an order for the original customer
      const order = await Order.create({
        user: customer._id,
        orderItems: [
          {
            product: product1._id,
            name: product1.name,
            image: product1.image,
            price: product1.price,
            qty: 2
          }
        ],
        shippingAddress: {
          address: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'PayPal',
        taxPrice: 7.50,
        shippingPrice: 10.00,
        totalPrice: 47.48
      });
      
      const res = await request(app)
        .get(`/api/orders/${order._id}`)
        .set('Authorization', anotherCustomerToken);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('not authorized to view this order');
    });
  });

  describe('PUT /api/orders/:id/pay', () => {
    it('should update order to paid', async () => {
      // Create an order
      const order = await Order.create({
        user: customer._id,
        orderItems: [
          {
            product: product1._id,
            name: product1.name,
            image: product1.image,
            price: product1.price,
            qty: 2
          }
        ],
        shippingAddress: {
          address: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'PayPal',
        taxPrice: 7.50,
        shippingPrice: 10.00,
        totalPrice: 47.48
      });
      
      const paymentResult = {
        id: 'PAY123456789',
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        email_address: 'customer@example.com'
      };
      
      const res = await request(app)
        .put(`/api/orders/${order._id}/pay`)
        .set('Authorization', customerToken)
        .send(paymentResult);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.order.isPaid).toBe(true);
      expect(res.body.data.order.paymentResult.id).toBe(paymentResult.id);
    });
  });
});