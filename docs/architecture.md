# Architecture Document

## Overview
This project is a construction equipment allocation system designed to handle equipment bookings, maintenance scheduling, conflict detection, and override workflows. It is implemented as a full-stack web application with a FastAPI backend and a React frontend.

## Components

### 1. Frontend
- Built with React + TypeScript + Vite
- Provides dashboards, booking forms, fleet views, conflict history, and override controls
- Communicates with the backend through the API client in the frontend codebase

### 2. Backend
- Built with FastAPI
- Handles authentication, booking creation, maintenance scheduling, equipment queries, and conflict resolution
- Uses SQLAlchemy ORM with SQLite for persistence

### 3. Scheduler and conflict engine
- Uses Google OR-Tools CP-SAT
- Resolves conflicts by comparing priorities, current bookings, maintenance windows, and transport-buffer constraints
- Supports shift-aware logic for morning, afternoon, and full-day bookings

### 4. Data model
- Users: managers and site engineers
- Sites: physical project locations
- Equipment: machine inventory
- Bookings: equipment assignments with start/end dates, priority, status, and shift
- MaintenanceLog: scheduled maintenance windows that block bookings

## Data flow
1. A user logs in from the React app.
2. The frontend calls the backend API with a bearer token.
3. The backend validates the user and checks authorization.
4. Booking requests are validated for date logic and equipment existence.
5. Maintenance and booking conflicts are checked.
6. The scheduler either approves the booking or displaces lower-priority bookings.
7. Approved results are stored in SQLite and returned to the UI.

## Technology choices
- FastAPI: fast API development, built-in validation, and easy async-friendly backend structure
- SQLAlchemy: object-relational mapping for a compact relational model
- SQLite: lightweight database suitable for local assessment deployment
- OR-Tools CP-SAT: optimization for conflict scheduling and priority-based resource allocation
- React + Vite: efficient UI development and simple local running workflow

## Security and correctness checks
- Password hashing is used before storing user credentials
- JWT-based authentication controls access to protected routes
- Role checks restrict maintenance creation and override operations to managers
- Input validation prevents invalid date ranges and missing equipment
- Maintenance windows and transport buffers prevent unsafe or impossible scheduling

## Why this architecture fits the problem
The system is small but operationally realistic: a resource-allocation problem with priority logic, conflict rules, and operational constraints. The separation of frontend, API, scheduler, and persistence keeps the logic understandable and makes iterative AI-driven feature changes easier to test and correct.
