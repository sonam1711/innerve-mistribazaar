# Mistribazar - Deployment Guide

## Project Overview
Mistribazar is a construction marketplace connecting consumers with masons/traders through role-based authentication, location-based discovery, bidding system, and AI features.

**Tech Stack:**
- Backend: Django 4.2.7 + Django REST Framework
- Frontend: React 18 + Vite + TypeScript + Tailwind CSS + Zustand (Amber theme)
- Database: SQLite (development) / PostgreSQL (production recommended)
- Authentication: Phone-based OTP with JWT tokens
- SMS: MSG91 (India)

---

## Quick Setup

### Prerequisites
- Python 3.8+ (recommended 3.11)
- Node.js 18+ with npm
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Linux/Mac
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   Create a `.env` file in the `backend/` directory:
   ```env
   SECRET_KEY=your-secret-key-here-generate-new-one
   DEBUG=True
   DATABASE_ENGINE=sqlite3
   SMS_PROVIDER=msg91
   MSG91_AUTH_KEY=your-msg91-auth-key
   MSG91_SENDER_ID=your-sender-id
   MSG91_TEMPLATE_ID=your-template-id
   ```

5. **Run migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start backend server:**
   ```bash
   python manage.py runserver
   ```
   Backend will run at: http://127.0.0.1:8000/

### Frontend Setup (Legacy - Port 3000)

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   Create `.env` file in `frontend/` directory:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   Frontend will run at: http://localhost:3000/

### Frontend Setup (Primary - Amber Theme at Port 5173)

**RECOMMENDED FRONTEND**: The primary frontend is located at:
`C:\Users\HP\Downloads\mistribazaar-innerve\nirmio-project\`

This is a beautiful amber-themed TypeScript frontend with:
- Full integration with backend API
- Auto-location detection for regional language
- Phone-based OTP authentication
- All features: Dashboard, Jobs, Bids, Profile, AI tools

1. **Navigate to primary frontend:**
   ```bash
   cd C:\Users\HP\Downloads\mistribazaar-innerve\nirmio-project\
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   Frontend will run at: http://localhost:5173/

---

## Features Implemented

### Backend APIs

1. **User Management** (`/api/users/`)
   - Phone-based registration with OTP
   - Login (password or OTP)
   - Profile management
   - Role-based access control (CONSUMER, MASON, TRADER)

2. **Job Management** (`/api/jobs/`)
   - Create/update/delete jobs (consumers only)
   - List jobs with filters (location, budget, status)
   - Job detail view

3. **Bidding System** (`/api/bids/`)
   - Submit bids (masons/traders only)
   - Accept/reject bids (consumers only)
   - Bid notifications

4. **Rating System** (`/api/ratings/`)
   - Rate masons/traders after job completion
   - View ratings and reviews

5. **AI Features** (`/api/ai/`)
   - `/budget/conversation/` - Budget estimator (conversational)
   - `/recommend/` - Bid recommender (weighted scoring)
   - `/visualize/` - Room visualizer (image upload)
   - `/house-design/` - House designer (11-step flow with floor plan generation)

### Frontend Features

1. **Authentication**
   - Phone number + OTP login/registration
   - Auto-detect location for regional language
   - JWT token management

2. **Role-Based Dashboards**
   - Consumer: Create jobs, view bids, manage projects
   - Mason/Trader: Browse jobs, submit bids, manage work

3. **Job Discovery**
   - Location-based job search
   - Filter by budget, skills, distance

4. **Bidding Interface**
   - Submit competitive bids
   - View bid status
   - Chat with clients (planned)

5. **AI Tools**
   - Budget Estimator: Get construction cost estimates
   - Room Visualizer: Upload room images for AI transformation
   - House Designer: Generate custom house designs with floor plans

---

## Architecture Notes

### Role-Based Access Control
All user interactions are role-gated on BOTH frontend and backend:
- `IsConsumer`: Can create jobs, accept bids
- `IsMason` / `IsMasonOrTrader`: Can submit bids on jobs
- Frontend: `ProtectedRoute` component checks user role

### Phone-Based Authentication
- Custom User model with `phone` as `USERNAME_FIELD`
- OTP system with rate limiting (5 requests/hour, 3 attempts)
- Cache-based OTP storage (10-minute expiry)
- In development mode (`DEBUG=True`), OTP is returned in API response

### Location Features
- Auto-detect via browser Geolocation API
- Reverse geocoding → state → regional language
- Jobs filtered by GPS proximity

### Multi-Language Support
UI automatically translates based on user's registration location:
- Supports 10 Indian languages
- Translations stored in `frontend/src/utils/translations.js`

---

## Database Schema

### User Model
```python
- id (BigAutoField)
- phone (CharField, unique) - USERNAME_FIELD
- name (CharField)
- role (CharField: CONSUMER/MASON/TRADER)
- password (CharField, hashed)
- latitude/longitude (DecimalField)
- language (CharField)
- rating (DecimalField)
- experience_years (IntegerField, nullable for consumers)
```

### Job Model
```python
- id (BigAutoField)
- title (CharField)
- description (TextField)
- budget (DecimalField)
- consumer (ForeignKey → User)
- latitude/longitude (DecimalField)
- status (CharField: OPEN/IN_PROGRESS/COMPLETED/CANCELLED)
- created_at/updated_at (DateTimeField)
```

### Bid Model
```python
- id (BigAutoField)
- job (ForeignKey → Job)
- bidder (ForeignKey → User)
- amount (DecimalField)
- message (TextField)
- status (CharField: PENDING/ACCEPTED/REJECTED)
- created_at (DateTimeField)
```

### Rating Model
```python
- id (BigAutoField)
- job (ForeignKey → Job)
- rater (ForeignKey → User)
- rated_user (ForeignKey → User)
- rating (IntegerField: 1-5)
- review (TextField)
- created_at (DateTimeField)
```

---

## SMS Integration

The system uses MSG91 for OTP delivery (India).

**Configuration:**
1. Sign up at https://msg91.com/
2. Get Auth Key, Sender ID, Template ID
3. Add to `.env` file

**Alternative Providers:**
- Twilio (global)
- Console mode (development)

See `backend/SMS_INTEGRATION_GUIDE.md` for detailed setup.

---

## Production Deployment

### Backend (Django)

1. **Set DEBUG=False** in settings
2. **Generate new SECRET_KEY**:
   ```python
   from django.core.management.utils import get_random_secret_key
   print(get_random_secret_key())
   ```

3. **Configure PostgreSQL:**
   ```env
   DATABASE_ENGINE=postgresql
   DATABASE_NAME=mistribazar_db
   DATABASE_USER=your_user
   DATABASE_PASSWORD=your_password
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   ```

4. **Set ALLOWED_HOSTS:**
   ```python
   ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']
   ```

5. **Collect static files:**
   ```bash
   python manage.py collectstatic
   ```

6. **Use production server:**
   - Gunicorn + Nginx (recommended)
   - uWSGI
   - Daphne (for WebSockets)

### Frontend (React)

1. **Update API URL:**
   ```env
   VITE_API_URL=https://api.yourdomain.com/api
   ```

2. **Build for production:**
   ```bash
   npm run build
   ```

3. **Deploy `dist/` folder:**
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - Nginx static hosting

---

## Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## Troubleshooting

### Common Issues

1. **OTP not sending:**
   - Check SMS provider credentials in `.env`
   - Verify phone number format (+91...)
   - Check rate limiting (max 5 OTPs/hour)

2. **CORS errors:**
   - Ensure `CORS_ALLOWED_ORIGINS` includes frontend URL
   - Check `corsheaders` is in `INSTALLED_APPS`

3. **Location not detecting:**
   - Enable browser location permissions
   - Check HTTPS (required for Geolocation API)

4. **JWT token expired:**
   - Frontend auto-refreshes tokens via axios interceptor
   - Check `ACCESS_TOKEN_LIFETIME` in settings (default 60 min)

5. **Database migration errors:**
   - Delete `db.sqlite3` and all migration files except `__init__.py`
   - Run `makemigrations` and `migrate` again

---

## API Documentation

Full API documentation available at:
- `backend/README.md` - Complete endpoint reference
- Admin panel: http://localhost:8000/admin/
- Swagger (optional): Install `drf-yasg` for auto-generated docs

---

## Development Tips

1. **Frontend hot reload:** Vite provides instant updates
2. **Backend auto-reload:** Django dev server watches for file changes
3. **Database inspection:** Use Django admin or DB Browser for SQLite
4. **API testing:** Use Postman, Thunder Client, or httpie
5. **Debugging:** Check browser console and Django terminal logs

---

## Team Contacts

For technical support or questions:
- Backend: Django REST Framework documentation
- Frontend: React + Vite documentation
- Issues: Check GitHub issues or contact development team

---

## License

Proprietary - All rights reserved

---

**Last Updated:** January 24, 2026
**Version:** 1.0.0
