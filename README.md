# Remotiva - Professional Freelance Marketplace
Remotiva is a professional freelance marketplace web platform that connects clients with skilled freelancers for digital services. The platform features a modern, responsive design inspired by leading freelance marketplaces like Fiverr and Upwork.

## Tech Stack
- **Frontend**: React + Vite, React Router, Lucide React Icons
- **Backend**: Python, Clean layered architecture
- **Database**: MySQL
- **Database Name**: `remotiva_db`

## Project Structure

```
remotiva/
├── backend/
│   ├── cmd/api/          # Entry point
│   └── internal/
│       ├── config/       # Environment configuration
│       ├── db/           # Database connection
│       ├── domain/       # Data models
│       ├── http/         # API handlers & routing
│       ├── repository/   # Data access layer
│       └── security/     # JWT & password handling
├── frontend/
│   ├── public/assets/    # Static assets
│   └── src/
│       ├── components/   # Reusable components
│       │   ├── layout/  # Shell, Navbar, Footer
│       │   ├── marketplace/ # Service cards, filters
│       │   └── ui/      # Buttons, inputs, badges
│       ├── lib/          # API client
│       └── pages/        # Page components
├── database/
│   ├── schema.sql        # Database schema
│   └── seed.sql          # Sample data
└── docs/
    └── PRD.md            # Product requirements
```


## Development Notes

- Frontend uses React Router for navigation
- JWT tokens stored in localStorage
- API base URL configured via `VITE_API_URL` environment variable
- All protected routes require authentication
- Backend uses clean layered architecture (domain → repository → http)
