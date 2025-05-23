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
├── client/              # React frontend
│   ├── src/            # Source code
│   │   ├── components/ # UI components
│   │   ├── contexts/   # React contexts
│   │   ├── hooks/      # Custom hooks
│   │   ├── layouts/    # Page layouts
│   │   ├── pages/      # Page components
│   │   └── services/   # API services
│   ├── public/         # Static assets
│   └── dist/           # Build output
└── server/             # Express backend
    ├── src/            # Source code
    │   ├── middleware/ # Express middleware
    │   ├── routes/     # API routes
    │   └── services/   # Business logic
    ├── prisma/         # Database schema
    └── dev-server.js   # Development server
```

## Deployment Instructions

### Frontend Deployment (Netlify)

1. Build the client application:
   ```bash
   cd client
   npm run build
   ```

2. Deploy to Netlify using one of these methods:

   **Option 1: Netlify CLI**
   ```bash
   # Install Netlify CLI if not already installed
   npm install -g netlify-cli
   
   # Login to Netlify
   netlify login
   
   # Deploy the site
   netlify deploy --prod
   ```

   **Option 2: Netlify UI**
   - Go to [Netlify](https://app.netlify.com/)
   - Drag and drop the `client/dist` folder
   - Configure site settings

   **Option 3: Connect to GitHub**
   - Push your code to GitHub
   - Connect your repository to Netlify
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`

### Backend Deployment (Heroku/Render)

1. Create a new application on Heroku or Render

2. **For Heroku:**
   ```bash
   # Install Heroku CLI if not already installed
   npm install -g heroku
   
   # Login to Heroku
   heroku login
   
   # Create a new Heroku app
   heroku create auto-repair-api
   
   # Add the remote to your git repository
   cd server
   git init
   heroku git:remote -a auto-repair-api
   
   # Push to Heroku
   git add .
   git commit -m "Initial deployment"
   git push heroku main
   ```

3. **For Render:**
   - Go to [Render](https://render.com/)
   - Create a new Web Service
   - Connect your GitHub repository
   - Configure build settings:
     - Build command: `npm install`
     - Start command: `npm run start-dev-server`

4. Update the frontend API configuration in `client/netlify.toml` to point to your deployed backend URL

## Local Development
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
