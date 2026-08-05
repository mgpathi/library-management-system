# Library Management System - Complete Full-Stack Project

A production-ready full-stack Library Management System built with React 19, Vite, Node.js/Express, and MongoDB.

## 📋 Project Overview

This comprehensive library management system includes:
- User authentication and role-based access control
- Book catalog management
- Book lending/borrowing system
- Fine calculation for overdue books
- User and book statistics dashboard
- Advanced search and filtering
- Responsive, modern UI with Tailwind CSS

## 🏗️ Project Architecture

```
library-management-system/
├── backend/               # Node.js/Express API
│   ├── src/
│   │   ├── config/       # Database configuration
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Express middleware
│   │   ├── validators/   # Request validation
│   │   ├── utils/        # Utility functions
│   │   ├── constants/    # App constants
│   │   └── index.js      # Entry point
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── frontend/              # React/Vite SPA
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── services/     # API services
│   │   ├── store/        # Redux state
│   │   ├── hooks/        # Custom hooks
│   │   ├── utils/        # Helper functions
│   │   ├── styles/       # Global styles
│   │   ├── constants/    # Constants
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── database/              # Database setup
│   ├── schemas.sql       # MongoDB schemas
│   └── seedData.js       # Sample data
│
├── docs/                  # Documentation
│   ├── API.md            # API documentation
│   ├── SETUP.md          # Setup guide
│   └── FEATURES.md       # Feature list
│
├── docker-compose.yml    # Docker configuration
└── README.md             # Project README
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- MongoDB >= 4.4
- npm or yarn

### Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- API Health: http://localhost:5000/api/health

## 📚 API Documentation

### Authentication Endpoints

**POST /api/auth/register**
- Register new user
- Body: `{ firstName, lastName, email, phone, password, confirmPassword }`

**POST /api/auth/login**
- User login
- Body: `{ email, password }`
- Returns: JWT token

**GET /api/auth/me**
- Get current user profile (protected)

**POST /api/auth/logout**
- User logout (protected)

**POST /api/auth/change-password**
- Change password (protected)

**POST /api/auth/forgot-password**
- Request password reset
- Body: `{ email }`

**POST /api/auth/reset-password**
- Reset password with token
- Body: `{ resetToken, password }`

### User Endpoints

**GET /api/users/profile**
- Get user profile (protected)

**PUT /api/users/profile**
- Update profile (protected)

**GET /api/users**
- Get all users (admin/librarian only)
- Query params: `page, limit, role, status, search`

**GET /api/users/:id**
- Get user by ID (admin/librarian only)

**PUT /api/users/:id/status**
- Update user status (admin only)

**PUT /api/users/:id/suspend**
- Suspend user (admin only)

**PUT /api/users/:id/activate**
- Activate user (admin only)

**DELETE /api/users/:id**
- Delete user (admin only)

### Book Endpoints

**GET /api/books**
- Get all books with pagination
- Query params: `page, limit, category, author, status, search`

**POST /api/books**
- Create new book (librarian/admin only)

**GET /api/books/:id**
- Get book details

**PUT /api/books/:id**
- Update book (librarian/admin only)

**DELETE /api/books/:id**
- Delete book (librarian/admin only)

**GET /api/books/search**
- Search books
- Query params: `q, limit`

**GET /api/books/popular**
- Get top borrowed books

**GET /api/books/stats**
- Get book statistics

### Borrow Endpoints

**POST /api/borrow/borrow**
- Borrow a book (librarian/admin only)

**POST /api/borrow/return**
- Return a book (librarian/admin only)

**POST /api/borrow/renew**
- Renew book borrow

**GET /api/borrow/my-books**
- Get user's active borrows

**GET /api/borrow/my-history**
- Get user's borrowing history

**GET /api/borrow/overdue**
- Get overdue books (admin/librarian only)

### Fine Endpoints

**GET /api/fines/my-fines**
- Get user's fines

**POST /api/fines/:id/pay**
- Pay fine
- Body: `{ amount, paymentMethod, transactionId }`

**POST /api/fines/:id/waive**
- Waive fine (admin only)

### Dashboard Endpoints

**GET /api/dashboard/stats**
- Get dashboard statistics (admin only)

**GET /api/dashboard/transactions**
- Get recent transactions (admin only)

**GET /api/dashboard/users/stats**
- Get user statistics (admin only)

**GET /api/dashboard/borrow/stats**
- Get borrow statistics (admin only)

**GET /api/dashboard/fines/stats**
- Get fine statistics (admin only)

### Category Endpoints

**GET /api/categories**
- Get all categories

**POST /api/categories**
- Create category (admin only)

**GET /api/categories/:id**
- Get category details

**PUT /api/categories/:id**
- Update category (admin only)

**DELETE /api/categories/:id**
- Delete category (admin only)

## 🗄️ Database Schema

### Users Collection
```
{
  firstName: String,
  lastName: String,
  email: String (unique),
  phone: String,
  address: Object,
  role: String (admin/librarian/student),
  status: String (active/inactive/suspended),
  membershipId: String (unique),
  password: String (hashed),
  profileImage: String,
  membershipExpiryDate: Date,
  emailVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Books Collection
```
{
  title: String,
  author: String,
  isbn: String (unique),
  category: ObjectId,
  publisher: String,
  publishedYear: Number,
  language: String,
  totalCopies: Number,
  availableCopies: Number,
  borrowedCopies: Number,
  damagedCopies: Number,
  shelfLocation: Object,
  barcode: String,
  qrCode: String,
  coverImage: String,
  replacementCost: Number,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

### BorrowRecords Collection
```
{
  user: ObjectId,
  book: ObjectId,
  borrowDate: Date,
  dueDate: Date,
  returnDate: Date,
  status: String (active/returned/overdue),
  renewalCount: Number,
  fine: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Fines Collection
```
{
  borrowRecord: ObjectId,
  user: ObjectId,
  book: ObjectId,
  daysOverdue: Number,
  totalFineAmount: Number,
  paidAmount: Number,
  status: String (unpaid/paid/partially_paid/waived),
  paymentDate: Date,
  createdAt: Date
}
```

### Categories Collection
```
{
  name: String (unique),
  description: String,
  slug: String,
  icon: String,
  color: String,
  bookCount: Number,
  isActive: Boolean,
  createdAt: Date
}
```

## 🔐 Authentication & Authorization

### JWT Token Structure
```
Header: { alg: "HS256", typ: "JWT" }
Payload: {
  id: "userId",
  iat: 1234567890,
  exp: 1234654290
}
```

### Role-Based Access Control
- **Admin**: Full access to all features
- **Librarian**: Manage books, issue/return books, manage users
- **Student/User**: Browse books, borrow books, view own profile

## 🛠️ Key Technologies

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **Express Validator** - Request validation

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Redux Toolkit** - State management
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Yup** - Validation schema

## 📊 Sample API Responses

### Login Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "student",
      "membershipId": "LIB2024ABC123"
    },
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### Books List Response
```json
{
  "success": true,
  "message": "Books retrieved",
  "data": {
    "books": [
      {
        "_id": "...",
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "isbn": "978-0-7432-7356-5",
        "availableCopies": 3,
        "totalCopies": 5,
        "status": "available"
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 250,
    "pages": 25
  }
}
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/library_management
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_password
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Library Management System
```

## 📦 Installation & Setup

See [SETUP.md](./docs/SETUP.md) for detailed setup instructions.

## 📖 Features

See [FEATURES.md](./docs/FEATURES.md) for complete feature list.

## 🐳 Docker Deployment

```bash
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Backend API on port 5000
- Frontend on port 5173

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📝 License

MIT License - see LICENSE file for details

## 👥 Contributors

Your Name - Initial work

## 📧 Support

For support, email support@library-mgmt.com or open an issue on GitHub.

---

**Happy Reading! 📚**
