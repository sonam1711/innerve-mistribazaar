# Mistribazar - Quick Start Guide

## 🎯 You're 90% Done!

All the code is ready. You just need to:
1. **Set up Supabase** (5 mins)
2. **Configure environment** (2 mins)
3. **Run backend setup** (2 mins)

---

## Step 1: Create Supabase Project (5 mins)

### 1.1 Create Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and create project
4. Wait for project to be ready (~2 mins)

### 1.2 Enable Phone Authentication
1. Go to **Authentication** > **Providers**
2. Enable **Phone** authentication
3. For development, you can use **Skip phone verification** (for testing)
4. For production, configure **Twilio**:
   - Get Twilio Account SID and Auth Token
   - Add to Supabase dashboard

### 1.3 Get Credentials
1. Go to **Settings** > **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJxxx...`
   - **service_role key**: `eyJxxx...` (keep this secret!)
3. Go to **Settings** > **API** > **JWT Settings**
   - Copy **JWT Secret**: `your-super-secret-jwt-token-with-at-least-32-characters-long`
4. Go to **Settings** > **Database**
   - Copy connection string or note these details:
     - Host: `db.xxxxx.supabase.co`
     - Database: `postgres`
     - User: `postgres`
     - Password: (your project password)
     - Port: `5432`

---

## Step 2: Configure Environment (2 mins)

### 2.1 Backend Configuration
```bash
cd backend
cp .env.example .env
nano .env  # or use any editor
```

Update these values in `backend/.env`:
```bash
# Django
SECRET_KEY=generate-a-random-secret-key-here-123456789
DEBUG=True
ALLOWED_HOSTS=*

# Supabase (from Step 1.3)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key-here
SUPABASE_JWT_SECRET=your-jwt-secret-here

# Database (from Step 1.3)
DATABASE_NAME=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=your-database-password
DATABASE_HOST=db.your-project.supabase.co
DATABASE_PORT=5432

# Cloudinary (optional - for image uploads later)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 2.2 Frontend Configuration
```bash
cd ../frontend
cp .env.example .env
nano .env  # or use any editor
```

Update `frontend/.env`:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
VITE_API_URL=http://localhost:8000/api
```

---

## Step 3: Run Backend Setup (2 mins)

### 3.1 Automated Setup Script
```bash
cd backend
./setup.sh
```

This script will:
- ✅ Create virtual environment
- ✅ Install all dependencies
- ✅ Run database migrations
- ✅ Prompt to create superuser (optional)

### 3.2 (Alternative) Manual Setup
If the script doesn't work:
```bash
cd backend

# Create and activate venv
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser
```

---

## Step 4: Start Development Servers

### Terminal 1: Backend
```bash
cd backend
source venv/bin/activate  # If not already activated
python manage.py runserver
```
Backend runs at: **http://localhost:8000**
Admin panel: **http://localhost:8000/admin**
API docs: **http://localhost:8000/api/**

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```
Frontend runs at: **http://localhost:5173**

---

## Step 5: Test the Application

### 5.1 Register a New User
1. Go to http://localhost:5173
2. Click **Sign Up**
3. Enter phone number (e.g., +919876543210)
4. Receive OTP (check Supabase dashboard if using test mode)
5. Enter OTP to verify
6. Complete profile:
   - Enter name
   - Select role (Customer, Worker, Constructor, or Trader)
   - Complete optional profile details

### 5.2 Post a Job (as Customer)
1. Login as Customer
2. Go to **Create Job**
3. Select job type:
   - **Worker Job**: For plumbers, electricians, masons
   - **Constructor Job**: For large construction projects
4. Fill in details and submit

### 5.3 View Jobs (as Worker/Constructor)
1. Login as Worker or Constructor
2. Go to **Jobs**
3. See jobs filtered by your role (workers see worker jobs only)

---

## 🎉 That's It!

Your application is now running with:
- ✅ Supabase phone OTP authentication
- ✅ 4 user types (Customer, Worker, Constructor, Trader)
- ✅ 2 job categories (Worker Jobs, Constructor Jobs)
- ✅ Role-based access control
- ✅ Location-based job filtering
- ✅ Clean Git history (16 commits)

---

## 📚 Additional Resources

- **API Documentation**: Check `SETUP_GUIDE.md` for all API endpoints
- **Troubleshooting**: See the troubleshooting section in `SETUP_GUIDE.md`
- **Deployment**: Ready to deploy to Vercel (frontend) and Railway/Render (backend)

---

## 🐛 Common Issues

### "ModuleNotFoundError: No module named 'django'"
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### "Connection refused" when accessing API
- Make sure backend is running: `python manage.py runserver`
- Check that `VITE_API_URL` in frontend `.env` is correct

### OTP not receiving
- Check Supabase phone auth configuration
- For development, use Supabase's test OTP feature
- Check Supabase dashboard logs

### "Invalid token" errors
- Verify `SUPABASE_JWT_SECRET` matches in both backend `.env` and Supabase settings
- Check that all three Supabase keys are correct

---

## 🚀 Next Steps

- [ ] Add Cloudinary for image uploads
- [ ] Configure Twilio for production OTP
- [ ] Deploy to production
- [ ] Add more features (ratings, notifications, etc.)

---

**Need help?** Check the detailed [SETUP_GUIDE.md](./SETUP_GUIDE.md)
