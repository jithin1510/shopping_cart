# JWT Authentication Guide

This document explains how JWT (JSON Web Token) authentication is implemented and used in our system.

## Overview

JWT (JSON Web Token) is an open standard that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. This information can be verified and trusted because it is digitally signed.

## How JWT is Used in Our System

### User Login API

After successful user authentication (login or email verification), the server:
1. Generates a JWT token containing user information (ID, role, etc.)
2. Returns this token to the client in the response
3. Optionally sets the token as an HTTP-only cookie for web clients

Example response:
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "isVerified": true
    }
  }
}
```

### Client JWT Authentication

Clients can authenticate using an existing JWT token instead of username/password:
1. Send a POST request to `/api/auth/token` with the JWT token
2. The server validates the token and issues a new token if valid
3. This enables token-based authentication flows for clients

Example request:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Frontend (Web Applications)

Web applications should:
1. Store the JWT token securely:
   - In memory (most secure but lost on page refresh)
   - In localStorage/sessionStorage (convenient but vulnerable to XSS)
   - As an HTTP-only cookie (protection against XSS, but vulnerable to CSRF)
2. Include the token in the Authorization header for all API requests:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Implement token refresh logic when tokens expire

### Backend API Endpoints

Protected API endpoints:
1. Extract the JWT token from the Authorization header or cookies
2. Verify the token's signature and expiration
3. Extract user information from the token
4. Authorize the request based on user role and permissions

Example middleware usage:
```javascript
// Protect route with JWT authentication
router.get('/profile', protect, userController.getProfile);

// Protect route with JWT authentication and role authorization
router.delete('/users/:id', protect, authorize('admin'), userController.deleteUser);
```

### Mobile Apps

Mobile applications should:
1. Store the JWT token securely in the device's secure storage
2. Include the token in the Authorization header for all API requests
3. Implement token refresh logic when tokens expire
4. Handle token invalidation on logout

### Service-to-Service Authentication

For service-to-service authentication:
1. Services can request tokens via the `/api/auth/service-token` endpoint (admin access required)
2. Services use the `generateServiceToken` utility to create tokens with specific permissions
3. These tokens include service name and permissions
4. The `serviceAuth` middleware validates these tokens
5. Services can communicate securely without impersonating users

Example service token generation:
```javascript
const serviceToken = generateServiceToken({
  serviceName: 'payment-service',
  permissions: ['read:orders', 'write:payments'],
  expiresIn: '1h'
});
```

Example service token request:
```json
{
  "serviceName": "payment-service",
  "permissions": ["read:orders", "write:payments"],
  "expiresIn": "1h"
}
```

### Third-party API Integration

When integrating with third-party APIs:
1. Use JWT tokens for authentication if supported by the third-party API
2. Include the token in requests according to the third-party API's requirements
3. Implement proper token management (refresh, expiration handling)

## Security Considerations

1. **Token Storage**: Store tokens securely to prevent theft
2. **Token Expiration**: Use short-lived tokens with refresh capability
3. **HTTPS**: Always use HTTPS to prevent token interception
4. **Payload Size**: Keep the JWT payload small for efficiency
5. **Sensitive Data**: Don't store sensitive information in the token payload
6. **User Account Status**: Tokens are validated against active user accounts

## Troubleshooting

Common JWT authentication issues:
- "Authentication failed: Invalid token" - Token signature verification failed
- "Authentication failed: Token expired" - Token has expired and needs refresh
- "Authentication failed: No token provided" - Missing Authorization header
- "Authentication failed: User not found" - Token refers to a deleted user
- "Authentication failed: User account is deactivated" - User account is inactive
- "Not authorized to access this route" - Valid token but insufficient permissions
- "Service authentication failed: Not a service token" - Using user token for service authentication
