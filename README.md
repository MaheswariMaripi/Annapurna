# Annapurna — MERN Food Rescue & Redistribution Platform

Connects **Donors** (restaurants/individuals with surplus food) to **Volunteers** (who pick up and deliver)
and **NGOs/Shelters** (who receive it), with an **Admin** overseeing verification and stats.

## Tech Stack
- Backend: Node.js, Express, MongoDB (Mongoose), JWT auth, Multer (image upload)
- Frontend: React 18 + Vite, React Router, Axios, Recharts (analytics charts)

## Features Implemented
- JWT auth with 4 roles: donor, volunteer, ngo, admin
- Donation lifecycle: pending → accepted → picked_up → delivered → received
- Auto-computed urgency tags (urgent / today / later) based on expiry time
- Image upload for donation photos
- Geolocation-based "near me" filtering for volunteers (Haversine distance)
- NGO verification workflow (admin approves/rejects)
- Admin can suspend/reactivate any account
- Rating system (donor/volunteer/NGO can rate each other after completion)
- Admin analytics dashboard: totals, top volunteers chart, pending verifications

## Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env    # then edit MONGO_URI / JWT_SECRET as needed
npm run dev             # starts on http://localhost:5000
```
Requires a running MongoDB instance (local `mongod` or a MongoDB Atlas connection string in `.env`).

### 2. Frontend
```bash
cd frontend
npm install
npm run dev             # starts on http://localhost:5173
```
The Vite dev server proxies `/api` and `/uploads` to the backend on port 5000, so no CORS config is needed in dev.

### 3. Try it out
1. Register as a **donor** → post a donation (with photo + best-before time).
2. Register as a **volunteer** → see it appear under "Available Donations" → Accept → Mark Picked Up → Mark Delivered.
3. Register as an **ngo** → note it starts "pending" verification.
4. Register as an **admin** (just pick "admin" isn't in the UI dropdown on purpose — see note below) → approve the NGO → NGO can now confirm receipt.

> **Note:** The registration form only exposes donor/volunteer/ngo roles (admin accounts shouldn't be self-serve).
> To create your first admin, either:
> - Temporarily add `<option value="admin">Admin</option>` to `Register.jsx`, register, then remove it, **or**
> - Register as any role, then manually edit that user's `role` field to `"admin"` directly in MongoDB (e.g. via `mongosh` or MongoDB Compass).

## Folder Structure
```
foodrescue/
├── backend/
│   ├── config/db.js
│   ├── models/User.js, Donation.js
│   ├── middleware/auth.js, roleCheck.js, upload.js
│   ├── controllers/authController.js, donationController.js, userController.js
│   ├── routes/authRoutes.js, donationRoutes.js, userRoutes.js
│   ├── utils/generateToken.js, distance.js
│   └── server.js
└── frontend/
    └── src/
        ├── api/axios.js
        ├── context/AuthContext.jsx
        ├── components/Navbar.jsx, DonationCard.jsx, ProtectedRoute.jsx
        └── pages/Home, Login, Register, DonorDashboard, VolunteerDashboard, NGODashboard, AdminDashboard
```

## Not Yet Built (good next steps)
- Real-time updates via Socket.io (currently uses manual refetch after actions)
- Email/push notifications
- In-app chat between donor and volunteer
- Badge/gamification logic (schema field exists, no auto-award logic yet)
- Cloudinary for production image storage (currently local disk via Multer)
