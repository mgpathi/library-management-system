# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... } // Optional
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "details": [ ... ] // Optional
}
```

## Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `POST /auth/logout` - User logout
- `POST /auth/change-password` - Change password
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### Users
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update profile
- `GET /users` - Get all users (admin)
- `GET /users/:id` - Get user details (admin)
- `GET /users/search` - Search users
- `PUT /users/:id/status` - Update user status (admin)
- `DELETE /users/:id` - Delete user (admin)

### Books
- `GET /books` - Get books with pagination
- `POST /books` - Create book (librarian/admin)
- `GET /books/:id` - Get book details
- `PUT /books/:id` - Update book (librarian/admin)
- `DELETE /books/:id` - Delete book (librarian/admin)
- `GET /books/search` - Search books
- `GET /books/category/:categoryId` - Get books by category
- `GET /books/popular` - Get popular books
- `GET /books/stats` - Get book statistics

### Borrow
- `POST /borrow/borrow` - Borrow book (librarian/admin)
- `POST /borrow/return` - Return book (librarian/admin)
- `POST /borrow/renew` - Renew borrow
- `GET /borrow/my-books` - Get active borrows
- `GET /borrow/my-history` - Get borrow history
- `GET /borrow/overdue` - Get overdue books (admin)
- `GET /borrow/stats` - Get borrow statistics

### Fines
- `GET /fines/my-fines` - Get user fines
- `GET /fines/:id` - Get fine details
- `POST /fines/:id/pay` - Pay fine
- `POST /fines/:id/waive` - Waive fine (admin)
- `GET /fines/stats` - Get fine statistics (admin)

### Categories
- `GET /categories` - Get all categories
- `POST /categories` - Create category (admin)
- `GET /categories/:id` - Get category details
- `PUT /categories/:id` - Update category (admin)
- `DELETE /categories/:id` - Delete category (admin)

### Dashboard
- `GET /dashboard/stats` - Get dashboard stats (admin)
- `GET /dashboard/transactions` - Get recent transactions (admin)
- `GET /dashboard/users/stats` - Get user stats (admin)
- `GET /dashboard/borrow/stats` - Get borrow stats (admin)
- `GET /dashboard/fines/stats` - Get fine stats (admin)

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Rate Limiting
Currently no rate limiting. To be implemented in production.

## Error Handling
All errors include a descriptive message. Check the `message` field in response.

## Pagination
Supported in list endpoints:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

Response includes `pagination` object:
```json
{
  "page": 1,
  "limit": 10,
  "total": 250,
  "pages": 25
}
```

## Filtering & Sorting
Implemented in various endpoints using query parameters.

## Testing with Postman

1. Import the API collection
2. Set the base URL
3. Run POST /auth/login to get token
4. Use token in Authorization header for protected requests

## WebSocket Support
Not implemented in v1.0. Planned for future releases.
