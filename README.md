# Remotiva — Professional Freelance Marketplace

Remotiva is a web-based freelance marketplace platform designed to connect clients with skilled freelancers for digital services. The platform provides service discovery, category browsing, authentication, order management, saved services, messaging, and user profile management.

The project is built with a modern full-stack architecture using React for the frontend, Go for the backend API, and MySQL as the relational database.

---

## Overview

Remotiva is inspired by professional freelance marketplace platforms such as Fiverr and Upwork, while maintaining its own original product direction, interface, and system flow.

The application focuses on providing a clean marketplace experience, including:

- Service discovery by category
- Professional service listing cards
- Freelancer and service details
- User authentication using JWT
- Saved services
- Order management
- Profile and preference management
- Responsive user interface

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router |
| UI Icons | Lucide React Icons |
| Backend | Go `net/http` |
| Database | MySQL |
| Authentication | JWT |
| Architecture | Clean Layered Architecture |
| Database Name | `remotiva_db` |

---

## Project Structure

```bash
remotiva/
├── backend/
│   ├── cmd/
│   │   └── api/
│   │       └── main.go
│   └── internal/
│       ├── config/
│       ├── db/
│       ├── domain/
│       ├── http/
│       ├── repository/
│       └── security/
│
├── frontend/
│   ├── public/
│   │   └── assets/
│   └── src/
│       ├── components/
│       │   ├── layout/
│       │   ├── marketplace/
│       │   └── ui/
│       ├── lib/
│       └── pages/
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── docs/
│   └── PRD.md
│
├── docker-compose.yml
├── README.md
└── PRD.md
