# WorkEase – Local Worker Booking System

A production-ready full-stack MERN application that connects users with verified local service providers for home and local services. The platform enables users to discover nearby workers, book services, make secure online payments, communicate in real-time, and track booking progress, while providing dedicated dashboards for workers and administrators.

---

## Live Demo
https://work-ease-local-worker-booking-syst.vercel.app/

---

## Overview

WorkEase is designed to simplify the process of hiring trusted local workers by providing a secure and user-friendly booking platform. The application supports multiple user roles, real-time communication, secure authentication, online payments, location-based services, and administrative management.

The project follows modern React development practices by integrating Redux Toolkit, TanStack Query, React Hook Form, and Yup while maintaining a scalable full-stack architecture.

---

## Key Features

### Authentication & Authorization

- Secure JWT Authentication
- Cookie-Based Authentication
- Password Encryption using bcryptjs
- Role-Based Authorization
- Protected Routes
- Persistent User Sessions

---

### User Features

- User Registration & Login
- Update Profile
- Search Local Workers
- Browse Categories
- View Worker Profiles
- Book Services
- Booking History
- Cancel Bookings
- Submit Reviews & Ratings
- Real-Time Notifications
- Real-Time Chat
- Live Booking Updates

---

### Worker Features

- Worker Registration
- Profile Management
- Upload Identity & Profile Images
- Service Pricing Management
- Accept or Reject Bookings
- Booking History
- Earnings Dashboard
- Real-Time Booking Updates

---

### Admin Features

- Dashboard Analytics
- Worker Verification
- User Management
- Booking Management
- Category Management
- Review Monitoring
- Platform Statistics

---

### Payment Features

- Razorpay Payment Gateway Integration
- Cash on Delivery (COD)
- Payment Status Tracking
- Booking Confirmation

---

### Real-Time Features

- Socket.IO Integration
- Real-Time Chat
- Booking Status Updates
- Instant Notifications

---

### Location Features

- HTML5 Geolocation API
- React Leaflet Maps
- OSRM Route Integration
- Worker Location Tracking

---

### Media Management

- Cloudinary Image Upload
- Secure File Storage
- Worker Identity Verification

---

## Technology Stack

### Frontend

- React.js
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Redux Toolkit
- TanStack Query
- React Hook Form
- Yup
- Axios
- Framer Motion
- React Leaflet
- Recharts
- Lucide React

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- Socket.IO
- Multer
- Cloudinary
- Razorpay
- Cookie Parser
- CORS

### Tools

- Git
- GitHub
- Docker
- Postman
- Vercel
- Render

---

## Project Structure

```
WorkEase
│
├── frontend
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   ├── features
│   │   ├── hooks
│   │   ├── layouts
│   │   ├── pages
│   │   ├── routes
│   │   ├── schemas
│   │   ├── services
│   │   ├── store
│   │   ├── types
│   │   └── utils
│   └── package.json
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   ├── sockets
│   ├── utils
│   └── package.json
│
└── README.md
```

---

## System Architecture

```
                    React + TypeScript
                           │
          Redux Toolkit + TanStack Query
                           │
                 React Hook Form + Yup
                           │
                         Axios
                           │
                    Express.js API
                           │
        ┌──────────────┬───────────────┐
        │              │               │
    MongoDB       Socket.IO      Cloudinary
        │              │               │
        └──────────────┼───────────────┘
                       │
                   Razorpay
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/workease.git
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

### Backend

```bash
cd backend

npm install

npm run dev
```

---

## Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=

MONGO_URI=

JWT_SECRET=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

RAZORPAY_KEY_ID=

RAZORPAY_KEY_SECRET=

CLIENT_URL=
```

---

## API Modules

- Authentication
- Users
- Workers
- Categories
- Bookings
- Reviews
- Notifications
- Messages
- Dashboard
- Payments

---

## Frontend Architecture

The frontend follows a modular and scalable architecture.

- Feature-Based Folder Structure
- Redux Toolkit for Global State
- TanStack Query for Server State
- React Hook Form for Forms
- Yup Schema Validation
- Reusable Components
- Protected Routes
- Service Layer using Axios
- TypeScript Interfaces
- Custom Hooks

---

## Security Features

- JWT Authentication
- Role-Based Authorization
- Password Hashing
- Secure Cookies
- Protected API Routes
- Request Validation
- Image Upload Validation

---

## Performance Optimizations

- Redux Toolkit
- TanStack Query Caching
- Lazy Loading
- Code Splitting
- React Memoization
- Optimized Component Rendering
- Reusable Hooks
- Schema Validation
- Optimized API Calls

---

## Future Enhancements

- Push Notifications
- Progressive Web App (PWA)
- AI-Based Worker Recommendation
- Email Notifications
- Multi-Language Support
- Unit & Integration Testing
- Advanced Analytics
- Mobile Application

---

## Author

**Sanket Wani**

Full Stack MERN Developer

GitHub: https://github.com/Sanket-wani-08

LinkedIn: https://www.linkedin.com/in/sanket-wani-1a494221a/

---

## License

This project is developed for educational and portfolio purposes.
