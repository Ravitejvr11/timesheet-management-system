# Timesheet Management System

## Overview

The Timesheet Management System is a full-stack enterprise-style
application designed to manage projects, track weekly timesheets,
enforce approval workflows, and generate managerial reports.

This system was built with scalability, maintainability, and clean
architecture principles in mind. It demonstrates strong separation of
concerns, structured layering, automated testing, and modern frontend
state management practices.

------------------------------------------------------------------------

## Architecture Overview

### Backend -- Clean Architecture (.NET)

The backend follows Clean Architecture principles and is divided into
the following layers:

-   Timesheet.API\
-   Timesheet.Application\
-   Timesheet.Domain\
-   Timesheet.Infrastructure

------------------------------------------------------------------------

## Layer Responsibilities

### Domain Layer

-   Core business entities\
-   Enums (e.g., TimesheetStatus)\
-   Business models without external dependencies

### Application Layer

-   DTOs (Request/Response models)\
-   Service interfaces and implementations\
-   Business rules and validation\
-   Mapping logic\
-   Application-level workflows

### Infrastructure Layer

-   Entity Framework Core\
-   DbContext configuration\
-   Repository implementations\
-   JWT authentication handling\
-   Database persistence logic

### API Layer

-   Controllers\
-   Middleware\
-   Dependency injection setup\
-   Authentication and authorization configuration\
-   Swagger configuration

------------------------------------------------------------------------

## Authentication and Authorization

Authentication is implemented using JWT (JSON Web Tokens).

Flow:

1.  User logs in and receives a JWT token.\
2.  Token includes a userId claim.\
3.  Middleware validates the token.\
4.  Controllers extract user claims.\
5.  Role-based authorization controls access to endpoints.

The system ensures:

-   Employees can create and submit timesheets.\
-   Managers can approve or reject timesheets.\
-   Only authorized users can access specific project data.

------------------------------------------------------------------------

## Core Features

### Project Management

-   Create and manage projects.\
-   Assign users to projects.\
-   Filter projects by status.\
-   Restrict visibility based on user assignment.

### Timesheet Management

-   Weekly timesheet creation.\
-   HH:mm time format validation.\
-   24-hour maximum daily validation.\
-   Draft → Submitted → Approved → Rejected lifecycle.\
-   Automatic UI locking for approved timesheets.\
-   Manager-based approval workflow.

### Reports

-   Monthly reports.\
-   Manager-specific filtered reports.\
-   Aggregated billable and non-billable hours.

------------------------------------------------------------------------

## Unit Testing and Quality Assurance

The application includes dedicated unit test coverage for core business
logic, particularly for:

-   Project business rules and validations.\
-   Timesheet lifecycle transitions and status management.\
-   Authorization and ownership validations.\
-   Edge cases such as invalid status transitions and rule violations.

Unit tests focus on validating the Application layer independently from
infrastructure concerns. Business rules are tested in isolation to
ensure correctness, maintainability, and regression safety.

Testing approach:

-   Mocked dependencies using test doubles.\
-   Validation of both success and failure scenarios.\
-   Coverage for approval workflow rules.\
-   Protection against invalid state transitions.

This ensures that critical business workflows remain stable and reliable
as the application evolves.

------------------------------------------------------------------------

## Database and Persistence

-   Entity Framework Core (Code-First approach).\
-   Proper entity relationships and foreign key constraints.\
-   Enum-based status management.\
-   Separation of DbContext within Infrastructure layer.

------------------------------------------------------------------------

## Frontend -- Angular with NgRx

-   Standalone components.\
-   Feature-based folder structure.\
-   Reactive Forms.\
-   NgRx for predictable state management.\
-   HTTP Interceptors for token handling.\
-   Route guards for protected navigation.

------------------------------------------------------------------------

## State Management Flow (NgRx)

1.  Component dispatches an action.\
2.  Effect calls the API.\
3.  Success action is dispatched.\
4.  Reducer updates the store.\
5.  UI reacts automatically to state changes.

This ensures a single source of truth, immutable state updates, and
predictable application behavior.

------------------------------------------------------------------------

## Technology Stack

### Backend

-   .NET 8\
-   ASP.NET Core Web API\
-   Entity Framework Core\
-   JWT Authentication\
-   AutoMapper\
-   xUnit / NUnit for unit testing

### Frontend

-   Angular\
-   NgRx\
-   RxJS\
-   TypeScript\
-   SCSS

------------------------------------------------------------------------

## Running the Application

### Backend

    dotnet restore
    dotnet run --project Timesheet.API

### Frontend

    npm install
    ng serve

------------------------------------------------------------------------

## For Testing

### Managers
1. User Name -  Ravi (Password) - Manager1@123
2. User Name - Tej (Password) - Manager2@123

### Employees
1.User Name -  Arya (Password) - Password@123  (Manager) - Ravi
2.User Name -  Bruce (Password) - Password@123  (Manager) - Ravi
3.User Name -  Jamie (Password) - Password@123  (Manager) - Ravi
4.User Name -  John (Password) - Password@123  (Manager) - Tej
5.User Name -  Tony (Password) - Password@123  (Manager) - Tej

------------------------------------------------------------------------

## Note

To run the project locally you need a connection string.

No credentials are exposed in settings. You need to configure it using:

    dotnet user-secrets

Please request the connection string separately.

------------------------------------------------------------------------

## Conclusion

This project demonstrates structured architectural thinking, clean
separation of responsibilities, real-world workflow implementation,
automated business logic validation through unit testing, and full-stack
ownership. It reflects production-ready development practices and
scalable application design.
