# GHF Agency - Product Requirements Document

## Original Problem Statement
Site web événementiel moderne, créatif et immersif avec design mobile-first premium orienté nightlife/luxe.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Framer Motion + React Fast Marquee
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **Auth**: JWT with bcrypt password hashing
- **Design**: Dark theme (#050505) + Pink neon (#FF2A85) + Gold (#D4AF37)

## User Personas
1. **Visiteur**: Découvre les événements, parcourt la galerie
2. **Utilisateur inscrit**: Réserve des places, participe aux concours, accède au profil
3. **Admin**: Gère les événements, concours, galerie, voit les statistiques

## Core Requirements (Static)
- [x] Splash screen avec logo GHF_AGENCY
- [x] Design premium dark + rose néon + or
- [x] Hero section immersive
- [x] Countdown timer pour événements
- [x] Galerie masonry avec filtrage
- [x] Système de réservation
- [x] Page concours
- [x] Authentification JWT
- [x] Profil utilisateur avec historique réservations
- [x] Responsive mobile-first

## What's Been Implemented (2026-03-31)
### Backend
- Auth endpoints (register, login, logout, me, refresh, profile update)
- Events CRUD with filtering and categories
- Reservations with spot management
- Gallery with event filtering
- Contests with participation tracking
- Testimonials
- Admin stats endpoint
- Seed data for events, gallery, contests, testimonials

### Frontend
- Splash screen with animated logo
- Glassmorphism header with mobile menu
- Hero section with parallax background
- Featured event card with countdown timer
- Events grid with search and filter
- Masonry gallery with lightbox and download
- Booking form with event selection
- Contests page with participation
- Profile page with reservation management
- Auth modal (login/register)
- Footer with social links
- Full responsive design

## Prioritized Backlog

### P0 (Done)
- Core event website MVP

### P1 (Next Phase)
- Google Drive integration for media sync
- Google OAuth social login
- Admin dashboard UI
- Email notifications for reservations

### P2 (Future)
- Push notifications
- Payment integration (Stripe)
- User-generated content uploads
- Event QR codes for check-in

## Test Credentials
- Admin: admin@ghfagency.com / GHFAdmin2024!

## API Endpoints
- POST /api/auth/register, login, logout, refresh
- GET /api/auth/me
- PUT /api/auth/profile
- GET /api/events, /api/events/{id}
- POST /api/events (admin)
- POST /api/reservations
- GET /api/reservations/my
- DELETE /api/reservations/{id}
- GET /api/gallery
- POST /api/gallery (auth)
- DELETE /api/gallery/{id}
- GET /api/contests, /api/contests/{id}
- POST /api/contests (admin)
- POST /api/contests/{id}/participate
- GET /api/testimonials
- POST /api/testimonials (auth)
- GET /api/admin/stats (admin)
