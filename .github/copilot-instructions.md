# Mistribazar Codebase Guide for AI Agents

## Project Overview
Mistribazar is a construction marketplace connecting consumers with masons/traders through role-based authentication, location-based discovery, bidding system, and AI features (budget estimation, 3D house modeling, room visualization).

**Architecture**: Django REST API (backend) + React/Vite SPA (frontend)

**Tech Stack**:
- Backend: Django 4.2.7 + DRF + SimpleJWT + PostgreSQL/SQLite + Gemini API
- Frontend: React 18 + TypeScript + Vite 7 + React Router 6 + Zustand 4 + Tailwind CSS 3
- Features: Phone OTP auth, location-based search (Haversine), multi-language (10 Indian languages with live location detection), AI-powered 3D house designer with Blender script generation

**Frontend Structure**: 
- **Primary Frontend**: `frontend-new/` - TypeScript React app (ACTIVELY MAINTAINED)
  - Complete implementation with all backend features
  - Multi-language support (10 Indian languages) with live location-based detection and language switcher
  - Real-time GPS location detection using browser Geolocation API
  - Real-time updates synchronized with backend/database changes
  - MISTRI job acceptance workflow (separate from bidding)
  - Rating system fully integrated
- Legacy: `src/` - Original JavaScript version, `mistribazaar-innerve/` - alternative builds
- Always work in `frontend-new/` unless specifically told otherwise

## Critical Architecture Patterns

### 1. Role-Based Access Control (RBAC)
Four roles define all interactions: `CONSUMER`, `CONTRACTOR`, `TRADER`, `MISTRI`

**Backend**: Custom permission classes in `backend/users/permissions.py`
- Use `IsConsumer`, `IsMason`, `IsMasonOrTrader` decorators on views
- Example: Only consumers create jobs, contractors/traders bid on PROJECTS, mistri accept/reject JOBS
- Stack multiple permissions: `[IsAuthenticated, IsConsumer]` for enforcement
- Custom auth backend in `backend/users/backends.py` handles phone-based login
```python
permission_classes = [IsAuthenticated, IsConsumer]
```

**Frontend**: Routes protected via `ProtectedRoute` component with role checks
- User role stored in Zustand auth store (`frontend-new/src/store/authStore.ts`) with localStorage persistence
- ProtectedRoute enforces `requiredRole` parameter on sensitive routes like CreateJobPage
- **MISTRI vs CONTRACTOR**: MISTRI directly accept/reject small jobs (no bidding), CONTRACTOR bid on large projects

### 2. Phone-Based Authentication with OTP
Custom authentication using phone numbers (no email/username)

**Key Files**:
- `backend/users/models.py`: Custom `User` model with `phone` as `USERNAME_FIELD`
- `backend/users/otp_manager.py`: OTP generation/verification with rate limiting
  - 6-digit OTPs, 10-minute expiry
  - Max 5 requests/hour, 3 verification attempts
  - Cache-based storage (Django cache framework)
- `backend/users/sms_service.py`: SMS integration abstraction (MSG91/Twilio)

**Development Note**: In `DEBUG=True` mode, OTP is returned in API response for testing. Remove this in production!

### 3. Location-Based Features
All users have `latitude`/`longitude` (DecimalField with 6 decimal places) for proximity-based job discovery

**Job Discovery**: Backend uses Haversine formula in `backend/jobs/views.py` to calculate distance between user and job locations
- Query parameters: `latitude`, `longitude`, `radius` (default 50km)
- `JobListView.get_queryset()` filters jobs within user's service area
- Queries filter `Job.status='OPEN'` and nearby coordinates before returning
- Example implementation:
```python
# Mason/Trader sees jobs filtered by:
# 1. Status = OPEN
# 2. Distance from their location (or live GPS coordinates)
queryset = queryset.filter(status='OPEN')
latitude = request.query_params.get('latitude', user.latitude)
longitude = request.query_params.get('longitude', user.longitude)
radius_km = request.query_params.get('radius', 50)
# Loop through queryset and calculate distance with Haversine
```
- **Production Note**: Current implementation loops through queryset; use PostGIS for production-scale filtering

**Automatic Location Detection** (implemented in frontend-new):
- Browser Geolocation API → GPS coordinates (supports live location)
- Reverse geocoding → Indian state → regional language  
- Maps states to languages: Tamil Nadu→Tamil, Maharashtra→Marathi, etc.
- Fallback to Hindi if detection fails
- **Live switching**: Users can change language based on current location in real-time

**Data Model**: `Job` and `User` models both store `latitude`/`longitude` fields with database indexes

### 4. Multi-Language Support
UI automatically translates to user's regional language based on registration location

**Translation System** (implemented in `frontend-new/` via context/utilities):
- Supports 10 Indian languages (Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, Bengali, Gujarati, Punjabi, English)
- Usage: `translations[language][key]` for all UI text
- Language stored in `User.language` field during registration
- **Live location switching**: Users can update language based on current GPS location
- Context-based implementation for reactive UI updates

### 5. Zustand State Management (Frontend)
Three primary stores in `frontend-new/src/store/` (TypeScript files with `.ts` extension):
- `authStore.ts`: User authentication, JWT tokens (persisted to localStorage via `persist` middleware)
- `jobStore.ts`: Job listings, filtering with location-based queries
- `bidStore.ts`: Bid management and recommendation integration

**Pattern**: Store methods handle API calls AND state updates in one place
```typescript
login: async (phone: string, password: string) => {
  const response = await userAPI.login(phone, password)
  const { user, tokens } = response.data
  // Store tokens in localStorage
  localStorage.setItem('access_token', tokens.access)
  set({ user, isAuthenticated: true })
}
```

**Data Flow Pattern - How stores work with components**:
1. Component calls `useAuthStore()` or `useJobStore()` hook to get state + methods
2. Store method makes API call via centralized `api.ts` (which attaches JWT token)
3. Store updates Zustand state via `set({ ... })`
4. Component re-renders with new state
5. Toast notifications handle success/error feedback
6. **Real-time sync**: Frontend automatically updates with backend/database changes
7. **Important**: Never call API directly from components - always go through stores or centralized `api.ts`

**localStorage Persistence**:
- `authStore` uses `persist` middleware from Zustand
- Automatically saves `user` and `tokens` to localStorage on state changes
- Automatically restores from localStorage on app load
- **Logout**: Must manually clear tokens with `localStorage.removeItem('access_token')` (done in store's logout method)

### 6. API Architecture
**Centralized Axios Instance** (`frontend-new/src/utils/api.ts`):
- **Request interceptor**: Attaches JWT from localStorage to `Authorization: Bearer <token>` header
  - Automatically sends `Content-Type: application/json` on all requests
  - Silently skips auth header if no token (for public endpoints like login, register)
- **Response interceptor**: Auto-refreshes expired tokens on 401 responses
  - On 401, attempts token refresh with `/api/users/token/refresh/` endpoint
  - Updates `access_token` in localStorage automatically
  - Retries original request with new token
  - If refresh fails, logs out user and redirects to `/login`
- **Base URL**: From `VITE_API_URL` env var (defaults to `http://localhost:8000/api`)
- **Critical**: All API calls MUST go through this instance, never raw `axios` or fetch

**Request/Response Pattern**:
- All responses are JSON with consistent structure
- Errors include `error` or `detail` fields
- Example error handling in components: `error.response?.data?.error || 'Fallback message'`

**Backend URL Pattern**:
- `/api/users/` - User/auth endpoints (register, login, profile, token refresh)
- `/api/jobs/` - Job CRUD + filtering (list, create, nearby, detail, status update)
- `/api/bids/` - Bidding system (list, create, accept, reject)
- `/api/ratings/` - Review system (create, list, user ratings)
- `/api/ai/` - AI features (budget estimator, house designer, recommender)

## Core Data Models & Relationships

### User Model (`backend/users/models.py`)
- **Phone-based**: `phone` field is unique identifier (USERNAME_FIELD)
- **Role field**: Determines access (CONSUMER, MASON, TRADER)
- **Location**: `latitude`/`longitude` (DecimalField, max_digits=9, decimal_places=6)
- **Rating**: Average calculated from reviews, range 0-5

### Job Model (`backend/jobs/models.py`)
- **ForeignKey relationships**:
  - `consumer`: The job poster (CONSUMER role only)
  - `selected_provider`: Winning mason/trader (SET_NULL if unfilled)
- **Status lifecycle**: OPEN → IN_PROGRESS → COMPLETED (or CANCELLED)
- **Budget validation**: `budget_min` and `budget_max` must use DecimalField with 2 decimal places
- **Unique constraints**: Database indexes on `consumer`, `status` for fast filtering

### Bid Model (`backend/bids/models.py`)
- **Unique constraint**: `unique_together = ['job', 'bidder']` → One bid per user per job
- **Status**: PENDING → ACCEPTED/REJECTED/WITHDRAWN
- **ForeignKey**: Links `Job` (CASCADE delete) and `bidder` (MASON/TRADER only)
- **Sorting**: Default ordering by `bid_amount` (ascending), then newest first
- **Validation**: `bid_amount` must be valid Decimal with 2 places

## Development Workflow

### Starting the Application
**Backend** (Windows PowerShell - PRIMARY DEVELOPMENT ENVIRONMENT):
```powershell
cd backend
# Create virtual environment (first time only)
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate          # cmd.exe
# OR
venv\Scripts\Activate.ps1      # PowerShell (may require: Set-ExecutionPolicy RemoteSigned -Scope CurrentUser)

# Install dependencies (first time or after updates)
pip install -r requirements.txt

# Run migrations (first time or after model changes)
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional, for admin access)
python manage.py createsuperuser

# Start development server
python manage.py runserver     # Runs on http://localhost:8000
# Admin panel: http://localhost:8000/admin
# API root: http://localhost:8000/api

# For Windows PowerShell execution policy issue:
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser  # Run once per machine
```

**Frontend**:
```powershell
cd frontend-new
# Install dependencies (first time or after updates)
npm install

# Start development server
npm run dev        # Runs on http://localhost:3000, Vite dev server with HMR

# Other commands
npm run build      # Production build → dist/ folder
npm run preview    # Preview production build locally
npm run lint       # ESLint check
```

**Important**: Always start backend BEFORE frontend to ensure proxy works correctly.

**Development Proxy**: Vite proxies `/api/*` requests to `http://localhost:8000` (configured in `vite.config.js`):
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
  }
}
```
Frontend uses relative paths like `/api/users/login/` during dev. In production, set `VITE_API_URL` env var to full backend URL.

**Testing Strategy**: 
- No automated test suite currently
- Manual testing scripts in `backend/` directory: `test_jobs.py`, `check_locations.py`, `create_test_job.py`
- Run with: `python test_jobs.py` (uses Django ORM with RequestFactory for API simulation)
- Frontend: Manual testing via browser and React DevTools

### Database Migrations
Django apps: `users`, `jobs`, `bids`, `ratings`, `ai_engine`
```bash
python manage.py makemigrations
python manage.py migrate
```

**Important**: Custom User model means migrations depend on `users` app first. Check `migrations/0001_initial.py` dependencies when adding ForeignKeys to User.

**Database Configuration**: 
- Development: SQLite (default, no setup required) - Uses `db.sqlite3` file in backend root
- Production: PostgreSQL (configure via `.env` with `DATABASE_ENGINE=django.db.backends.postgresql`)
- Switch databases via environment variables: `DATABASE_ENGINE`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_HOST`, `DATABASE_PORT`
- Migration command handles both: `python manage.py migrate`

### Testing OTP Flow
1. Send OTP: `POST /api/users/send-otp/` with `{"phone": "+919876543210"}`
2. In dev mode, OTP appears in JSON response: `{"otp": "123456", "success": true}`
3. Verify: `POST /api/users/verify-otp/` with `{"phone": "+919876543210", "otp": "123456"}`
4. **Cache Storage**: OTP stored in Django cache framework (default: Django's local memory cache in dev)
   - For production, configure `CACHES` in `settings.py` to use Redis or Memcached
   - **Development debugging**: OTP rate limiting bypassed if `DEBUG=True` in rapid testing (requires server restart to pick up .env changes)

### Common API Query Patterns

**Job filtering by location and status** (consumers view only open jobs nearby):
```
GET /api/jobs/nearby/?latitude=28.6139&longitude=77.2090&radius=50&status=OPEN
```

**User profile with auth required**:
```
GET /api/users/profile/
Headers: Authorization: Bearer {access_token}
```

**Token refresh endpoint**:
```
POST /api/users/token/refresh/
Body: {"refresh": "{refresh_token}"}
```

**Job status workflow**:
```
PATCH /api/jobs/{id}/status/
Body: {"status": "IN_PROGRESS"}  # or "COMPLETED", "CANCELLED"
```

### JWT Token Lifecycle
- **Access token**: 1 day lifetime (24 hours)
- **Refresh token**: 7 days lifetime
- **Auto-refresh**: Frontend interceptor in `api.js` handles 401 responses automatically
- **Rotation**: Enabled (`ROTATE_REFRESH_TOKENS=True`), blacklists old tokens

## Project-Specific Conventions

### Backend
- **Models**: All use `BigAutoField` as primary key (`id = models.BigAutoField(primary_key=True)`)
- **Serializers**: Separate read/write serializers for complex views (e.g., `JobDetailSerializer` vs `JobCreateSerializer`)
- **Views**: Class-based views with `generics.*View` for REST endpoints (CreateAPIView, ListAPIView, RetrieveUpdateDestroyAPIView)
- **Permissions**: Stack multiple: `[IsAuthenticated, IsConsumer]`
- **Query filtering**: Use `get_queryset()` override in views for role-specific and location-based filtering
  - Example pattern from `JobListView`:
```python
def get_queryset(self):
    queryset = Job.objects.all()
    user = self.request.user
    
    if user.role == 'CONSUMER':
        # Consumers see ONLY their own jobs
        queryset = queryset.filter(consumer=user)
    elif user.role in ['MASON', 'TRADER']:
        # Providers see open jobs near their location
        queryset = queryset.filter(status='OPEN')
        # Apply location filtering...
    
    return queryset
```
- **Pagination**: DRF pagination enabled, 20 items per page by default

### Frontend
- **Routing**: React Router v6 with nested routes in `App.tsx`
- **Forms**: Controlled components with local state, validation before API call
- **Error Handling**: `react-hot-toast` for all user-facing messages
- **Styling**: Tailwind CSS utility classes, mobile-first responsive design
- **Icons**: Lucide React (`lucide-react` package)
- **Build Tool**: Vite with React plugin, ESLint for linting
- **Bundle Command**: `npm run build` → outputs to `dist/` folder
- **TypeScript**: Strict type checking enabled, interfaces in store files
- **Real-time Updates**: Synchronized with backend/database changes (polling/WebSocket)
- **Multi-language**: Context-based with live location detection for language switching

**Frontend Route Structure** (`src/App.tsx`):
- Public routes: `/`, `/login`, `/register`
- Protected routes with `ProtectedRoute` component:
  - `/dashboard` (all authenticated users)
  - `/create-job` (CONSUMER only)
  - `/jobs` (all authenticated)
  - `/bids` (MASON/TRADER only)
  - `/profile` (all authenticated)
  - `/budget-estimator`, `/room-visualizer`, `/3d-house-designer` (AI features, requires auth)
- **Page files**: Each route maps to a page component in `src/pages/`
  - Pages use stores (`authStore`, `jobStore`, `bidStore`) for data fetching
  - Pages handle local form state separately from global stores

### File Naming
- Backend: `snake_case` (Django convention)
- Frontend: `PascalCase` for components (`.tsx`), `camelCase` for utilities (`.ts`)

### Dependencies
**Backend** (`requirements.txt`):
- Django 4.2.7, djangorestframework 3.14.0
- djangorestframework-simplejwt 5.3.0 (JWT auth)
- psycopg2-binary 2.9.9 (PostgreSQL adapter)
- python-decouple 3.8 (env management)
- Pillow 10.1.0 (image processing)
- cloudinary 1.36.0 (image storage)
- django-cors-headers 4.3.0 (CORS)
- geopy 2.4.1 (geocoding), requests 2.31.0

**Frontend** (`package.json`):
- React 18.2.0, react-dom 18.2.0
- Vite 7.3.1 (build tool with HMR)
- React Router 6.20.0 (routing)
- Zustand 4.4.7 (state management)
- Axios 1.6.2 (HTTP client)
- Tailwind CSS 3.3.6 (styling)
- lucide-react 0.294.0 (icons)
- react-hot-toast 2.4.1 (notifications)

## AI Features (Rule-Based)

### Budget Estimator (`backend/ai_engine/budget_estimator.py`)
Conversational flow collecting work type, area, quality, city tier, urgency
- Multi-step API: `POST /api/ai/budget/conversation/` with `{step: 1, data: {...}}`
- Rule-based pricing: area × base_rate × quality_multiplier × city_multiplier

### House Designer (`backend/ai_engine/house_designer.py`)
11-step conversational flow generating complete house layouts
- API: `POST /api/ai/house-design/conversation/` → `POST /api/ai/house-design/generate/`
- Collects: property type, plot area, bedrooms, bathrooms, kitchen, additional rooms, outdoor spaces, floors, style, budget, special requirements
- Generates: floor plans, room-wise area allocation, cost estimates, architectural recommendations
- **Image generation**: Uses PIL to create visual floor plans (base64 encoded PNGs)
- **Special features detection**: Vastu compliance, eco-friendly, smart home from free-text input

### 3D House Designer with Blender (`backend/ai_engine/blender_script_generator.py`)
**Gemini API-powered Blender Python script generation**
- API: `POST /api/ai/3d-house/generate/` → Returns complete Blender Python script
- **Download endpoint**: `GET /api/ai/3d-house/download/<filename>/`
- **Script storage**: Saves to `media/blender_scripts/` with unique filenames
- **Technology**: Uses Google Gemini API (supports both old and new SDK)
  - Old SDK: `google.generativeai` package
  - New SDK: `google.genai` package (auto-detected and preferred)
- **Environment**: Requires `GEMINI_API_KEY` in backend `.env` file
- **Script features**:
  - Generates complete `bpy` (Blender Python) scripts
  - Creates walls, floors, rooms, doors, windows
  - Sets up camera angles and lighting
  - Ready to execute in Blender 3.0+
- **User workflow**: Survey → Generate → Download → Import in Blender
- **Critical**: Script output is pure Python code (no markdown formatting)

### Recommender (`backend/ai_engine/recommender.py`)
Compares bids using weighted scoring:
- Price match (40%), distance (30%), rating (20%), experience (10%)
- Returns ranked list with explanations

### Room Visualizer (`backend/ai_engine/room_visualizer.py`)
Placeholder for image-to-image API integration (Stability AI, Replicate)
- Expects `IMAGE_TO_IMAGE_API_KEY` and `IMAGE_TO_IMAGE_API_URL` in settings
- Uses Cloudinary for image storage (configured in `settings.py`)

## Common Pitfalls

1. **JWT Token Refresh**: Frontend handles automatically via `api.js` interceptor. Don't manually refresh in components.

2. **Role Checks**: Always verify role on BOTH frontend (UX) and backend (security). Frontend checks are for UI only.

3. **Location Fields**: `latitude`/`longitude` are `DecimalField(max_digits=9, decimal_places=6)`. Ensure precision matches.

4. **Phone Format**: Store with country code (+91 for India). Validate format before OTP send.

5. **OTP Development**: Remember to disable OTP return in response before production (`settings.DEBUG` check in `otp_manager.py`).

6. **CORS**: Configured in `backend/config/settings.py` via `corsheaders`. Update `ALLOWED_HOSTS` for production.

7. **Bid Uniqueness**: Enforce `unique_together = ['job', 'bidder']` in Bid model. Frontend should prevent duplicate submission.

8. **Distance Calculations**: For location filtering in `JobListView`, use Haversine formula. Production should migrate to PostGIS.

9. **Zustand Persistence**: Auth store persists to localStorage with `persist` middleware. Manually clear on logout with `localStorage.removeItem('access_token')`.

10. **API Response Patterns**: All API calls go through centralized `api.js` which handles token attachment and 401 auto-refresh. Don't use raw `axios` in components.

## Debugging & Common Issues

### Frontend Token Issues
- **401 on login**: Check if backend is returning `access` and `refresh` tokens in response
- **Tokens not persisting**: Verify `authStore.js` logout() clears localStorage, and persist middleware is enabled
- **Infinite redirect loops**: Check `api.js` interceptor - max retries should prevent this, but verify refresh endpoint works

### Backend OTP Issues
- **OTP not in response**: Verify `DEBUG=True` in `.env` and check `otp_manager.py` response format
- **OTP rate limiting too strict**: Rate limits are 5 requests/hour, 3 verification attempts per OTP - for testing, use different phone numbers
- **Cache errors**: Ensure Django cache is configured (default: local memory cache works in dev)

### Location-Based Query Issues
- **Nearby jobs returns empty**: Check query parameters `latitude`, `longitude`, `radius` are numeric and valid (decimal precision important)
- **Haversine distance off**: Verify coordinates are in correct order (latitude, longitude) and use DecimalField precision

### Database Migration Issues
- **Foreign key to User fails**: Migrations must apply `users` app first - check `INSTALLED_APPS` order
- **SQLite to PostgreSQL migration**: Update `DATABASE_ENGINE` in `.env`, ensure database exists, then `python manage.py migrate`

## Environment Configuration

**Backend** (`.env` in `backend/` directory - required):
```env
SECRET_KEY=                        # Django secret
DEBUG=True                         # Enable dev mode (shows OTP in response)
DATABASE_ENGINE=                   # django.db.backends.sqlite3 or postgresql
DATABASE_NAME=db.sqlite3           # SQLite file or PostgreSQL DB name
SMS_PROVIDER=                      # msg91, twilio, or console
MSG91_AUTH_KEY=                    # SMS provider credentials
GEMINI_API_KEY=                    # Google Gemini API for 3D Blender script generation
CLOUDINARY_CLOUD_NAME=             # For room visualizer image uploads
CLOUDINARY_API_KEY=                # Cloudinary API credentials
CLOUDINARY_API_SECRET=             # Cloudinary secret
IMAGE_TO_IMAGE_API_KEY=            # Optional: Stability AI/Replicate for room viz
IMAGE_TO_IMAGE_API_URL=            # Image generation API endpoint
```

**Frontend** (`.env` in `frontend-new/` directory - optional, has defaults):
```env
VITE_API_URL=http://localhost:8000/api    # Backend API base URL (dev: leave empty to use proxy)
```

**Environment Loading**:
- Backend: Uses `python-decouple` package to read `.env` file in backend/config/settings.py
- Frontend: Uses Vite's `import.meta.env` for env vars prefixed with `VITE_` in frontend-new/vite.config.ts
- **Production Note**: Set env vars via system/container environment, not .env files

**Cache Backend for OTP**:
- **Development**: Django's local memory cache (default, works without setup)
- **Production**: Configure Redis or Memcached in `CACHES` setting in `settings.py`

### Error Handling & User Feedback
**Frontend Toast Notifications** (`react-hot-toast`):
- Use `toast.success()` for successful operations
- Use `toast.error()` for failures with API error messages
- Extract error messages: `error.response?.data?.error || 'Fallback message'`
- OTP display in dev: `toast.success(\`OTP: ${response.data.otp}\`, { duration: 10000 })`

**Backend Error Responses**:
- Return structured JSON: `{"error": "message", "detail": {...}}`
- Use DRF's built-in exception handling
- Custom validation in serializers with `raise serializers.ValidationError()`

## Key Documentation Files
- `SETUP_GUIDE.md`: Detailed setup for PostgreSQL, virtual env, migrations
- `DEPLOYMENT_GUIDE.md`: Step-by-step deployment for new teams (Windows/Linux)
- `IMPLEMENTATION_SUMMARY.md`: Feature changelog (OTP, location, translations)
- `QUICK_START_SMS.md`: SMS provider setup (MSG91 recommended for India)
- `SMS_PROVIDER_COMPARISON.md`: Comparison of SMS services
- `AI_HOUSE_DESIGNER.md`: Complete house designer feature documentation
- `IMAGE_GENERATION_FEATURES.md`: Room visualizer and Cloudinary integration
- `backend/README.md`: Complete API documentation with endpoints
- `frontend/README.md`: Component structure, build commands

## When Modifying Code

### Adding New Roles
1. Update `User.Role` choices in `backend/users/models.py`
2. Create permission class in `backend/users/permissions.py`
3. Add role checks to `ProtectedRoute.jsx` on frontend

### Adding New API Endpoints
1. Create view in appropriate app's `views.py`
2. Add URL pattern to app's `urls.py`
3. Add API method to `frontend-new/src/utils/api.ts`
4. Use in component via store or direct API call

### Adding New Languages
1. Add translations to `frontend-new/src/contexts/LanguageContext.tsx` or translation utilities
2. Update region mapping in location detection utility (live GPS to language mapping)
3. Ensure language options appear in language switcher component

### Database Schema Changes
1. Modify models in app's `models.py`
2. Run `makemigrations` (creates migration file)
3. Review migration file before `migrate`
4. Check foreign key dependencies (especially to `User` model)
