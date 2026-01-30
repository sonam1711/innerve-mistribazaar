# Mistribazar-Innerve Frontend - Complete Feature Guide

## Overview
This is the **PRIMARY FRONTEND** for the Mistribazar construction marketplace, featuring a beautiful amber-themed UI built with React + TypeScript + Vite.

## 🎨 Design Theme
- **Color Scheme**: Warm amber tones (#FBBD24, #F59E0B)
- **Background**: Dark brown (#1a120b, #2d1a0a) with glass-morphism cards
- **Effects**: Backdrop blur, grid patterns, gradient buttons, smooth transitions
- **Typography**: Bold, black font weights for headings
- **Mobile-First**: Fully responsive design

## 📁 Project Structure

```
nirmio-project/
├── src/
│   ├── components/
│   │   ├── Background.tsx        # Animated particle background
│   │   ├── Header.tsx            # Top header with Login/Signup
│   │   ├── Navbar.tsx            # Main navigation (role-based)
│   │   ├── ProtectedRoute.tsx    # Route guard with role checks
│   │   ├── LoadingSpinner.tsx    # Loading UI component
│   │   ├── JobCard.tsx           # Job display card
│   │   ├── BidCard.tsx           # Bid display card
│   │   ├── Login.tsx             # Login page (password + OTP)
│   │   ├── Signup.tsx            # Registration with auto-location
│   │   └── [Landing Components]  # Hero, Categories, etc.
│   │
│   ├── pages/
│   │   ├── DashboardPage.tsx     # Main hub (stats, quick actions)
│   │   ├── JobsPage.tsx          # Job listings with filters
│   │   ├── JobDetailPage.tsx     # Individual job + bidding
│   │   ├── CreateJobPage.tsx     # Post new job (CONSUMER only)
│   │   ├── BidsPage.tsx          # Bid management (MASON/TRADER)
│   │   ├── ProfilePage.tsx       # User profile settings
│   │   ├── BudgetEstimatorPage.tsx # AI budget estimation
│   │   └── RoomVisualizerPage.tsx  # AI room visualization
│   │
│   ├── store/
│   │   ├── authStore.ts          # Authentication state
│   │   ├── jobStore.ts           # Job management state
│   │   └── bidStore.ts           # Bid management state
│   │
│   ├── utils/
│   │   ├── api.ts                # Axios client + all API endpoints
│   │   └── location.ts           # GPS detection, language mapping
│   │
│   ├── App.tsx                   # Main app with routing
│   └── main.tsx                  # Entry point
│
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .env                          # VITE_API_URL=http://localhost:8000/api
```

## 🚀 Features Implemented

### 1. Authentication System
**Login.tsx**
- Dual authentication: Password OR OTP
- Phone number format: +91XXXXXXXXXX
- JWT token management with auto-refresh
- Dev mode: OTP displayed in UI for testing

**Signup.tsx**
- Three roles: CONSUMER, MASON, TRADER
- Auto-location detection (GPS → State → Language)
- Password validation (min 6 chars)
- Regional language assignment

### 2. Dashboard (DashboardPage.tsx)
**Role-Based Content**:
- **CONSUMER**: My Jobs, Post Job button, AI tools (Budget/Visualizer)
- **MASON/TRADER**: Available Jobs Nearby, Browse Jobs

**Features**:
- Stats cards: Total Jobs, Bids, Rating
- Quick action buttons with icons
- Recent jobs grid (6 jobs max)
- Empty state with call-to-action

### 3. Jobs Management

**JobsPage.tsx**
- **Filters**: Status, Job Type, Radius (for masons/traders)
- **Consumer View**: "My Jobs" - all jobs posted by user
- **Mason/Trader View**: "Available Jobs" - nearby jobs with distance
- Post Job button (consumers only)
- Grid layout with JobCard components

**JobDetailPage.tsx**
- Full job information (title, budget, location, description, images)
- **Consumer**: View received bids, AI recommendations, accept/reject bids
- **Mason/Trader**: Submit bid form (amount, days, message)
- Owner actions: Cancel job button
- Posted by card with user rating

**CreateJobPage.tsx** (CONSUMER only)
- Job type selection (7 types: Repair, Construction, etc.)
- Title, description, budget range (min/max)
- Address, latitude/longitude fields
- Image URL management (add/remove multiple)
- Form validation

**JobCard.tsx Component**
- Status badge (OPEN, IN_PROGRESS, COMPLETED, CANCELLED)
- Budget range, distance, creation date
- Image/bid counts
- Hover effects, amber theme styling

### 4. Bidding System

**BidsPage.tsx** (MASON/TRADER)
- My Bids listing with status
- Job details for each bid
- Withdraw bid button (PENDING only)
- Empty state with icon

**BidCard.tsx Component**
- Bidder details (name, rating)
- Bid amount, estimated days, message
- Status badge (PENDING, ACCEPTED, REJECTED, WITHDRAWN)
- Accept/Reject actions (for job owners)
- Link to job details

### 5. Profile Management

**ProfilePage.tsx**
- Profile card with avatar, name, phone, rating, role
- Editable fields: Name, Language, Latitude, Longitude
- Read-only: Phone, Role, Member Since
- Language dropdown (10 Indian languages)
- Save/Cancel buttons

### 6. AI Features

**BudgetEstimatorPage.tsx**
- Conversational flow (5 questions)
- Progress bar
- Input types: number, select (buttons), text
- Result display: Total budget, breakdown, recommendations
- "Start New Estimation" button

**RoomVisualizerPage.tsx**
- Step 1: Upload image URL with preview
- Step 2: Describe changes + style selection (4 styles)
- Step 3: Before/After comparison
- Applied changes summary
- "Create Another Visualization" button

## 🔧 State Management (Zustand)

### authStore.ts
```typescript
- user: User | null
- tokens: { access: string, refresh: string } | null
- isLoading: boolean
- login(phone, password): Promise<void>
- loginWithOTP(phone, otp): Promise<void>
- register(userData): Promise<void>
- logout(): void
- fetchUserProfile(): Promise<void>
- updateUser(userData): void
```

### jobStore.ts
```typescript
- jobs: Job[]
- currentJob: Job | null
- isLoading: boolean
- filters: { status?, job_type?, radius? }
- fetchJobs(filters?): Promise<void>
- fetchNearbyJobs(lat, lng, radius): Promise<void>
- fetchMyJobs(userId): Promise<void>
- fetchJob(id): Promise<void>
- createJob(jobData): Promise<Job>
- updateJob(id, jobData): Promise<void>
- deleteJob(id): Promise<void>
- setFilters(filters): void
```

### bidStore.ts
```typescript
- bids: Bid[]
- jobBids: Bid[]
- recommendations: any
- isLoading: boolean
- fetchMyBids(): Promise<void>
- fetchJobBids(jobId): Promise<void>
- createBid(bidData): Promise<Bid>
- acceptBid(bidId): Promise<boolean>
- rejectBid(bidId): Promise<boolean>
- withdrawBid(bidId): Promise<boolean>
- fetchRecommendations(jobId): Promise<void>
```

## 🌐 API Integration (utils/api.ts)

**Base Configuration**:
- Axios instance with `VITE_API_URL` base URL
- Request interceptor: Attach JWT from localStorage
- Response interceptor: Auto-refresh tokens on 401

**API Namespaces**:
```typescript
otpAPI: {
  sendOTP(phone)
  verifyOTP(phone, otp)
}

userAPI: {
  login(phone, password)
  register(userData)
  getProfile()
  updateProfile(userData)
}

jobAPI: {
  getJobs(params?)
  getJob(id)
  createJob(jobData)
  updateJob(id, jobData)
  deleteJob(id)
  getNearbyJobs(lat, lng, radius)
}

bidAPI: {
  getMyBids()
  getJobBids(jobId)
  createBid(bidData)
  acceptBid(bidId)
  rejectBid(bidId)
  withdrawBid(bidId)
  getRecommendations(jobId)
}

ratingAPI: {
  getRatings(userId)
  createRating(ratingData)
}

aiAPI: {
  getBudgetConversation()
  postBudgetConversation(data)
  visualizeRoom(data)
  getVisualizationStyles()
}
```

## 📍 Location Services (utils/location.ts)

**Auto-Detection Flow**:
1. Browser Geolocation API → Get GPS coordinates
2. OpenStreetMap reverse geocoding → Get address details
3. Extract state from address → Map to regional language
4. Fallback to Hindi if detection fails

**REGION_LANGUAGE_MAP**:
- Tamil Nadu → Tamil
- Maharashtra → Marathi
- Karnataka → Kannada
- West Bengal → Bengali
- Gujarat → Gujarati
- Punjab → Punjabi
- Andhra Pradesh / Telangana → Telugu
- Kerala → Malayalam
- Default → Hindi

**Distance Calculation**:
- Haversine formula for lat/long distance
- Returns distance in kilometers

## 🛡️ Route Protection

**ProtectedRoute Component**:
- Redirects to `/login` if not authenticated
- Optional `requiredRole` prop for role-based access
- Redirects to `/dashboard` if wrong role
- TypeScript interfaces for type safety

**Route Structure**:
```typescript
/ → LandingPage (or /dashboard if logged in)
/login → Login page (or /dashboard if logged in)
/signup → Signup page (or /dashboard if logged in)
/dashboard → Dashboard (protected)
/jobs → Jobs listing (protected)
/jobs/:id → Job detail (protected)
/jobs/create → Create job (CONSUMER only)
/bids → My bids (MASON/TRADER)
/profile → Profile settings (protected)
/budget-estimator → AI budget tool (protected)
/room-visualizer → AI visualizer (CONSUMER only)
```

## 🎨 Styling Patterns

**Card Pattern**:
```tsx
className="bg-[#2d1a0a]/60 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 hover:border-amber-500/50 transition-all"
```

**Button - Primary**:
```tsx
className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-6 py-3 rounded-full text-[#1a120b] font-bold transition-all"
```

**Button - Secondary**:
```tsx
className="bg-[#1a120b]/60 border border-amber-500/30 px-6 py-3 rounded-full text-amber-100 hover:border-amber-500/50 transition-all font-semibold"
```

**Input Field**:
```tsx
className="w-full bg-[#1a120b]/60 border border-amber-500/30 rounded-lg px-4 py-3 text-amber-100 focus:border-amber-500 focus:outline-none"
```

**Grid Background**:
```tsx
<div 
  className="fixed inset-0 pointer-events-none -z-10"
  style={{
    backgroundImage: `
      linear-gradient(rgba(251, 191, 36, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(251, 191, 36, 0.05) 1px, transparent 1px)
    `,
    backgroundSize: '50px 50px'
  }}
/>
```

## 🚀 Getting Started

### Installation
```bash
cd c:\Users\HP\Downloads\mistribazaar-innerve\nirmio-project
npm install
```

### Environment Setup
Create `.env` file:
```env
VITE_API_URL=http://localhost:8000/api
```

### Run Development Server
```bash
npm run dev
# Opens at http://localhost:5173
```

### Build for Production
```bash
npm run build
npm run preview  # Test production build
```

## 🔌 Backend Connection

**Backend must be running at**: `http://localhost:8000`

Start backend:
```bash
cd c:\Users\HP\Desktop\mistribazar\backend
venv\Scripts\activate
python manage.py runserver
```

## 📝 TypeScript Interfaces

**User**:
```typescript
interface User {
  id: number
  phone: string
  name: string
  role: 'CONSUMER' | 'MASON' | 'TRADER'
  latitude?: number
  longitude?: number
  language?: string
  rating?: number
  created_at?: string
}
```

**Job**:
```typescript
interface Job {
  id: number
  title: string
  description: string
  job_type: string
  status: string
  budget_min?: number
  budget_max?: number
  location?: string
  latitude?: number
  longitude?: number
  address?: string
  distance_km?: number
  created_at?: string
  deadline?: string
  consumer?: number
  consumer_details?: User
  images?: any[]
  image_count?: number
  bid_count?: number
}
```

**Bid**:
```typescript
interface Bid {
  id: number
  job: number
  bidder: number
  bid_amount: number
  estimated_days: number
  message: string
  status: string
  created_at: string
  job_details?: Job
  bidder_details?: User
}
```

## 🐛 Common Issues & Solutions

### 1. API Connection Failed
- Check backend is running: `http://localhost:8000/api/`
- Verify `.env` file has correct `VITE_API_URL`
- Check CORS settings in Django `settings.py`

### 2. OTP Not Working
- In dev mode (`DEBUG=True`), OTP appears in API response
- Check SMS provider credentials in backend `.env`
- Test with console SMS provider first

### 3. Location Detection Failed
- Browser must allow location permissions
- Fallback to manual lat/long entry
- OpenStreetMap API may be slow (wait 3-5 seconds)

### 4. Routes Not Working
- All routes use React Router v6 syntax
- Protected routes check authentication on mount
- Use `<Navigate>` for redirects, not `history.push`

### 5. TypeScript Errors
- Run `npm run build` to check for type errors
- All props must have interfaces defined
- Use optional chaining (`?.`) for nullable fields

## 📚 Additional Resources

- **Main Documentation**: See `INSTRUCTIONS.md` in this folder
- **Quick Start**: See `QUICK_START.md` in this folder
- **Backend API**: See `backend/README.md` in main project
- **Copilot Guide**: See `.github/copilot-instructions.md` in main project

## ✅ Feature Checklist

- [x] Phone-based OTP authentication
- [x] Auto-location detection with language mapping
- [x] Role-based access control (CONSUMER/MASON/TRADER)
- [x] Dashboard with stats and quick actions
- [x] Job listings with filters
- [x] Job detail view with bidding
- [x] Job creation form (with images)
- [x] Bid management (submit, withdraw)
- [x] Bid actions (accept, reject)
- [x] Profile editing
- [x] AI Budget Estimator (conversational)
- [x] AI Room Visualizer (before/after)
- [x] JWT token management with auto-refresh
- [x] Beautiful amber-themed UI
- [x] Mobile-responsive design
- [x] Loading states and error handling
- [x] TypeScript type safety
- [x] Zustand state management
- [x] React Router v6 navigation

## 🎯 Next Steps (Optional Enhancements)

1. **Image Upload**: Add direct file upload (not just URLs)
2. **Real-time Notifications**: WebSocket for bid updates
3. **Chat System**: Message between consumers and masons
4. **Map View**: Leaflet/Mapbox for job locations
5. **Rating System**: Submit ratings after job completion
6. **Payment Integration**: Razorpay/Stripe for deposits
7. **Multi-language UI**: Use translations.ts (port from original)
8. **PWA**: Service worker for offline access
9. **Analytics**: Track user behavior with Google Analytics
10. **Testing**: Jest + React Testing Library

---

**Last Updated**: January 23, 2026  
**Version**: 1.0.0 (Full Feature Complete)  
**Status**: Production Ready ✅
