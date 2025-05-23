# Auto Repair Shop Backend

This is the backend server for the Auto Repair Shop application. It provides API endpoints for authentication, car management, and booking operations.

## Features

- Authentication with Firebase (with mock implementation for development)
- Car management (CRUD operations)
- Booking management
- Mock data for development and testing

## Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev-server
   ```

3. The server will be available at http://localhost:3001/api

## Deployment

### Render (Recommended)

1. Sign up for a Render account at [render.com](https://render.com) if you don't have one already

2. From your Render dashboard, click on "New" and select "Web Service"

3. Connect your GitHub repository or use the public URL option

4. Configure the service with the following settings:
   - **Name**: auto-repair-shop-server (or any name you prefer)
   - **Root Directory**: server
   - **Environment**: Node
   - **Region**: Choose the region closest to your users
   - **Branch**: main (or your default branch)
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm run start-dev-server`
   - **Plan**: Free (or select a paid plan if you need more resources)

5. Add the following environment variables under the "Environment" section:
   - `PORT`: Leave empty (Render will provide this)
   - `NODE_ENV`: production
   - `DATABASE_URL`: For a simple deployment, you can use SQLite with `file:./dev.db` or set up a PostgreSQL database using Render's database service
   - `JWT_SECRET`: Generate a secure random string (you can use [randomkeygen.com](https://randomkeygen.com/))
   - Other variables from your .env file as needed (Firebase, Stripe, etc.)

6. Click "Create Web Service"

7. Render will automatically build and deploy your application. This may take a few minutes.

8. Once deployed, your API will be available at the URL provided by Render (e.g., https://auto-repair-shop-server.onrender.com)

9. Update your frontend configuration to use this URL for API calls

### Heroku

1. Create a new app on Heroku
2. Deploy using Heroku CLI:
   ```
   heroku login
   heroku git:remote -a your-app-name
   git subtree push --prefix server heroku main
   ```
   
3. Or deploy using GitHub integration:
   - Connect your GitHub repository
   - Set the root directory to `server`
   - Configure automatic deployments

## API Endpoints

- **Authentication**: `/api/auth/google`, `/api/auth/verify`, `/api/auth/me`
- **Cars**: `/api/cars`, `/api/cars/:id`
- **Bookings**: `/api/bookings`, `/api/bookings/:id`, `/api/bookings/status`
- **Repair History**: `/api/repair-history`
- **Admin**: `/api/admin/bookings`, `/api/admin/cars`
