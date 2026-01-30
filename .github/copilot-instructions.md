# Mistribazar Codebase Guide for AI Agents

## Project Overview
Mistribazar is a construction marketplace connecting consumers with masons/traders through role-based authentication, location-based discovery, bidding system, and AI features (budget estimation, room visualization).

**Architecture**: Django REST API (backend) + React/Vite SPA (frontend)

**Tech Stack**:
- Backend: Django 4.2.7 + DRF + SimpleJWT + PostgreSQL/SQLite
- Frontend: React 18 + Vite 7 + React Router 6 + Zustand 4 + Tailwind CSS 3
- Features: Phone OTP auth, location-based search (Haversine), multi-language (10 Indian languages), rule-based AI tools

## Critical Architecture Patterns

### 1. Role-Based Access Control (RBAC)
Three roles define all interactions: `CONSUMER`, `MASON`, `TRADER`

**Backend**: Custom permission classes in `backend/users/permissions.py`
- Use `IsConsumer`, `IsMason`, `IsMasonOrTrader` decorators on views
- Example: Only consumers create jobs, only mason/traders submit bids
- Stack multiple permissions: `[IsAuthenticated, IsConsumer]` for enforcement
- Custom auth backend in `backend/users/backends.py` handles phone-based login
```python
permission_classes = [IsAuthenticated, IsConsumer]
```

**Frontend**: Routes protected via `ProtectedRoute` component with role checks
- User role stored in Zustand auth store (`frontend/src/store/authStore.js`) with localStorage persistence
- ProtectedRoute enforces `requiredRole` parameter on sensitive routes like CreateJobPage

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

**Automatic Location Detection** (`frontend/src/utils/location.js`):
- Browser Geolocation API → GPS coordinates
- Reverse geocoding → Indian state → regional language  
- Maps states to languages: Tamil Nadu→Tamil, Maharashtra→Marathi, etc.
- Fallback to Hindi if detection fails

**Data Model**: `Job` and `User` models both store `latitude`/`longitude` fields with database indexes

### 4. Multi-Language Support
UI automatically translates to user's regional language based on registration location

**Translation System** (`frontend/src/utils/translations.js`):
- Supports 10 Indian languages (Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, Bengali, Gujarati, Punjabi, English)
- Usage: `translations[language][key]` for all UI text
- Language stored in `User.language` field during registration

### 5. Zustand State Management (Frontend)
Three primary stores in `frontend/src/store/` (JavaScript files with `.js` extension):
- `authStore.js`: User authentication, JWT tokens (persisted to localStorage via `persist` middleware)
- `jobStore.js`: Job listings, filtering
- `bidStore.js`: Bid management

**Pattern**: Store methods handle API calls AND state updates in one place
```javascript
login: async (phone, password) => {
  const response = await api.post('/users/login/', { phone, password })
  // Store tokens in localStorage
  localStorage.setItem('access_token', tokens.access)
  set({ user, tokens })
}
```

**Important**: Never call API directly from components - always go through stores or centralized `api.js`

### 6. API Architecture
**Centralized Axios Instance** (`frontend/src/utils/api.js`):
- Request interceptor: Attaches JWT from localStorage to `Authorization: Bearer <token>` header
- Response interceptor: Auto-refreshes expired tokens on 401 responses
  - On 401, attempts token refresh with `/api/users/refresh/` endpoint
  - Updates `access_token` in localStorage automatically
  - Retries original request with new token
  - If refresh fails, redirects to login page
- Base URL from `VITE_API_URL` env var (defaults to `http://localhost:8000/api`)
- **Critical**: All API calls MUST go through this instance, never raw `axios`

**Backend URL Pattern**:
- `/api/users/` - User/auth endpoints
- `/api/jobs/` - Job CRUD + filtering
- `/api/bids/` - Bidding system
- `/api/ratings/` - Review system
- `/api/ai/` - AI features (budget, recommender, visualizer)

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
```

**Frontend**:
```powershell
cd frontend
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
- **Routing**: React Router v6 with nested routes in `App.jsx`
- **Forms**: Controlled components with local state, validation before API call
- **Error Handling**: `react-hot-toast` for all user-facing messages
- **Styling**: Tailwind CSS utility classes, mobile-first responsive design
- **Icons**: Lucide React (`lucide-react` package)
- **Build Tool**: Vite with React plugin, ESLint for linting
- **Bundle Command**: `npm run build` → outputs to `dist/` folder

### File Naming
- Backend: `snake_case` (Django convention)
- Frontend: `PascalCase` for components (`.jsx`), `camelCase` for utilities

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

## Environment Configuration

**Backend** (`.env` in `backend/`):
```env
SECRET_KEY=                        # Django secret
DEBUG=True                         # Enable dev mode (shows OTP in response)
DATABASE_ENGINE=                   # django.db.backends.sqlite3 or postgresql
DATABASE_NAME=db.sqlite3           # SQLite file or PostgreSQL DB name
SMS_PROVIDER=                      # msg91, twilio, or console
MSG91_AUTH_KEY=                    # SMS provider credentials
CLOUDINARY_CLOUD_NAME=             # For room visualizer image uploads
CLOUDINARY_API_KEY=                # Cloudinary API credentials
CLOUDINARY_API_SECRET=             # Cloudinary secret
IMAGE_TO_IMAGE_API_KEY=            # Optional: Stability AI/Replicate for room viz
IMAGE_TO_IMAGE_API_URL=            # Image generation API endpoint
```

**Frontend** (`.env` in `frontend/`):
```env
VITE_API_URL=http://localhost:8000/api    # Backend API base URL
```

**Production Note**: Use `python-decouple` for all env vars (already configured in `settings.py`)

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
3. Add API method to `frontend/src/utils/api.js`
4. Use in component via store or direct API call

### Adding New Languages
1. Add translations to `frontend/src/utils/translations.js`
2. Update region mapping in `frontend/src/utils/location.js`

### Database Schema Changes
1. Modify models in app's `models.py`
2. Run `makemigrations` (creates migration file)
3. Review migration file before `migrate`
4. Check foreign key dependencies (especially to `User` model)
