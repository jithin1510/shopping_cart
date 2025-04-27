# Shopping Cart Application

A full-stack MERN (MongoDB, Express, React, Node.js) shopping cart application with role-based authentication and authorization.

## Features

- **User Roles**: Customer, Vendor, and Admin roles with different permissions
- **Authentication**: JWT-based authentication with email verification using OTP
- **Product Management**: Search, create, update, and delete products
- **Shopping Cart**: Add products to cart and checkout
- **Order Management**: Track orders and update order status
- **API Documentation**: Swagger/OpenAPI documentation
- **Validation**: Comprehensive input validation on all endpoints
- **Error Handling**: Proper error handling with appropriate HTTP status codes
- **Test Coverage**: Over 90% test coverage for backend code

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Nodemailer for email sending
- Swagger for API documentation
- Jest for testing
- Express Validator for input validation

### Frontend (to be implemented)
- React.js
- Redux for state management
- React Router for routing
- Axios for API calls
- Jest and React Testing Library for testing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

### Backend Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd shopping-cart-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   APP_PORT=5000
   DB_CONNECTION_STRING=mongodb://localhost:27017/shopping-cart
   TEST_DB_CONNECTION_STRING=mongodb://localhost:27017/test-shopping-cart
   JWT_SECRET_KEY=your_jwt_secret_key
   JWT_EXPIRATION_TIME=30d
   MAIL_HOST=smtp.example.com
   MAIL_PORT=587
   MAIL_USERNAME=your_email@example.com
   MAIL_PASSWORD=your_email_password
   MAIL_FROM_ADDRESS=noreply@shoppingcart.com
   OTP_EXPIRATION_TIME=300000
   APP_URL=http://localhost:5000
   
   # Optional OTP Configuration
   OTP_CODE_LENGTH=6
   OTP_CHARACTER_SET=0123456789
   MAIL_OTP_REGISTRATION_SUBJECT=Email Verification - Shopping Cart App
   MAIL_OTP_VENDOR_SUBJECT=Vendor Verification - Shopping Cart App
   MAIL_OTP_DEFAULT_SUBJECT=OTP Verification - Shopping Cart App
   MAIL_OTP_REGISTRATION_MESSAGE=Thank you for registering with our Shopping Cart App. Please use the following OTP to verify your email address:
   MAIL_OTP_VENDOR_MESSAGE=You have been invited to become a vendor on our Shopping Cart App. Please use the following OTP to verify your email address:
   MAIL_OTP_DEFAULT_MESSAGE=Please use the following OTP for verification:
   MAIL_OTP_DISPLAY_STYLE=background: #f4f4f4; padding: 10px;
   MAIL_OTP_VALIDITY_TEXT=This OTP is valid for 5 minutes.
   ```

   **Note about MongoDB Connection:**
   - For local MongoDB without authentication: `mongodb://localhost:27017/shopping-cart`
   - For local MongoDB with authentication: `mongodb://username:password@localhost:27017/shopping-cart`
   - For MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/shopping-cart?retryWrites=true&w=majority`
   
   Replace `username`, `password`, and other connection details with your actual MongoDB credentials.

4. Start the server:
   ```
   npm start
   ```

   For development with auto-reload:
   ```
   npm run server
   ```

### Frontend Setup (to be implemented)

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## API Documentation

API documentation is available at `/api-docs` when the server is running. This documentation is generated using Swagger/OpenAPI and provides detailed information about all available endpoints, request parameters, and response formats.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/resend-otp` - Resend OTP for email verification
- `POST /api/auth/refresh-token` - Refresh JWT token
- `GET /api/auth/sessions` - Get user sessions

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)
- `POST /api/users/vendors` - Create vendor (Admin only)
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Update user password

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Vendor/Customer only)
- `PUT /api/products/:id` - Update product (Vendor only)
- `DELETE /api/products/:id` - Delete product (Vendor only)
- `GET /api/products/vendor` - Get vendor products (Vendor only)

### Orders
- `POST /api/orders` - Create order (Customer only)
- `GET /api/orders` - Get all orders (Admin only)
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/pay` - Update order to paid
- `PUT /api/orders/:id/deliver` - Update order to delivered (Admin only)
- `GET /api/orders/myorders` - Get logged in user orders

## Testing

Run tests:
```
npm test
```

Run tests with coverage:
```
npm test -- --coverage
```

The project aims for at least 90% test coverage across all files.

## Code Quality

Run ESLint:
```
npm run lint
```

## Project Structure

```
├── config/             # Configuration files
├── controllers/        # Route controllers
├── middleware/         # Custom middleware
├── models/             # Mongoose models
├── routes/             # API routes
├── tests/              # Test files
├── utils/              # Utility functions
├── .env                # Environment variables (create this)
├── server.js           # Entry point
└── package.json        # Dependencies and scripts
```

## Role-Based Access

1. **Customer**
   - Can register and verify email with OTP
   - Can search and buy products
   - Can create products
   - Can view their own orders

2. **Vendor**
   - Can be created by Admin
   - Must verify email with OTP
   - Can create, update, and delete their own products
   - Can view their own products

3. **Admin**
   - Can manage all users
   - Can create vendors
   - Can view all orders
   - Has access to all system functions

## License

This project is licensed under the ISC License.

## Contributors

- [Your Name]

