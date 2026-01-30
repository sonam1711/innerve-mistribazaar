# Mistribazar - Deployment Guide for New Team

## 📋 Project Overview

**Mistribazar** is a construction marketplace platform connecting consumers with masons/traders.

**Architecture:**
- **Backend:** Django REST API (Python 3.10+)
- **Frontend:** React + Vite (TypeScript/JavaScript)
- **Database:** SQLite (development) / PostgreSQL (production)

---

## 🔧 System Requirements

### Required Software
- **Python:** 3.10 or higher
- **Node.js:** 16.x or higher
- **npm:** 8.x or higher
- **Git:** Latest version

### Operating System
- Windows 10/11 (tested)
- Linux/macOS (compatible)

---

## 📦 Installation Steps

### 1. Extract the Project
```bash
# Extract mistribazar.zip to your desired location
# Example: C:\Projects\mistribazar
```

### 2. Backend Setup (Django)

#### Windows:
```powershell
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

#### Linux/macOS:
```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

**Backend will run at:** http://localhost:8000

### 3. Frontend Setup (React)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend will run at:** http://localhost:3000

---

## 🔐 Environment Configuration

### Backend (.env file)

Create `backend/.env` file:

```env
# Django Settings
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (SQLite for development)
DATABASE_ENGINE=django.db.backends.sqlite3
DATABASE_NAME=db.sqlite3

# For PostgreSQL (production):
# DATABASE_ENGINE=django.db.backends.postgresql
# DATABASE_NAME=mistribazar_db
# DATABASE_USER=your_db_user
# DATABASE_PASSWORD=your_db_password
# DATABASE_HOST=localhost
# DATABASE_PORT=5432

# SMS Provider Configuration
SMS_PROVIDER=console
# Options: console (development), msg91, twilio

# MSG91 Configuration (if using MSG91)
MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_SENDER_ID=your_sender_id
MSG91_ROUTE=4
MSG91_COUNTRY_CODE=91

# Twilio Configuration (if using Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number

# AI Features (optional)
IMAGE_TO_IMAGE_API_KEY=your_stability_ai_key
IMAGE_TO_IMAGE_API_URL=https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image
```

### Frontend (.env file)

Create `frontend/.env` file:

```env
VITE_API_URL=http://localhost:8000/api
```

---

## 🧪 Testing the Setup

### Backend Health Check

1. Open browser: http://localhost:8000/admin
2. Login with superuser credentials
3. Check API endpoints:
   - http://localhost:8000/api/users/
   - http://localhost:8000/api/jobs/
   - http://localhost:8000/api/bids/

### Frontend Health Check

1. Open browser: http://localhost:3000
2. You should see the Mistribazar homepage
3. Try registering a new user (OTP will appear in console in DEBUG mode)
4. Navigate through different pages

### Running Django Tests

```bash
cd backend
python manage.py test
```

---

## 📱 Key Features

### Authentication
- **Phone-based OTP authentication** (no email required)
- **Role-based access:** Consumer, Mason, Trader
- **JWT token authentication**

### Core Features
1. **Job Posting** (Consumers create construction jobs)
2. **Bidding System** (Masons/Traders submit bids)
3. **Location-Based Discovery** (GPS-based job matching)
4. **Multi-Language Support** (10 Indian languages)
5. **Rating & Reviews**
6. **AI Budget Estimator**
7. **AI Room Visualizer**
8. **AI House Designer**

---

## 🗂️ Project Structure

```
mistribazar/
├── backend/
│   ├── ai_engine/         # AI features (budget, visualizer, house designer)
│   ├── bids/              # Bidding system
│   ├── config/            # Django settings
│   ├── jobs/              # Job management
│   ├── ratings/           # Review system
│   ├── users/             # User auth & profiles
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand state management
│   │   └── utils/         # API client, translations
│   ├── package.json
│   └── vite.config.js
│
└── Documentation/
    ├── SETUP_GUIDE.md
    ├── IMPLEMENTATION_SUMMARY.md
    ├── QUICK_START_SMS.md
    └── README.md
```

---

## 🔧 Common Issues & Solutions

### Issue 1: Port Already in Use
**Backend (8000):**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/macOS
lsof -i :8000
kill -9 <PID>
```

**Frontend (3000):**
```bash
# Change port in vite.config.js or use
npm run dev -- --port 3001
```

### Issue 2: Database Migrations Error
```bash
# Delete db.sqlite3 and migrations
rm backend/db.sqlite3
rm -rf backend/*/migrations/0*.py

# Recreate migrations
python manage.py makemigrations
python manage.py migrate
```

### Issue 3: Module Not Found Errors
```bash
# Backend
cd backend
pip install -r requirements.txt --force-reinstall

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: CORS Errors
- Check `backend/config/settings.py` → `CORS_ALLOWED_ORIGINS`
- Ensure frontend URL is listed
- Update `VITE_API_URL` in frontend `.env`

### Issue 5: OTP Not Received
- In development (`DEBUG=True`), OTP appears in backend console output
- In production, configure SMS provider (MSG91/Twilio)
- Check `backend/users/sms_service.py` for SMS integration

---

## 🚀 Production Deployment

### Backend (Django)

1. **Update settings:**
   ```python
   # backend/config/settings.py
   DEBUG = False
   ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']
   ```

2. **Use PostgreSQL database**

3. **Collect static files:**
   ```bash
   python manage.py collectstatic
   ```

4. **Use production server:**
   - Gunicorn (recommended)
   - uWSGI
   - Daphne (for async)

5. **Setup HTTPS/SSL certificate**

### Frontend (React)

1. **Build production bundle:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy `dist/` folder to:**
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Your web server (Nginx/Apache)

3. **Update API URL:**
   ```env
   VITE_API_URL=https://api.yourdomain.com
   ```

---

## 📞 SMS Provider Setup

### Option 1: Console (Development Only)
```env
SMS_PROVIDER=console
```
OTP will print in terminal.

### Option 2: MSG91 (Recommended for India)
1. Sign up: https://msg91.com/
2. Get Auth Key from dashboard
3. Update `.env`:
   ```env
   SMS_PROVIDER=msg91
   MSG91_AUTH_KEY=your_auth_key
   MSG91_SENDER_ID=MISTRB
   ```

### Option 3: Twilio (International)
1. Sign up: https://www.twilio.com/
2. Get credentials
3. Update `.env`:
   ```env
   SMS_PROVIDER=twilio
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

See `QUICK_START_SMS.md` for detailed SMS setup.

---

## 📊 Database Schema

### Key Models

**User Model:**
- Custom user with phone as username
- Roles: CONSUMER, MASON, TRADER
- Location fields (latitude, longitude)
- Language preference

**Job Model:**
- Title, description, budget
- Location, work_type
- Status: OPEN, IN_PROGRESS, COMPLETED
- Images (optional)

**Bid Model:**
- Amount, description
- Delivery time
- Status: PENDING, ACCEPTED, REJECTED

**Rating Model:**
- Score (1-5)
- Comment
- Bidirectional (consumer ↔ mason/trader)

---

## 🎨 UI/UX Features

- **Responsive Design** (Mobile-first)
- **Tailwind CSS** styling
- **Amber Theme** (warm, construction-focused)
- **Loading States** with spinners
- **Toast Notifications** (react-hot-toast)
- **Form Validation**
- **Protected Routes** (role-based)

---

## 🔒 Security Checklist

- [ ] Change `SECRET_KEY` in production
- [ ] Set `DEBUG = False` in production
- [ ] Configure `ALLOWED_HOSTS` properly
- [ ] Use HTTPS (SSL certificate)
- [ ] Enable CSRF protection
- [ ] Set up CORS properly
- [ ] Use environment variables (never commit `.env`)
- [ ] Enable rate limiting for OTP
- [ ] Validate all user inputs
- [ ] Use prepared statements (Django ORM handles this)

---

## 📚 Additional Documentation

- **SETUP_GUIDE.md** - Detailed initial setup
- **IMPLEMENTATION_SUMMARY.md** - Feature changelog
- **QUICK_START_SMS.md** - SMS provider configuration
- **SMS_PROVIDER_COMPARISON.md** - SMS service comparison
- **backend/README.md** - API documentation
- **frontend/README.md** - Frontend architecture

---

## 🐛 Debugging Tips

### Enable Verbose Logging

**Backend:**
```python
# backend/config/settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}
```

**Frontend:**
```javascript
// Add to any component
console.log('Debug:', variableName)
```

### Django Shell for Testing
```bash
python manage.py shell

# Test OTP
from users.otp_manager import OTPManager
otp = OTPManager.generate_otp('+919876543210')
print(otp)
```

### API Testing with cURL
```bash
# Test login
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "password": "yourpassword"}'
```

---

## 💡 Development Tips

1. **Use Django Admin** for quick data inspection
2. **Enable React DevTools** for state debugging
3. **Check Network Tab** for API errors
4. **Read console logs** for OTP in development
5. **Use Postman** for API testing
6. **Enable VS Code extensions:**
   - Python
   - Pylance
   - ESLint
   - Prettier

---

## 📞 Support & Contact

For issues or questions:
1. Check existing documentation files
2. Review Django logs: `backend/logs/`
3. Check browser console for frontend errors
4. Verify environment variables are set correctly

---

## ✅ Pre-Deployment Checklist

Backend:
- [ ] All migrations applied
- [ ] Superuser created
- [ ] Static files collected
- [ ] Environment variables configured
- [ ] SMS provider configured (if needed)
- [ ] Database backed up

Frontend:
- [ ] Build succeeds without errors
- [ ] API URL points to production backend
- [ ] All routes accessible
- [ ] Forms validate properly
- [ ] Authentication flow works

Testing:
- [ ] Register new user works
- [ ] OTP verification works
- [ ] Job posting works
- [ ] Bidding system works
- [ ] Profile updates work
- [ ] AI features work (budget estimator)

---

## 🎉 Success Indicators

Your setup is successful when:

1. ✅ Backend Django admin accessible
2. ✅ Frontend homepage loads without errors
3. ✅ User registration completes successfully
4. ✅ OTP verification works (console or SMS)
5. ✅ Dashboard shows user-specific data
6. ✅ Job creation succeeds
7. ✅ API responses return expected data
8. ✅ No console errors in browser
9. ✅ All routes navigate correctly
10. ✅ Logout and re-login works

---

**Project Version:** 1.0.0  
**Last Updated:** January 2026  
**Python Version:** 3.10+  
**Node Version:** 16.x+  
**Django Version:** 4.2.7  
**React Version:** 18.x

**Happy Deploying! 🚀**
