# Auth Page Notes

## Overview

Auth pages (Login & Register) have been redesigned to provide a professional, clean experience matching Remotiva's freelance marketplace branding.

## Design Direction

### Split Layout
- **Desktop**: 45% hero branding | 55% form
- **Tablet**: 40% hero | 60% form
- **Mobile**: Stacked layout (hero on top, form below)

### Hero Panel (Left)
- **Background**: Primary blue gradient (`#2D76FF` → `#1F5ED8`)
- **Logo**: 80px centered with brand name below
- **Tagline**: Professional copy describing the platform
- **Decorations**: Subtle glowing circles (not phone mockups)

### Form Panel (Right)
- **Background**: White (`#FFFFFF`)
- **Input Style**: 48px height, 12px border-radius, 1.5px border
- **Focus State**: Blue border + soft blue shadow
- **Button**: Full-width, primary blue, 48px height
- **Error State**: Red text with left border accent

## Components

### Login Page
```
URL: /auth/login
Fields: Email, Password
Button: "Masuk"
Link: "Belum punya akun? Daftar sekarang"
```

### Register Page
```
URL: /auth/register
Fields: Nama lengkap, Email, Password, Role (dropdown)
Button: "Daftar"
Link: "Sudah punya akun? Masuk"
Terms: Links to ToS and Privacy Policy
```

## CSS Classes Used

| Class | Purpose |
|-------|---------|
| `.auth-container` | Main layout grid |
| `.auth-hero` | Left branding panel |
| `.auth-hero-inner` | Centered content wrapper |
| `.auth-hero-logo` | Logo + brand name |
| `.auth-hero-content` | Title + description |
| `.auth-hero-decoration` | Glow effects container |
| `.auth-glow` | Animated glow circles |
| `.auth-form-panel` | Right form container |
| `.auth-form-card` | Form card wrapper |
| `.auth-form-header` | Form heading + subtitle |
| `.btn-auth` | Auth submit button |
| `.auth-footer` | Bottom link section |
| `.auth-terms` | Terms text |

## Responsive Behavior

### Desktop (>1024px)
- Split 45/55 layout
- Logo 80px
- Full tagline visible

### Tablet (768-1024px)
- Split 40/60 layout
- Logo scales down slightly
- Tagline font size reduced

### Mobile (<768px)
- Stacked layout
- Hero becomes 280px header
- Logo 56px
- Shorter tagline
- Full-width form

## Implementation Notes

- No hardcoded demo credentials
- Indonesian language throughout
- Password toggle eye icon
- Proper autoComplete attributes
- Loading state on submit
- Error messages in Indonesian
- No phone mockups or awkward images

## Files

- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/Register.jsx`
- `frontend/src/styles.css` (auth section)
