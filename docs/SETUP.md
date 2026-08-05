# Setup Guide

## Prerequisites

- Node.js >= 16.0.0
- MongoDB >= 4.4 (local or MongoDB Atlas)
- npm or yarn package manager
- Git

## Step 1: Clone Repository

```bash
git clone <repository-url>
cd library-management-system
```

## Step 2: Backend Setup

### Install Dependencies
```bash
cd backend
npm install
```

### Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/library_management
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@library-management.com
```

### Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Using Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**MongoDB Atlas (Cloud):**
1. Create account at mongodb.com/cloud
2. Create cluster
3. Get connection string
4. Update MONGODB_URI in .env

### Seed Database (Optional)
```bash
npm run seed
```

### Start Backend Development Server
```bash
npm run dev
```

Server will run on `http://localhost:5000`

## Step 3: Frontend Setup

### Install Dependencies
```bash
cd ../frontend
npm install
```

### Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` file:
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Library Management System
VITE_LOG_LEVEL=debug
```

### Start Frontend Development Server
```bash
npm run dev
```

Frontend will open at `http://localhost:5173`

## Step 4: Verify Installation

### Check Health Endpoint
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

### Test Login
1. Go to http://localhost:5173/login
2. Register a new account or use demo credentials
3. Access dashboard after login

## Database Setup

### Manual Database Creation (Optional)

```bash
mongosh mongodb://localhost:27017

use library_management

db.createCollection("users")
db.createCollection("books")
db.createCollection("categories")
db.createCollection("borrow_records")
db.createCollection("fines")
db.createCollection("audit_logs")
```

### Create Indexes
```bash
db.users.createIndex({ email: 1 })
db.users.createIndex({ membershipId: 1 })
db.books.createIndex({ isbn: 1 })
db.books.createIndex({ title: "text", author: "text" })
db.borrow_records.createIndex({ user: 1, status: 1 })
```

## Docker Setup (Optional)

### Build and Run with Docker Compose
```bash
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Backend API on port 5000
- Frontend on port 5173

### View Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop Services
```bash
docker-compose down
```

## Development Workflow

### Backend
1. Make changes in `backend/src/`
2. Server auto-reloads with nodemon
3. Check console for errors

### Frontend
1. Make changes in `frontend/src/`
2. Browser auto-refreshes with Vite HMR
3. Check browser console for errors

## Testing

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

## Build for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

Outputs to `frontend/dist/` directory.

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify connection string format

### Port Already in Use
```bash
# Linux/Mac
lsof -i :5000  # Find process on port 5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### CORS Error
- Check FRONTEND_URL in backend .env
- Ensure CORS middleware is configured

### Email Not Sending
- Enable less secure apps in Gmail (if using Gmail)
- Use app password instead of account password
- Check SMTP credentials in .env

## First Time Setup Checklist

- [ ] Clone repository
- [ ] Install Node.js
- [ ] Install MongoDB
- [ ] Setup backend (.env file)
- [ ] Install backend dependencies
- [ ] Setup frontend (.env file)
- [ ] Install frontend dependencies
- [ ] Start MongoDB
- [ ] Start backend server
- [ ] Start frontend server
- [ ] Create test account
- [ ] Verify health endpoint

## Next Steps

1. Read the [Features Guide](./FEATURES.md)
2. Review [API Documentation](./API.md)
3. Check example requests in docs
4. Deploy to production

## Support

For issues or questions:
1. Check console logs
2. Review error messages
3. Check troubleshooting section
4. Open GitHub issue

---

Happy coding! 🚀
