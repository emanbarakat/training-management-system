# Public Architecture Overview

This public repository contains a generic full-stack training management application.

## Backend

The NestJS API is organized by domain modules:

- Authentication and users
- Programs and tracks
- Students and enrollments
- Attendance sessions and records
- Grades and evaluations
- Reporting

TypeORM maps the domain entities to PostgreSQL. Authentication uses JWT access and refresh tokens, with route guards for authentication and role-based authorization.

## Frontend

The React/Vite client provides:

- Authentication
- Protected routes
- Program and track management
- Student administration
- CSV import workflow
- Dashboard navigation

Axios is used for API calls and Zustand stores client authentication state.

## Data Boundaries

The public repository contains no real operational data. Any local data used while developing or demonstrating the application should be synthetic.

## Production Hardening

Before production use, the project would need deployment-specific security review, managed secrets, production cookie/token policy, database migrations, automated tests, monitoring, and CI/CD.
