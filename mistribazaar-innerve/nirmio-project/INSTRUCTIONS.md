# Mistribazar Innerve Frontend

This is the Nirmio landing page frontend adapted to work with the Mistribazar backend API.

## Setup Instructions

### 1. Install Dependencies

```bash
cd c:\Users\HP\Downloads\mistribazaar-innerve\nirmio-project
npm install
```

This will install the required packages:
- `axios` - HTTP client for API calls
- `zustand` - State management
- `react-hot-toast` - Toast notifications
- React Router, Lucide Icons, Tailwind CSS (already included)

### 2. Environment Configuration

The `.env` file is already created with:
```env
VITE_API_URL=http://localhost:8000/api
```

Make sure your backend is running on `http://localhost:8000`

### 3. Start Backend (Required)

Open a terminal in the backend folder:
```powershell
cd c:\Users\HP\Desktop\mistribazar\backend
venv\Scripts\activate
python manage.py runserver
```

### 4. Start Frontend

```bash
npm run dev
```

The app will run on `http://localhost:5173`

## Integration with Backend

### ✅ Implemented Features

1. **Phone-Based Authentication**
   - Login with phone + password
   - Login with phone + OTP (6-digit code)
   - OTP is displayed in dev mode for testing

2. **User Registration**
   - Auto-detects location (latitude/longitude)
   - Determines regional language from location
   - Three roles: CONSUMER, MASON, TRADER
   - Phone number validation (+91 format)

3. **State Management**
   - Zustand store for authentication
   - Persists user data to localStorage
   - Auto-refreshes JWT tokens

4. **API Integration**
   - Centralized axios instance (`src/utils/api.ts`)
   - Request interceptor adds JWT token
   - Response interceptor handles token refresh
   - All backend endpoints configured

### 📁 New Files Added

- `src/store/authStore.ts` - Authentication state management
- `src/utils/api.ts` - API client with interceptors
- `src/utils/location.ts` - Location detection & language mapping
- `.env` - Environment variables
- `INSTRUCTIONS.md` - This file

### 🔄 Modified Files

- `package.json` - Added axios, zustand, react-hot-toast
- `src/components/Login.tsx` - Updated for backend integration
- `src/components/Signup.tsx` - Updated for backend integration

## Usage

### Login

1. **With Password**:
   - Enter phone number (+91XXXXXXXXXX or 10 digits)
   - Enter password
   - Click "Sign In"

2. **With OTP**:
   - Switch to "OTP" tab
   - Enter phone number
   - Click "Send OTP"
   - In dev mode, OTP will show in toast notification
   - Enter the 6-digit OTP
   - Click "Verify OTP"

### Signup

1. Select your role (Consumer/Mason/Trader)
2. App will auto-detect your location
3. Enter your details:
   - Full name
   - Phone number
   - Password (min 6 characters)
   - Confirm password
4. Accept terms and conditions
5. Click "Create Account"

## Development Notes

### OTP Testing
In development mode (`DEBUG=True` in backend), the OTP is returned in the API response and displayed in a toast notification. In production, remove this feature.

### Location Services
The app requires location access to:
- Detect user's region
- Set regional language (Hindi, Tamil, Telugu, etc.)
- Store latitude/longitude for job proximity features

### Backend Compatibility
This frontend is fully compatible with:
- Django REST backend at `localhost:8000`
- JWT authentication (simplejwt)
- Phone-based user model
- Role-based access control (CONSUMER/MASON/TRADER)

## API Endpoints Used

- `POST /api/users/register/` - User registration
- `POST /api/users/login/` - Login with password
- `POST /api/users/send-otp/` - Send OTP to phone
- `POST /api/users/verify-otp/` - Verify OTP and login
- `POST /api/users/token/refresh/` - Refresh JWT token
- `GET /api/users/profile/` - Get user profile

## Next Steps

To add more functionality:

1. **Job Management**: Use `jobAPI` functions in `src/utils/api.ts`
2. **Bidding System**: Use `bidAPI` functions
3. **AI Features**: Use `aiAPI` functions for budget estimation
4. **Protected Routes**: Create `ProtectedRoute` component
5. **Dashboard**: Create role-specific dashboards

## Troubleshooting

**CORS Errors**: Make sure `corsheaders` is configured in Django backend with:
```python
CORS_ALLOWED_ORIGINS = ['http://localhost:5173']
```

**Location Detection Fails**: Enable location services in browser settings

**OTP Not Received**: Check backend SMS configuration in `backend/users/sms_service.py`

**Token Refresh Fails**: Check JWT settings in `backend/config/settings.py`
