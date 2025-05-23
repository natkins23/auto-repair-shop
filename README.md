# Auto Repair Shop Booking System

A full-stack application for an auto repair shop with a customer-facing booking site and an admin dashboard.

## Features

### Customer Portal
- Landing page with service information
- Google authentication
- Car management ("My Garage")
- Multi-step booking flow
- Booking confirmations

### Admin Dashboard
- Booking management
- Status updates
- Customer notifications via SMS

## Tech Stack

- **Frontend**: React 18 + Vite, TypeScript, Tailwind CSS
- **Authentication**: Firebase Auth (Google OAuth)
- **Backend**: Node.js 20, Express 4 (REST API), Prisma ORM
- **Database**: SQLite (dev), PostgreSQL (production)
- **Payments**: Stripe (test mode)
- **SMS**: Twilio

## Project Structure

```
auto_ws/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API client and services
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript type definitions
│   ├── public/             # Static assets
│   └── ...
└── server/                 # Backend Express application
    ├── src/
    │   ├── controllers/    # Route handlers
    │   ├── middleware/     # Express middleware
    │   ├── routes/         # API route definitions
    │   ├── services/       # Business logic
    │   └── utils/          # Utility functions
    ├── prisma/             # Prisma schema and migrations
    └── ...
```

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd client
   npm install

   # Install backend dependencies
   cd ../server
   npm install
   ```

3. Set up environment variables:
   - Create `.env` files in both `client` and `server` directories
   - See `.env.example` files for required variables

4. Initialize the database:
   ```bash
   cd server
   npx prisma migrate dev
   ```

5. Start the development servers:
   ```bash
   # Start backend server
   cd server
   npm run dev

   # In another terminal, start frontend
   cd client
   npm run dev
   ```

6. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## License

MIT
