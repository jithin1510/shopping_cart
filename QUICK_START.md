# Quick Start Guide

This is a quick start guide to get the Shopping Cart API running and test it with Postman.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

Run the setup script to create your `.env` file:

```bash
npm run setup
```

Follow the prompts to configure your environment variables.

## Step 3: Start the Server

```bash
npm start
```

You should see:
```
Server running on port 5000
MongoDB Connected: [your-mongodb-host]
```

## Step 4: Access API Documentation

Open your browser and go to:
```
http://localhost:5000/api-docs
```

This will show you all available API endpoints with documentation.

## Step 5: Test with Postman

1. **Register a User**:
   - POST to `http://localhost:5000/api/auth/register`
   - Body (JSON):
   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "password123"
   }
   ```

2. **Login**:
   - POST to `http://localhost:5000/api/auth/login`
   - Body (JSON):
   ```json
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```
   - Save the token from the response

3. **Use the Token for Authenticated Requests**:
   - Add header: `Authorization: Bearer YOUR_TOKEN_HERE`

For more detailed instructions, see the [Postman Guide](POSTMAN_GUIDE.md).