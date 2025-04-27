# Guide to Starting the API and Using Postman

This guide will help you set up and start the Shopping Cart API server and use Postman to interact with the endpoints. It includes detailed scenarios and examples to demonstrate how the backend works.

## Setting Up and Starting the API Server

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

### Step 1: Install Dependencies
First, install all the required dependencies by running:
```bash
npm install
```

### Step 2: Configure Environment Variables
Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/shopping-cart
JWT_SECRET_KEY=your_jwt_secret_key
JWT_EXPIRATION_TIME=30d
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=noreply@shoppingcart.com
OTP_EXPIRATION_TIME=300000
OTP_CODE_LENGTH=6
APP_URL=http://localhost:5000
```

**Notes on MongoDB Connection:**
- For local MongoDB without authentication: `mongodb://localhost:27017/shopping-cart`
- For local MongoDB with authentication: `mongodb://username:password@localhost:27017/shopping-cart`
- For MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/shopping-cart?retryWrites=true&w=majority`

### Step 3: Start the Server
To start the server in production mode:
```bash
npm start
```

For development with auto-reload:
```bash
npm run server
```

The server will start on port 5000 (or the port specified in your .env file). You should see the following messages in the console:
```
Server running on port 5000
MongoDB Connected: localhost
```

### Step 4: Access API Documentation
The API documentation is available at:
```
http://localhost:5000/api-docs
```
This Swagger UI provides detailed information about all available endpoints, required parameters, and response formats.

## Understanding the Backend Architecture

The Shopping Cart API is built with a modular architecture:

1. **Server Setup**: The main `server.js` file initializes Express, connects to MongoDB, sets up middleware, and defines routes.

2. **Routes**: API endpoints are organized in route files:
   - `/routes/auth.js`: Authentication endpoints
   - `/routes/products.js`: Product management endpoints
   - `/routes/orders.js`: Order processing endpoints
   - `/routes/users.js`: User management endpoints

3. **Controllers**: Business logic is separated into controller files:
   - `/controllers/authController.js`: Authentication logic
   - `/controllers/productController.js`: Product management logic
   - `/controllers/orderController.js`: Order processing logic
   - `/controllers/userController.js`: User management logic

4. **Models**: MongoDB schemas and models:
   - `/models/User.js`: User data model with authentication methods
   - `/models/Product.js`: Product data model
   - `/models/Order.js`: Order data model
   - `/models/Session.js`: Session management for authentication

5. **Middleware**: Request processing middleware:
   - `/middleware/auth.js`: Authentication and authorization
   - `/middleware/error.js`: Error handling
   - `/middleware/validate.js`: Request validation

6. **Utils**: Utility functions:
   - `/utils/sendEmail.js`: Email sending functionality
   - `/utils/generateServiceToken.js`: Service-to-service authentication

## Using Postman with the API

### Setting Up Postman

1. **Download and Install Postman**:
   - Download from [postman.com](https://www.postman.com/downloads/)
   - Install and open the application

2. **Create a New Collection**:
   - Click on "Collections" in the sidebar
   - Click the "+" button to create a new collection
   - Name it "Shopping Cart API"

### Authentication in Postman

Most endpoints require authentication using JSON Web Tokens (JWT). Here's how to set it up:

1. **Register a User**:
   - Create a POST request to `http://localhost:5000/api/auth/register`
   - Set the body to raw JSON:
     ```json
     {
       "name": "Test User",
       "email": "test@example.com",
       "password": "password123"
     }
     ```
   - Send the request and you'll receive a token in the response

2. **Login**:
   - Create a POST request to `http://localhost:5000/api/auth/login`
   - Set the body to raw JSON:
     ```json
     {
       "email": "test@example.com",
       "password": "password123"
     }
     ```
   - Send the request and you'll receive a token in the response

3. **Using the Token**:
   - For authenticated requests, add an Authorization header:
   - In the request headers, add:
     - Key: `Authorization`
     - Value: `Bearer YOUR_TOKEN_HERE`

## Real-World Scenarios with Postman Examples

### Scenario 1: E-commerce Store Setup (Vendor Perspective)

In this scenario, you'll act as a vendor setting up products in the e-commerce store.

#### Step 1: Register as a Vendor
1. Create a POST request to `http://localhost:5000/api/auth/register`
2. Set the body to:
   ```json
   {
     "name": "Tech Store",
     "email": "vendor@techstore.com",
     "password": "secure123",
     "role": "vendor"
   }
   ```
3. Send the request and save the token from the response

#### Step 2: Verify Email
1. Check the console logs for the OTP code (in a real environment, this would be sent to your email)
2. Create a POST request to `http://localhost:5000/api/auth/verify-email`
3. Set the body to:
   ```json
   {
     "email": "vendor@techstore.com",
     "otp": "123456"  // Replace with the actual OTP from console
   }
   ```
4. Send the request

#### Step 3: Add Products to Your Store
1. Create a POST request to `http://localhost:5000/api/products`
2. Add the Authorization header with your token
3. Set the body to:
   ```json
   {
     "name": "Smartphone Pro Max",
     "description": "Latest flagship smartphone with 6.7-inch display, 5G connectivity, and triple camera system",
     "price": 1099.99,
     "category": "Electronics",
     "image": "https://example.com/smartphone.jpg",
     "countInStock": 25
   }
   ```
4. Send the request
5. Repeat with different products:
   ```json
   {
     "name": "Wireless Earbuds",
     "description": "True wireless earbuds with noise cancellation and 24-hour battery life",
     "price": 149.99,
     "category": "Audio",
     "image": "https://example.com/earbuds.jpg",
     "countInStock": 50
   }
   ```

#### Step 4: Update Product Information
1. Create a PUT request to `http://localhost:5000/api/products/PRODUCT_ID` (replace with actual ID)
2. Add the Authorization header with your token
3. Set the body to:
   ```json
   {
     "price": 999.99,
     "countInStock": 30,
     "description": "Latest flagship smartphone with 6.7-inch display, 5G connectivity, triple camera system, and extended battery life"
   }
   ```
4. Send the request

#### Step 5: View Your Products
1. Create a GET request to `http://localhost:5000/api/products/vendor`
2. Add the Authorization header with your token
3. Send the request to see all your products

### Scenario 2: Customer Shopping Experience

In this scenario, you'll act as a customer browsing products and placing orders.

#### Step 1: Register as a Customer
1. Create a POST request to `http://localhost:5000/api/auth/register`
2. Set the body to:
   ```json
   {
     "name": "John Smith",
     "email": "john@example.com",
     "password": "customer123"
   }
   ```
3. Send the request and save the token from the response

#### Step 2: Verify Email
1. Create a POST request to `http://localhost:5000/api/auth/verify-email`
2. Set the body with the OTP from console logs:
   ```json
   {
     "email": "john@example.com",
     "otp": "123456"  // Replace with actual OTP
   }
   ```
3. Send the request

#### Step 3: Browse Products
1. Create a GET request to `http://localhost:5000/api/products`
2. Add query parameters for filtering:
   - `search=smartphone` to search for smartphones
   - `sort=price` to sort by price ascending
   - `page=1&limit=10` for pagination
3. Send the request and note the product IDs for items you want to purchase

#### Step 4: Get Detailed Product Information
1. Create a GET request to `http://localhost:5000/api/products/PRODUCT_ID` (replace with actual ID)
2. Send the request to see detailed product information

#### Step 5: Place an Order
1. Create a POST request to `http://localhost:5000/api/orders`
2. Add the Authorization header with your customer token
3. Set the body to:
   ```json
   {
     "orderItems": [
       {
         "product": "PRODUCT_ID_1",  // Replace with actual ID
         "name": "Smartphone Pro Max",
         "image": "https://example.com/smartphone.jpg",
         "price": 999.99,
         "qty": 1
       },
       {
         "product": "PRODUCT_ID_2",  // Replace with actual ID
         "name": "Wireless Earbuds",
         "image": "https://example.com/earbuds.jpg",
         "price": 149.99,
         "qty": 2
       }
     ],
     "shippingAddress": {
       "address": "123 Main Street",
       "city": "Boston",
       "postalCode": "02108",
       "country": "USA"
     },
     "paymentMethod": "PayPal",
     "taxPrice": 115.00,
     "shippingPrice": 15.00,
     "totalPrice": 1429.97
   }
   ```
4. Send the request

#### Step 6: View Your Orders
1. Create a GET request to `http://localhost:5000/api/orders/myorders`
2. Add the Authorization header with your customer token
3. Send the request to see all your orders

#### Step 7: Check Order Details
1. Create a GET request to `http://localhost:5000/api/orders/ORDER_ID` (replace with actual ID)
2. Add the Authorization header with your customer token
3. Send the request to see detailed order information

### Scenario 3: Admin Operations

In this scenario, you'll act as an admin managing the e-commerce platform.

#### Step 1: Register as an Admin
1. Create a POST request to `http://localhost:5000/api/auth/register`
2. Set the body to:
   ```json
   {
     "name": "Admin User",
     "email": "admin@example.com",
     "password": "admin123",
     "role": "admin"
   }
   ```
3. Send the request and save the token from the response

#### Step 2: Verify Email
1. Create a POST request to `http://localhost:5000/api/auth/verify-email`
2. Set the body with the OTP from console logs:
   ```json
   {
     "email": "admin@example.com",
     "otp": "123456"  // Replace with actual OTP
   }
   ```
3. Send the request

#### Step 3: View All Users
1. Create a GET request to `http://localhost:5000/api/users`
2. Add the Authorization header with your admin token
3. Send the request to see all users in the system

#### Step 4: View All Orders
1. Create a GET request to `http://localhost:5000/api/orders`
2. Add the Authorization header with your admin token
3. Send the request to see all orders in the system

#### Step 5: Mark an Order as Delivered
1. Create a PUT request to `http://localhost:5000/api/orders/ORDER_ID/deliver` (replace with actual ID)
2. Add the Authorization header with your admin token
3. Send the request to mark the order as delivered

#### Step 6: Generate Service Token
1. Create a POST request to `http://localhost:5000/api/auth/service-token`
2. Add the Authorization header with your admin token
3. Set the body to:
   ```json
   {
     "serviceName": "inventory-service",
     "permissions": ["read:products", "write:products"],
     "expiresIn": "7d"
   }
   ```
4. Send the request to generate a service-to-service authentication token

## Understanding JWT Authentication Flow

The Shopping Cart API uses JSON Web Tokens (JWT) for authentication. Here's how the authentication flow works:

1. **User Registration**:
   - User submits registration details (name, email, password)
   - Server creates a new user in the database with hashed password
   - Server generates an OTP and stores it (hashed) with the user
   - Server sends OTP to user's email (simulated in development)
   - Server returns a JWT token that has limited permissions until email is verified

2. **Email Verification**:
   - User submits the OTP received via email
   - Server verifies the OTP against the stored hash
   - If valid, server marks the user as verified
   - User can now access all features based on their role

3. **User Login**:
   - User submits email and password
   - Server verifies credentials against the database
   - If valid, server generates a new JWT token
   - Server creates a session record for the user
   - Token is returned to the client for future authenticated requests

4. **Authenticated Requests**:
   - Client includes the JWT token in the Authorization header
   - Server validates the token signature and expiration
   - Server checks if the user exists and is active
   - Server adds the user object to the request for use in controllers
   - Request proceeds to the appropriate route handler

5. **Authorization**:
   - Different endpoints require different user roles
   - Middleware checks if the user has the required role
   - Some endpoints also check if the user's email is verified
   - If authorized, the request proceeds; otherwise, an error is returned

6. **Token Refresh**:
   - When a token is about to expire, client can request a new token
   - Server validates the current token and issues a new one
   - This extends the user's session without requiring re-login

## Troubleshooting

### Common Issues

1. **Connection to MongoDB failed**:
   - Ensure MongoDB is running
   - Check your MONGO_URI in the .env file
   - Make sure network connectivity to the database server is available

2. **Authentication Failed**:
   - Ensure you're using the correct email and password
   - Check that the JWT_SECRET_KEY in your .env file is set correctly
   - Verify that the token hasn't expired

3. **Permission Denied Errors**:
   - Different endpoints require different user roles
   - Make sure your user has the appropriate role (customer, vendor, or admin)
   - Some endpoints require email verification before access is granted

4. **Email Verification Issues**:
   - Check your email service configuration in the .env file
   - If using Gmail, you might need to enable "Less secure app access"
   - For testing, you can check the console logs for the OTP code

5. **Invalid Request Format**:
   - Check that your JSON is properly formatted
   - Ensure all required fields are included in the request
   - Verify that field values match the expected types and formats

### Getting Help

If you encounter issues not covered in this guide, you can:
1. Check the API documentation at `/api-docs`
2. Look at the server logs for error messages
3. Review the code in the relevant controllers and models


