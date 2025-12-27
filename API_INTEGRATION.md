# API Integration Guide

## Overview
This project has been integrated with the backend Auth Service API. The API integration follows best practices with service layers, type safety, and error handling.

## Setup

### 1. Environment Configuration
Create a `.env` file in the root directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and set your API base URL:
```
VITE_API_BASE_URL=http://localhost:8080/auth-service
```

### 2. API Structure

#### Base API Service (`src/shared/services/api.service.ts`)
- Centralized HTTP client
- Automatic token management (using `accessToken`)
- Error handling
- Support for GET, POST, PUT, PATCH, DELETE methods
- Automatically extracts `data` from API response structure `{code, message, data}`

#### Auth Service (`src/features/auth/services/auth.service.ts`)
Handles authentication operations:
- `login(credentials)` - User login
- `register(userData)` - User registration
- `refreshToken()` - Refresh access token
- `getCurrentUserFromApi()` - Fetch current user from API
- `logout()` - Clear auth data
- `getCurrentUser()` - Get current user from storage
- `isAuthenticated()` - Check auth status
- `getAccessToken()` - Get access token
- `getRefreshToken()` - Get refresh token

## API Endpoints

Based on the Auth Service documentation:

### Authentication
```
POST /auth/login
Body: { username: string, password: string }
Response: {
  code: 200,
  message: "Login success",
  data: {
    userId: string,
    username: string,
    email: string,
    accessToken: string,
    refreshToken: string
  }
}

POST /auth/register
Body: { username: string, email: string, password: string }
Response: {
  code: 200,
  message: "Register success",
  data: {
    userId: string,
    username: string,
    email: string,
    accessToken: string,
    refreshToken: string
  }
}

POST /auth/refresh
Body: { refreshToken: string }
Response: {
  code: 200,
  message: "Refreshed token",
  data: {
    accessToken: string,
    refreshToken: string
  }
}
```

### User Object Structure
```typescript
{
  userId: string;
  username: string;
  email: string;
  roles?: string[];
  banned?: boolean;
  createdAt?: string;
}
```

## Usage Examples

### Login
```typescript
import { AuthService } from '@/features/auth/services/auth.service';

try {
  const response = await AuthService.login({
    username: 'myusername',
    password: 'password123'
  });
  console.log('User ID:', response.userId);
  console.log('Access Token:', response.accessToken);
} catch (error) {
  console.error('Login failed:', error.message);
}
```

### Register
```typescript
import { AuthService } from '@/features/auth/services/auth.service';

try {
  const response = await AuthService.register({
    username: 'newuser',
    email: 'user@example.com',
    password: 'password123'
  });
  console.log('User registered:', response.username);
} catch (error) {
  console.error('Registration failed:', error.message);
}
```

### Refresh Token
```typescript
import { AuthService } from '@/features/auth/services/auth.service';

try {
  const tokens = await AuthService.refreshToken();
  console.log('New access token:', tokens.accessToken);
} catch (error) {
  console.error('Token refresh failed:', error.message);
}
```

### Making Authenticated Requests
```typescript
import { ApiService } from '@/shared/services/api.service';

// Example: Get current user
const user = await ApiService.get('/users/me', true);

// Example: Update profile (hypothetical endpoint)
const updated = await ApiService.put('/users/me', {
  email: 'newemail@example.com'
}, true);
```

## State Management

The auth state is managed using Zustand in `src/store/useStore.ts`:

```typescript
import { useAuthStore } from '@/store/useStore';

function MyComponent() {
  const { user, isLoggedIn, login, logout } = useAuthStore();
  
  // Use auth state
  if (isLoggedIn) {
    return <div>Welcome, {user?.username}</div>;
  }
  
  return <div>Please login</div>;
}
```

## Error Handling

The API service provides structured error handling:

```typescript
interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}
```

All API errors are caught and formatted consistently, making it easy to display error messages to users.

## Token Management

- **Access Token**: Stored in localStorage as `accessToken`, automatically included in authenticated requests
- **Refresh Token**: Stored in localStorage as `refreshToken`, used to get new access tokens
- **User Data**: Stored in localStorage as `user` JSON object
- Tokens are removed on logout

## Response Structure

All API responses follow this structure:
```typescript
{
  code: number;        // HTTP status code
  message: string;     // Success or error message
  data: any;          // Actual response data
}
```

The API service automatically extracts the `data` field, so you work directly with the payload.

## Security Notes

1. Tokens are stored in localStorage (consider httpOnly cookies for production)
2. Always use HTTPS in production
3. Implement automatic token refresh on 401 errors
4. Add CSRF protection for state-changing operations
5. The refresh token mechanism is already implemented

## Next Steps

To extend the API integration:

1. Implement automatic token refresh on 401 errors
2. Add more service layers (e.g., PostService, UserService)
3. Add request/response interceptors for logging
4. Implement offline support with service workers
5. Add API request caching

## Testing

Test the API integration:

1. Start your backend server (ensure gateway routes to auth-service)
2. Update `.env` with correct gateway URL
3. Run the frontend: `npm run dev`
4. Try login/register functionality

## Troubleshooting

### CORS Issues
Ensure your backend gateway allows requests from your frontend origin:
```javascript
// Backend CORS configuration example
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Network Errors
- Check if backend server is running
- Verify VITE_API_BASE_URL in .env
- Check browser console for detailed error messages
- Verify endpoint paths match backend routes (e.g., `/auth-service/auth/login`)

### Token Expiration
- Implement automatic token refresh using the `refreshToken()` method
- Handle 401 errors globally to trigger token refresh or logout
