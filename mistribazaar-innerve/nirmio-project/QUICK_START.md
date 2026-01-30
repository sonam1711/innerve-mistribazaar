# Quick Start Commands for Mistribazar Innerve Frontend

## First Time Setup

```powershell
# Navigate to project
cd c:\Users\HP\Downloads\mistribazaar-innerve\nirmio-project

# Install dependencies
npm install

# Install specific packages if needed
npm install axios zustand react-hot-toast
```

## Running the Application

### Terminal 1: Start Backend
```powershell
cd c:\Users\HP\Desktop\mistribazar\backend
venv\Scripts\activate
python manage.py runserver
```
Backend runs on: http://localhost:8000

### Terminal 2: Start Innerve Frontend
```powershell
cd c:\Users\HP\Downloads\mistribazaar-innerve\nirmio-project
npm run dev
```
Frontend runs on: http://localhost:5173

## Testing

### Test Login Flow
1. Open http://localhost:5173/login
2. Use "OTP" method for testing
3. Enter phone: +919876543210
4. Click "Send OTP"
5. OTP will appear in toast notification (dev mode)
6. Enter OTP and verify

### Test Signup Flow
1. Open http://localhost:5173/signup
2. Allow location access when prompted
3. Select role (Consumer/Mason/Trader)
4. Fill in details
5. Create account

## Other Frontends

### Original Frontend (React)
```powershell
cd c:\Users\HP\Desktop\mistribazar\frontend
npm run dev  # Port 3000
```

### Frontend V2 (Alternative)
```powershell
cd c:\Users\HP\Desktop\mistribazar\frontend-v2
npm run dev  # Port 3001
```

## Build for Production

```powershell
cd c:\Users\HP\Downloads\mistribazaar-innerve\nirmio-project
npm run build
npm run preview  # Test production build
```

## Troubleshooting

### Port Already in Use
```powershell
# Kill process on port 5173
npx kill-port 5173

# Or change port in vite.config.ts:
# server: { port: 5174 }
```

### CORS Issues
Add to backend `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
]
```

### Location Not Detecting
- Enable location services in browser
- Allow location permission when prompted
- Check browser console for errors

### OTP Not Showing
- Make sure backend is in DEBUG mode
- Check backend console for OTP
- Verify SMS service configuration in `backend/users/sms_service.py`
