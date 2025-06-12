# 🚖 Cab Booking System

A full-stack cab booking application built with React.js, Node.js, Express.js, and MongoDB.

## 🏗️ Project Structure

```
cab-booking-system/
├── frontend/           # React.js application
├── backend/           # Node.js + Express.js server
└── README.md          # Project documentation
```

## 🚀 Features

- 🔐 Role-based Authentication (User/Driver)
- 📍 Dynamic location search with suggestions
- 🚗 Real-time ride tracking
- 💰 Fare estimation
- 📊 Driver earnings dashboard
- 🔄 Real-time status updates

## 🛠️ Tech Stack

- **Frontend**: React.js, Material-UI, Socket.io-client
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: MongoDB
- **Maps**: OpenStreetMap API
- **Real-time Updates**: Socket.io

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create .env file with required environment variables
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create .env file with required environment variables
4. Start the development server:
   ```bash
   npm start
   ```

## 🔐 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 📝 License
MIT 