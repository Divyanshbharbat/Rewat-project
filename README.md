# SchoolERP - MERN Stack Project

A comprehensive School Management System built with the MERN stack (MongoDB, Express, React, Node.js).

## Features
- **Role-Based Dashboards**: Tailored interfaces for Admins, Teachers, and Students.
- **Real-Time Data**: All dashboard metrics, schedules, and activities are fetched live from the database.
- **Authentication**: Secure JWT-based authentication with role-based access control.
- **Premium UI**: Designed with a sleek, "Glow B Shine" aesthetic using Lucide icons and modern CSS.

## Tech Stack
- **Frontend**: React, Lucide React, CSS Variables
- **Backend**: Node.js, Express, Mongoose, JWT
- **Database**: MongoDB

## Screenshots
### Admin Dashboard
- Tracks student/teacher counts and recent system activities.
### Teacher Dashboard
- Manages class schedules and pending assignments.
### Student Dashboard
- Monitors grades, attendance, and upcoming deadlines.

## Setup
1. Clone the repository.
2. Install dependencies for both client and server: `npm install`.
3. Set up environment variables in `.env` (MONGO_URI, JWT_SECRET, PORT).
4. Run the seed script: `node seed.js` in the server folder.
5. Start the development servers: `npm run dev`.
