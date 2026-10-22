# Fornada RS Web

A web application I'm building for **Fornada RS**, my godfather's artisan bread and cuca business in southern Brazil. The goal is to let customers browse products, view photos and prices, put together an order, and continue the conversation with the business on WhatsApp.

This is my first web project built around a real business need. I'm using it to put my Java studies into practice and understand how a frontend, a Spring Boot backend, and a PostgreSQL database work together.

> **Status:** In development. The features below describe the planned scope and will be updated as implementation progresses.

## Why I built this

I wanted my first project to be something useful that someone could actually use. Building a website for my godfather's business gave me a concrete problem to work on: making product information easier to find and helping customers organize an order before contacting the business.

It also gives me a reason to go beyond isolated programming exercises. I'm learning how to turn business requirements into application behavior, expose data through a REST API, handle HTTP requests, and store information in a relational database.

## Stack

- **Java** — application logic and object-oriented programming.
- **Spring Boot** — backend development and REST API.
- **PostgreSQL** — relational data storage.
- **HTTP and JSON** — communication between the frontend and backend.
- **Git and GitHub** — version control and development history.

The frontend stack and exact dependency versions will be documented as development progresses.

## Planned features

- Product catalog with photos, descriptions, and prices.
- Shopping bag with product selection and quantity adjustments.
- Order summary with selected items, quantities, and a calculated total.
- WhatsApp link with a prefilled message containing the order details.
- Responsive interface for mobile and desktop users.
- REST API backed by PostgreSQL to provide and persist catalog data.

The initial WhatsApp flow opens a conversation with a prepared message. Customers send the message themselves, and the business confirms availability, payment, and pickup or delivery details.

Automated messaging through the WhatsApp Business API is outside the initial scope.

## How ordering will work

1. The customer browses the catalog.
2. They select products and quantities.
3. The website displays an order summary.
4. They choose to continue on WhatsApp.
5. WhatsApp opens with a prefilled order message.
6. The customer sends the message, and the business confirms the details.

## Backend approach

The planned backend structure separates HTTP handling, business rules, and database access:

- **Controllers** handle incoming requests and API responses.
- **Services** implement business rules.
- **Repositories** handle persistence operations.
- **Entities** represent the data stored in the database.
- **DTOs** define request and response data where needed.

I'm keeping the design focused on the needs of the first version and learning the purpose of each layer as I implement it.

## What I'm learning

- Applying core Java and object-oriented programming to a web application.
- Building REST endpoints with Spring Boot.
- Understanding HTTP methods, status codes, requests, and responses.
- Using JSON to exchange data between the client and server.
- Modeling relational data and integrating PostgreSQL.
- Validating input and handling application errors.
- Connecting a frontend to a backend API.
- Documenting and versioning a project as it evolves.

## Current state

The project is in its early development stages. The initial focus is the backend foundation and the product catalog, followed by the customer interface and the WhatsApp order flow.

The features above describe the intended first version rather than completed functionality. API endpoints, screenshots, and setup instructions will be added as the relevant parts are implemented and validated.

## Running it locally

Local setup instructions will be added once the application configuration has been validated, including:

- Required Java version.
- PostgreSQL setup and connection configuration.
- Build and run commands.
- Available API endpoints.

## Author

**Luciano Alves**

Software Engineering student learning Java and backend development through a project for a real business.
