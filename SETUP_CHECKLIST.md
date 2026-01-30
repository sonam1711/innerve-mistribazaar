# Mistribazar Setup Checklist

## Before You Start
- [ ] Python 3.8+ installed
- [ ] Node.js 18+ installed
- [ ] Git installed (optional)
- [ ] Text editor (VS Code recommended)

---

## Backend Setup (5 minutes)

1. [ ] Navigate to `backend/` folder
2. [ ] Create virtual environment:
   - Windows: `python -m venv venv` then `venv\Scripts\activate`
   - Mac/Linux: `python3 -m venv venv` then `source venv/bin/activate`
3. [ ] Install packages: `pip install -r requirements.txt`
4. [ ] Create `.env` file with:
   ```
   SECRET_KEY=django-insecure-change-this-in-production
   DEBUG=True
   DATABASE_ENGINE=sqlite3
   SMS_PROVIDER=console
   ```
5. [ ] Run migrations: `python manage.py migrate`
6. [ ] Start server: `python manage.py runserver`
7. [ ] Verify: Open http://127.0.0.1:8000/ in browser

✅ Backend running!

---

## Frontend Setup - Option 1: Legacy Frontend (Port 3000)

1. [ ] Navigate to `frontend/` folder
2. [ ] Install packages: `npm install`
3. [ ] Create `.env` file:
   ```
   VITE_API_URL=http://localhost:8000/api
   ```
4. [ ] Start server: `npm run dev`
5. [ ] Open http://localhost:3000/

✅ Legacy frontend running!

---

## Frontend Setup - Option 2: Primary Frontend (Port 5173) **RECOMMENDED**

**Note:** The primary frontend is located outside this folder:
`C:\Users\HP\Downloads\mistribazaar-innerve\nirmio-project\`

If you have this folder:
1. [ ] Navigate to that directory
2. [ ] Install packages: `npm install`
3. [ ] Create `.env` file:
   ```
   VITE_API_URL=http://localhost:8000/api
   ```
4. [ ] Start server: `npm run dev`
5. [ ] Open http://localhost:5173/

✅ Primary frontend running!

---

## SMS Configuration (Optional)

To enable OTP via SMS:

1. [ ] Sign up at https://msg91.com/ (free tier available)
2. [ ] Get Auth Key from dashboard
3. [ ] Update `backend/.env`:
   ```
   SMS_PROVIDER=msg91
   MSG91_AUTH_KEY=your-auth-key-here
   MSG91_SENDER_ID=MSTRBS
   MSG91_TEMPLATE_ID=your-template-id
   ```

For development, use `SMS_PROVIDER=console` to see OTP in terminal.

---

## Create First User

### Method 1: Via Frontend
1. Open frontend (port 3000 or 5173)
2. Click "Sign Up"
3. Fill phone number (use +91 format for India)
4. Enter OTP (check terminal if using console mode)
5. Complete registration

### Method 2: Via Django Admin
1. Create superuser: `python manage.py createsuperuser`
2. Open http://127.0.0.1:8000/admin/
3. Login and create users manually

---

## Testing Features

### Test Job Creation (Consumer Role)
1. [ ] Register as CONSUMER
2. [ ] Navigate to "Create Job"
3. [ ] Fill details (title, description, budget)
4. [ ] Submit job

### Test Bidding (Mason Role)
1. [ ] Register as MASON (use different phone)
2. [ ] Browse available jobs
3. [ ] Submit bid on a job

### Test AI Features
1. [ ] Navigate to "AI Tools"
2. [ ] Try Budget Estimator
3. [ ] Try Room Visualizer (upload image)
4. [ ] Try House Designer

---

## Troubleshooting

### Issue: Backend not starting
- **Solution:** Check if port 8000 is free: `netstat -ano | findstr :8000`
- Kill process or use different port

### Issue: Frontend not starting
- **Solution:** Delete `node_modules` and run `npm install` again
- Check Node.js version: `node --version` (should be 18+)

### Issue: OTP not received
- **Solution:** If using console mode, check terminal output
- If using MSG91, verify credentials and phone number format

### Issue: Database errors
- **Solution:** Delete `backend/db.sqlite3` and run `python manage.py migrate` again

### Issue: CORS errors
- **Solution:** Ensure backend `.env` has correct CORS settings
- Frontend `.env` should point to `http://localhost:8000/api`

---

## Next Steps

After successful setup:
1. [ ] Read `DEPLOYMENT.md` for full documentation
2. [ ] Check `backend/README.md` for API reference
3. [ ] Explore AI features in frontend
4. [ ] Configure production settings when ready

---

## Quick Commands Reference

**Backend:**
```bash
# Start server
python manage.py runserver

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

**Frontend:**
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Support

For issues or questions:
- Check error messages in terminal
- Read full documentation in `DEPLOYMENT.md`
- Review code comments in source files
- Test with Postman/Thunder Client for API debugging

---

**Estimated Setup Time:** 10-15 minutes
**Difficulty:** Easy to Moderate
