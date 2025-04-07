# Telehealth Platform

A full-stack telehealth application that allows patients to connect with healthcare providers through secure video consultations.

## Features

- User authentication and authorization (patients, doctors, admins)
- Appointment scheduling and management
- Secure video consultations
- Chat functionality during video calls
- User profile management
- Responsive design for all devices

## Tech Stack

### Backend
- Go with Gin framework
- PostgreSQL for data storage
- GORM as ORM
- JWT for authentication
- Air for hot-reloading during development

### Frontend
- React with Next.js
- Material-UI for UI components
- Context API for state management
- Axios for API requests

### Infrastructure
- Docker for containerization
- Docker Compose for multi-container applications

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/adrianmcmains/telehealth-platform.git
cd telehealth-platform
```

2. Start the application using Docker Compose:
```bash
docker-compose up
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - API Health Check: http://localhost:8080/health

## Development

### Backend

The backend is built with Go using the Gin framework. It follows a standard MVC-like architecture:

- `controllers/`: Request handlers
- `models/`: Data models and database interactions
- `middleware/`: JWT authentication and request middleware
- `routes/`: API route definitions
- `config/`: Configuration for database, etc.

To run the backend separately:

```bash
cd backend
go run main.go
```

### Frontend

The frontend is built with Next.js and Material-UI. It follows a component-based architecture:

- `src/components/`: Reusable UI components
- `src/pages/`: Next.js pages
- `src/contexts/`: React Context providers
- `src/services/`: API service functions

To run the frontend separately:

```bash
cd frontend
npm install
npm run dev
```

## Database Migrations

Database migrations are handled automatically by GORM. When the server starts, it will create the necessary tables based on the model definitions.

## API Documentation

### Authentication

- `POST /api/v1/auth/register`: Register a new user
- `POST /api/v1/auth/login`: Login and get JWT token
- `GET /api/v1/auth/me`: Get current user information

### Users

- `GET /api/v1/users/:id`: Get user by ID
- `PUT /api/v1/users/:id`: Update user
- `GET /api/v1/users/doctors`: Get all doctors

### Appointments

- `POST /api/v1/appointments`: Create a new appointment
- `GET /api/v1/appointments`: Get user's appointments
- `GET /api/v1/appointments/:id`: Get appointment by ID
- `PUT /api/v1/appointments/:id`: Update appointment

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Gin Web Framework](https://github.com/gin-gonic/gin)
- [GORM](https://gorm.io/)
- [React](https://reactjs.org/)
- [Next.js](https://nextjs.org/)
- [Material-UI](https://mui.com/)