# Fire Handling System

A comprehensive fire department management system with role-based access control, inventory management, staff management, and more.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Complete user registration, login, and role management
- **Staff Management**: Fire department staff records and information
- **Inventory Management**: Equipment and supply tracking
- **Finance Management**: Budget and expense tracking
- **Records Management**: Incident and attendance records
- **Prevention Management**: Fire prevention and training programs
- **Dashboard**: Real-time system overview and analytics

## 🏗️ Project Structure

```
fire_handling_System/
├── backend/
│   ├── server/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   └── authControllers.js
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js
│   │   │   └── roleMiddleware.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Role.js
│   │   │   ├── Staff.js
│   │   │   ├── Inventory.js
│   │   │   └── ... (other models)
│   │   ├── routes/
│   │   │   └── authRoutes.js
│   │   ├── app.js
│   │   ├── server.js
│   │   └── package.json
│   └── seed.js
└── FrontEnd/
    └── client/
        ├── src/
        │   ├── components/
        │   ├── pages/
        │   ├── services/
        │   ├── utils/
        │   └── App.jsx
        └── package.json
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd backend/server
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create environment file:**
   Create a `.env` file in the `backend/server` directory with the following variables:

   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/fire_handling_system
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-this-in-production
   ACCESS_TOKEN_EXP=15m
   REFRESH_TOKEN_EXP=7d
   FRONTEND_URL=http://localhost:5173
   BCRYPT_SALT_ROUNDS=12
   ```

4. **Start MongoDB:**
   Make sure MongoDB is running on your system.

5. **Seed the database:**

   ```bash
   npm run seed
   ```

6. **Start the server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd FrontEnd/client
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create environment file:**
   Create a `.env` file in the `FrontEnd/client` directory:

   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🔐 User Roles

The system supports the following roles with different access levels:

1. **CFO (Chief Fire Officer)** - Full system access
2. **1st Class Officer** - Operational management access
3. **Finance Manager** - Financial management access
4. **Record Manager** - Records and documentation access
5. **Inventory Manager** - Equipment and supply management
6. **Training Session Manager** - Training program management
7. **Prevention Manager** - Fire prevention programs
8. **Fighter** - Basic access level

## 🚨 Default Users

After running the seed script, the following default users will be created:

- **CFO**: cfo@firedept.com / password123
- **Finance Manager**: finance@firedept.com / password123
- **Record Manager**: records@firedept.com / password123

## 📝 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info
- `GET /api/auth/roles` - Get available roles

### Health Check

- `GET /api/health` - API health status

## 🔧 Development

### Running in Development Mode

```bash
# Backend
cd backend/server
npm run dev

# Frontend
cd FrontEnd/client
npm run dev
```

### Building for Production

```bash
# Frontend
cd FrontEnd/client
npm run build
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**

   - Ensure MongoDB is running
   - Check the MONGO_URI in your .env file

2. **Port Already in Use**

   - Change the PORT in your .env file
   - Kill processes using the default port

3. **JWT Token Errors**

   - Ensure JWT_SECRET and JWT_REFRESH_SECRET are set
   - Check token expiration settings

4. **CORS Errors**
   - Verify FRONTEND_URL in backend .env file
   - Check that frontend is running on the correct port

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions, please contact the development team.
