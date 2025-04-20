Stepful Coaching Platform

Project Structure
stepful-coaching/
├── docker-compose.yml          # Docker configuration for all services
├── .env                        # Environment variables
├── backend/                    # Backend Node.js/Express application
│   ├── Dockerfile              # Backend Docker configuration
│   ├── package.json            # Backend dependencies
│   ├── tsconfig.json           # TypeScript configuration
│   ├── src/
│   │   ├── index.ts            # Main application entry point
│   │   ├── config/             # Application configuration
│   │   ├── controllers/        # Route controllers
│   │   ├── models/             # Database models
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   ├── types/              # TypeScript type definitions
│   │   └── utils/              # Utility functions
│   └── db/
│       └── migrations/         # Database migrations
│           └── init.sql        # Initial database schema
└── frontend/                   # Frontend React application
    ├── Dockerfile              # Frontend Docker configuration
    ├── package.json            # Frontend dependencies
    ├── tsconfig.json           # TypeScript configuration
    ├── index.html              # HTML entry point
    ├── public/                 # Static assets
    └── src/
        ├── main.tsx            # Main React entry point
        ├── App.tsx             # Root React component
        ├── components/         # Reusable components
        ├── contexts/           # React contexts
        ├── pages/              # Page components
        ├── services/           # API services
        ├── types/              # TypeScript type definitions
        └── utils/              # Utility functions


Database Schema
Users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('coach', 'student')),
  created_at TIMESTAMP DEFAULT NOW()
)

Slots (
  id SERIAL PRIMARY KEY,
  coach_id INTEGER REFERENCES Users(id) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  student_id INTEGER REFERENCES Users(id),
  satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)


Summary of the Stepful Coaching Platform
I've built a complete full-stack scheduling application for Stepful's coaching sessions that satisfies all the requested user stories. Here's an overview of what's been implemented:
Core Features

Coach Availability Management

Coaches can add 2-hour slots of availability to their calendars
Each slot can be booked by exactly one student


View Upcoming Slots

Coaches can view their own upcoming availability slots
Slots show whether they're booked or available


Booking System

Students can browse and book available slots with any coach
Students can filter available slots by coach


Contact Information

When a slot is booked, both student and coach can view each other's phone numbers
Contact details are only visible for booked sessions


Session Feedback

After completing a call, coaches can record:

Student satisfaction (integer 1-5)
Free-form notes about the session


Session History

Coaches can review all their past sessions
Includes satisfaction scores and notes for each session


User Switching

Easy switching between coach and student roles for testing
Can also switch between different users within each role



Technology Stack

Frontend: React with TypeScript, React Router, Context API, and TailwindCSS
Backend: Node.js/Express with TypeScript, Sequelize ORM
Database: PostgreSQL with well-structured schema
Containerization: Docker and Docker Compose for easy setup and deployment

Project Structure
The application follows a clean, modular architecture with:

Separate frontend and backend containers
Structured backend with controllers, routes, models, and services
Component-based frontend with shared components and page-specific components
Context-based state management for user information

Database Design
The database has two main tables:

users: Stores coaches and students with their contact information
slots: Stores coaching slots with booking status, feedback, and relationships to users

To get started with the application, simply run docker-compose up and the application will be available at http://localhost:3000 with the API at http://localhost:3001. The database is automatically initialized with sample users for immediate testing.
