const mongoose = require('mongoose');
const request = require('supertest');
const { app } = require('../server');
const Product = require('../models/Product');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Mock jwt.verify
jest.mock('jsonwebtoken');

describe('Product Controller', () => {
  let vendorToken, customerToken, adminToken;
  let vendor, customer, admin;
  
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
      // Use a more graceful failure for tests
      throw new Error(`Failed to connect to test database: ${error.message}`);
    }
  });

  afterAll(async () => {
    // Disconnect from test database
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear the products collection before each test
    await Product.deleteMany({});
  });

  describe('GET /api/products', () => {
    it('should get all products', async () => {
      // Create some test products
      await Product.create([
        {
          name: 'Product 1',
          description: 'Description 1',
          price: 10.99,
          category: 'Category 1',
          countInStock: 10,
          vendor: vendor._id
        },
        {
          name: 'Product 2',
          description: 'Description 2',
          price: 20.99,
          category: 'Category 2',
          countInStock: 20,
          vendor: vendor._id
        }
      ]);
      
      const res = await request(app).get('/api/products');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.count).toBe(2);
      expect(res.body.data.products).toHaveLength(2);
    });

    it('should search products', async () => {
      // Create some test products
      await Product.create([
        {
          name: 'iPhone 12',
          description: 'Apple iPhone 12',
          price: 999.99,
          category: 'Electronics',
          countInStock: 10,
          vendor: vendor._id
        },
        {
          name: 'Samsung Galaxy S21',
          description: 'Samsung Galaxy S21',
          price: 899.99,
          category: 'Electronics',
          countInStock: 15,
          vendor: vendor._id
        },
        {
          name: 'T-Shirt',
          description: 'Cotton T-Shirt',
          price: 19.99,
          category: 'Clothing',
          countInStock: 50,
          vendor: vendor._id
        }
      ]);
      
      // Search for 'iPhone'
      const res1 = await request(app).get('/api/products?search=iPhone');
      
      expect(res1.statusCode).toBe(200);
      expect(res1.body.status).toBe('success');
      expect(res1.body.count).toBe(1);
      expect(res1.body.data.products[0].name).toBe('iPhone 12');
      
      // Search for 'Electronics' category
      const res2 = await request(app).get('/api/products?search=Electronics');
      
      expect(res2.statusCode).toBe(200);
      expect(res2.body.status).toBe('success');
      expect(res2.body.count).toBe(2);
    });
    
    it('should filter products by price range', async () => {
      // Create some test products with different prices
      await Product.create([
        {
          name: 'Budget Phone',
          description: 'Affordable smartphone',
          price: 199.99,
          category: 'Electronics',
          countInStock: 20,
          vendor: vendor._id
        },
        {
          name: 'Mid-range Phone',
          description: 'Mid-range smartphone',
          price: 499.99,
          category: 'Electronics',
          countInStock: 15,
          vendor: vendor._id
        },
        {
          name: 'Premium Phone',
          description: 'High-end smartphone',
          price: 999.99,
          category: 'Electronics',
          countInStock: 10,
          vendor: vendor._id
        }
      ]);
      
      // Filter products with price between 300 and 600
      const res = await request(app).get('/api/products?minPrice=300&maxPrice=600');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.count).toBe(1);
      expect(res.body.data.products[0].name).toBe('Mid-range Phone');
    });
    
    it('should filter products by category', async () => {
      // Create products in different categories
      await Product.create([
        {
          name: 'Smartphone',
          description: 'A smartphone',
          price: 599.99,
          category: 'Electronics',
          countInStock: 10,
          vendor: vendor._id
        },
        {
          name: 'Laptop',
          description: 'A laptop',
          price: 1299.99,
          category: 'Computers',
          countInStock: 5,
          vendor: vendor._id
        },
        {
          name: 'T-Shirt',
          description: 'Cotton T-Shirt',
          price: 19.99,
          category: 'Clothing',
          countInStock: 50,
          vendor: vendor._id
        }
      ]);
      
      // Filter products by category
      const res = await request(app).get('/api/products?category=Clothing');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.count).toBe(1);
      expect(res.body.data.products[0].name).toBe('T-Shirt');
    });
    
    it('should combine search with filters', async () => {
      // Create various products
      await Product.create([
        {
          name: 'Budget Android Phone',
          description: 'Affordable Android smartphone',
          price: 199.99,
          category: 'Electronics',
          countInStock: 20,
          vendor: vendor._id
        },
        {
          name: 'Premium Android Phone',
          description: 'High-end Android smartphone',
          price: 899.99,
          category: 'Electronics',
          countInStock: 10,
          vendor: vendor._id
        },
        {
          name: 'Budget iPhone',
          description: 'Affordable iPhone',
          price: 399.99,
          category: 'Electronics',
          countInStock: 15,
          vendor: vendor._id
        },
        {
          name: 'Premium iPhone',
          description: 'High-end iPhone',
          price: 1099.99,
          category: 'Electronics',
          countInStock: 8,
          vendor: vendor._id
        }
      ]);
      
      // Search for 'iPhone' with price filter
      const res = await request(app).get('/api/products?search=iPhone&maxPrice=500');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.count).toBe(1);
      expect(res.body.data.products[0].name).toBe('Budget iPhone');
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product as vendor', async () => {
      const productData = {
        name: 'New Product',
        description: 'Product Description',
        price: 29.99,
        category: 'Test Category',
        countInStock: 25
      };
      
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', vendorToken)
        .send(productData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.product).toBeDefined();
      expect(res.body.data.product.name).toBe(productData.name);
      expect(res.body.data.product.vendor.toString()).toBe(vendor._id.toString());
    });

    it('should create a new product as customer', async () => {
      const productData = {
        name: 'Customer Product',
        description: 'Product from Customer',
        price: 19.99,
        category: 'Test Category',
        countInStock: 5
      };
      
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', customerToken)
        .send(productData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.product).toBeDefined();
      expect(res.body.data.product.name).toBe(productData.name);
      expect(res.body.data.product.vendor.toString()).toBe(customer._id.toString());
    });

    it('should not create a product without authentication', async () => {
      const productData = {
        name: 'New Product',
        description: 'Product Description',
        price: 29.99,
        category: 'Test Category',
        countInStock: 25
      };
      
      const res = await request(app)
        .post('/api/products')
        .send(productData);
      
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toBe('Not authorized to access this route');
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update a product as vendor', async () => {
      // Create a product
      const product = await Product.create({
        name: 'Original Product',
        description: 'Original Description',
        price: 29.99,
        category: 'Original Category',
        countInStock: 25,
        vendor: vendor._id
      });
      
      const updateData = {
        name: 'Updated Product',
        price: 39.99
      };
      
      const res = await request(app)
        .put(`/api/products/${product._id}`)
        .set('Authorization', vendorToken)
        .send(updateData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.product.name).toBe(updateData.name);
      expect(res.body.data.product.price).toBe(updateData.price);
      expect(res.body.data.product.description).toBe(product.description); // Unchanged
    });

    it('should not update a product of another vendor', async () => {
      // Create another vendor
      const anotherVendor = await User.create({
        name: 'Another Vendor',
        email: 'another@example.com',
        password: 'password123',
        role: 'vendor',
        isVerified: true
      });
      
      // Create a product by another vendor
      const product = await Product.create({
        name: 'Another Vendor Product',
        description: 'Description',
        price: 29.99,
        category: 'Category',
        countInStock: 25,
        vendor: anotherVendor._id
      });
      
      const updateData = {
        name: 'Attempted Update',
        price: 39.99
      };
      
      const res = await request(app)
        .put(`/api/products/${product._id}`)
        .set('Authorization', vendorToken)
        .send(updateData);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('not authorized to update this product');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product as vendor', async () => {
      // Create a product
      const product = await Product.create({
        name: 'Product to Delete',
        description: 'Description',
        price: 29.99,
        category: 'Category',
        countInStock: 25,
        vendor: vendor._id
      });
      
      const res = await request(app)
        .delete(`/api/products/${product._id}`)
        .set('Authorization', vendorToken);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      
      // Check if product was deleted
      const deletedProduct = await Product.findById(product._id);
      expect(deletedProduct).toBeNull();
    });

    it('should not delete a product of another vendor', async () => {
      // Create another vendor
      const anotherVendor = await User.create({
        name: 'Another Vendor',
        email: 'another2@example.com',
        password: 'password123',
        role: 'vendor',
        isVerified: true
      });
      
      // Create a product by another vendor
      const product = await Product.create({
        name: 'Another Vendor Product',
        description: 'Description',
        price: 29.99,
        category: 'Category',
        countInStock: 25,
        vendor: anotherVendor._id
      });
      
      const res = await request(app)
        .delete(`/api/products/${product._id}`)
        .set('Authorization', vendorToken);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('not authorized to delete this product');
      
      // Check if product still exists
      const existingProduct = await Product.findById(product._id);
      expect(existingProduct).toBeDefined();
    });
  });
});

