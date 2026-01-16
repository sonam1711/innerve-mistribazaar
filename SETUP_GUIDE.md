# 🚀 Mistribazar - Complete Setup Guide

Follow these steps to get Mistribazar running on your local machine.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Python 3.10 or higher installed
- [ ] Node.js 18 or higher installed
- [ ] PostgreSQL 12 or higher installed
- [ ] Git installed (optional)
- [ ] Code editor (VS Code recommended)

## Step 1: Database Setup (PostgreSQL)

### Windows:
1. Open pgAdmin or psql
2. Create database:
```sql
CREATE DATABASE mistribazar_db;
CREATE USER mistribazar_user WITH PASSWORD 'your_password';
ALTER DATABASE mistribazar_db OWNER TO mistribazar_user;
GRANT ALL PRIVILEGES ON DATABASE mistribazar_db TO mistribazar_user;
```

### Mac/Linux:
```bash
sudo -u postgres psql
CREATE DATABASE mistribazar_db;
CREATE USER mistribazar_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE mistribazar_db TO mistribazar_user;
\q
```

## Step 2: Backend Setup

### 1. Open terminal in project folder

```bash
cd C:\Users\HP\Desktop\mistribazar\backend
```

### 2. Create virtual environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Create .env file

Copy `.env.example` to `.env` and update:

```env
SECRET_KEY=django-insecure-change-this-in-production-xyz123
DEBUG=True
DATABASE_NAME=mistribazar_db
DATABASE_USER=mistribazar_user
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
DATABASE_PORT=5432

# Optional: Add later
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

IMAGE_TO_IMAGE_API_KEY=
IMAGE_TO_IMAGE_API_URL=
```

### 5. Run migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create superuser (admin)

```bash
python manage.py createsuperuser
```

Enter:
- Phone: +919876543210 (or any)
- Name: Admin User
- Password: (choose a strong password)

### 7. Start backend server

```bash
python manage.py runserver
```

✅ Backend should now be running at: `http://localhost:8000`

Test it: Open browser → `http://localhost:8000/admin/`

## Step 3: Frontend Setup

### 1. Open NEW terminal (keep backend running)

```bash
cd C:\Users\HP\Desktop\mistribazar\frontend
```

### 2. Install dependencies

```bash
npm install
```

If you encounter errors, try:
```bash
npm install --legacy-peer-deps
```

### 3. Create .env file

Create `.env` file:

```env
VITE_API_URL=http://localhost:8000/api
```

### 4. Start frontend server

```bash
npm run dev
```

✅ Frontend should now be running at: `http://localhost:3000`

## Step 4: Verify Everything Works

### Test Backend API

Open browser or use Postman:

1. **Health check**: `http://localhost:8000/admin/`
   - Should show Django admin login

2. **API endpoint**: `http://localhost:8000/api/users/login/`
   - POST request should return error (expected - no credentials)

### Test Frontend

Open browser: `http://localhost:3000`

1. **Home page** should load
2. Click **Sign Up**
3. Try registering a user

## Step 5: Create Test Data

### Option 1: Using Admin Panel

1. Go to: `http://localhost:8000/admin/`
2. Login with superuser credentials
3. Create test users, jobs, bids manually

### Option 2: Using API (Recommended)

Register test users via frontend or API:

**Consumer:**
```json
POST http://localhost:8000/api/users/register/
{
  "name": "John Consumer",
  "phone": "+919876543210",
  "password": "Test@123",
  "password2": "Test@123",
  "role": "CONSUMER",
  "latitude": "19.0760",
  "longitude": "72.8777",
  "language": "English"
}
```

**Mason:**
```json
POST http://localhost:8000/api/users/register/
{
  "name": "Mike Mason",
  "phone": "+919876543211",
  "password": "Test@123",
  "password2": "Test@123",
  "role": "MASON",
  "latitude": "19.0760",
  "longitude": "72.8777",
  "mason_profile": {
    "skills": "bricklaying, plastering, tiling",
    "daily_rate": "1500",
    "experience_years": "5"
  }
}
```

## Common Issues & Solutions

### Issue 1: Module not found (Python)
```bash
pip install -r requirements.txt
```

### Issue 2: Database connection error
- Check PostgreSQL is running
- Verify credentials in `.env`
- Ensure database exists

### Issue 3: Port already in use
**Backend:**
```bash
python manage.py runserver 8001
```

**Frontend:**
Update `vite.config.js`:
```js
server: {
  port: 3001,
}
```

### Issue 4: CORS errors
- Ensure backend is running
- Check `CORS_ALLOWED_ORIGINS` in `backend/config/settings.py`
- Verify `VITE_API_URL` in frontend `.env`

### Issue 5: npm install fails
```bash
npm cache clean --force
npm install --legacy-peer-deps
```

## Testing the Application

### 1. Register Users
- Register as CONSUMER
- Logout
- Register as MASON

### 2. Post a Job (as Consumer)
- Login as consumer
- Click "Post Job"
- Fill details
- Submit

### 3. Submit Bid (as Mason)
- Login as mason
- Browse jobs
- Submit bid on a job

### 4. Accept Bid (as Consumer)
- Login as consumer
- View job
- See bids with AI recommendations
- Accept a bid

### 5. Test AI Features
- **Budget Estimator**: Answer questions
- **Room Visualizer**: Upload image URL and describe changes

## Next Steps

1. ✅ **Customize** - Update colors, branding in Tailwind config
2. ✅ **Add Images** - Configure Cloudinary for real image uploads
3. ✅ **AI Integration** - Add real image-to-image API keys
4. ✅ **Deploy** - Follow deployment guides in respective READMEs
5. ✅ **Test** - Create comprehensive test scenarios

## Useful Commands

### Backend
```bash
# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run server
python manage.py runserver

# Shell
python manage.py shell
```

### Frontend
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
```

## Directory Structure

```
mistribazar/
├── backend/
│   ├── config/         # Settings
│   ├── users/          # User models & auth
│   ├── jobs/           # Jobs
│   ├── bids/           # Bidding
│   ├── ratings/        # Reviews
│   ├── ai_engine/      # AI features
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/  # UI components
    │   ├── pages/       # Pages
    │   ├── store/       # State management
    │   └── utils/       # Utilities
    ├── package.json
    └── vite.config.js
```

## Support

If you encounter issues:

1. Check terminal for error messages
2. Review logs
3. Verify all steps completed
4. Check [Backend README](./backend/README.md)
5. Check [Frontend README](./frontend/README.md)

## Success Checklist

- [ ] PostgreSQL database created
- [ ] Backend server running at :8000
- [ ] Frontend server running at :3000
- [ ] Admin panel accessible
- [ ] Can register users
- [ ] Can create jobs
- [ ] Can submit bids
- [ ] AI features working

---

🎉 **Congratulations!** Your Mistribazar MVP is ready!

Start by registering test users and exploring the platform.
