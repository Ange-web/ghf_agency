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
2. **Utilisateur inscrit**: Réserve des places/tables, participe aux concours, soumet des photos
3. **Admin**: Gère les événements, concours, galerie, modère les photos utilisateurs

## Core Requirements (Static)
- [x] Splash screen avec logo GHF_AGENCY
- [x] Design premium dark + rose néon + or
- [x] Hero section immersive
- [x] Countdown timer pour événements
- [x] Galerie masonry avec filtrage et téléchargement
- [x] Système de réservation standard
- [x] Page concours
- [x] Authentification JWT
- [x] Profil utilisateur avec historique réservations
- [x] Responsive mobile-first

## Phase 2 - Implemented (2026-03-31)
- [x] **Page Admin** pour gestion complète
  - Création/suppression d'événements avec options tables
  - Création/suppression de concours
  - Modération des photos utilisateurs (approuver/rejeter)
  - Vue des réservations standards et tables
- [x] **Page Détail Événement** (/events/:id)
  - Informations complètes de l'événement
  - Countdown timer
  - Options de réservation (Standard, Table Promo, Table VIP)
- [x] **Réservation Tables Promo** (/tables/promo)
  - Formulaire dédié avec inclusions listées
  - Confirmation visuelle
- [x] **Réservation Tables VIP** (/tables/vip)
  - Expérience premium avec design doré
  - Inclusions VIP détaillées
- [x] **Upload Photos Utilisateurs**
  - Modal de soumission dans la galerie
  - Suivi du statut des soumissions
  - Workflow de modération admin

## API Endpoints
### Auth
- POST /api/auth/register, login, logout, refresh
- GET /api/auth/me
- PUT /api/auth/profile

### Events
- GET /api/events, /api/events/{id}
- POST /api/events (admin)
- PUT /api/events/{id} (admin)
- DELETE /api/events/{id} (admin)

### Reservations
- POST /api/reservations
- GET /api/reservations/my
- DELETE /api/reservations/{id}

### Tables
- POST /api/tables/reserve
- GET /api/tables/my
- DELETE /api/tables/{id}

### Gallery & Photos
- GET /api/gallery
- POST /api/gallery (auth)
- DELETE /api/gallery/{id}
- POST /api/photos/submit (user submission)
- GET /api/photos/pending (admin)
- GET /api/photos/all (admin)
- PUT /api/photos/{id}/approve (admin)
- GET /api/photos/my

### Contests
- GET /api/contests, /api/contests/{id}
- POST /api/contests (admin)
- DELETE /api/contests/{id} (admin)
- POST /api/contests/{id}/participate

### Admin
- GET /api/admin/stats
- GET /api/admin/reservations
- GET /api/admin/table-reservations

## Test Credentials
- Admin: admin@ghfagency.com / GHFAdmin2024!

## Prioritized Backlog

### P0 (Done)
- Core event website MVP
- Admin dashboard
- Table reservations
- User photo submissions with moderation

### P1 (Next Phase)
- Google Drive integration for media sync
- Google OAuth social login
- Email notifications for reservations
- Payment integration (Stripe)

### P2 (Future)
- Push notifications
- Event QR codes for check-in
- User-generated content reviews
- Analytics dashboard
