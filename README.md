# Training Management System

A full-stack portfolio project for managing training programs, tracks, students, attendance, grades, and operational reporting through one web application.

This repository is a **sanitized public portfolio version** of a broader private implementation. It contains only generic application code and configuration. Organization-specific planning, internal documents, real user data, and private project history are intentionally excluded.

## Tech Stack

**Backend**
- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- JWT authentication
- Role-based access control
- Swagger / OpenAPI
- Docker

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand
- Axios

## Included Modules

- Authentication and role-based access
- Users
- Programs
- Tracks
- Students and enrollments
- CSV student import
- Attendance
- Grades and evaluations
- Reports and KPI-oriented views

## Architecture

```text
training-management-system/
├── backend/            # NestJS REST API
├── frontend/           # React/Vite client
├── docs/               # Public architecture notes
├── docker-compose.yml
├── package.json
└── README.md
```

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the backend

Copy the example environment file:

```bash
cp backend/.env.example backend/.env
```

Replace the example JWT secrets before running outside local development.

### 3. Start PostgreSQL and the API

```bash
npm run docker:up
```

Or run the backend directly:

```bash
npm run start:backend
```

### 4. Start the frontend

```bash
npm run start:frontend
```

The frontend uses `VITE_API_URL` when provided and otherwise targets the local API.

## Security & Data Note

- No real student, staff, or organization data is included.
- No production credentials are included.
- `.env` files are ignored.
- Example configuration values are placeholders only.
- This is an MVP/portfolio codebase and should receive a full security review before production deployment.

## Portfolio Scope

The repository demonstrates full-stack system design across:

- REST API design
- relational data modeling
- authentication and authorization
- CSV-based administrative workflows
- frontend state management and protected routing
- Docker-based local setup

## Author

**Eman Barakat**

Software Development | Training Operations | AI & Digital Transformation
