# Mistribazar - Construction Marketplace MVP

Complete web-based marketplace connecting consumers, masons, and material traders.

## 🎯 Project Overview

**Mistribazar** solves the construction ecosystem's organization problem by providing:

- Role-based marketplace (Consumer, Mason, Trader)
- Location-based discovery
- Transparent bidding system
- AI-assisted budget estimation
- AI-powered room visualization
- Trust through ratings

## 🏗️ Architecture

```
mistribazar/
├── backend/          # Django REST API
│   ├── config/      # Django settings
│   ├── users/       # User management & auth
│   ├── jobs/        # Job postings
│   ├── bids/        # Bidding system
│   ├── ratings/     # Review system
│   └── ai_engine/   # AI features
│
└── frontend/         # React.js web app
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── store/
    │   └── utils/
    └── public/
```

## 🚀 Quick Start

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Setup database
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run server
python manage.py runserver
```

Backend will run at: `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run at: `http://localhost:3000`

## 📚 Documentation

- [Backend README](./backend/README.md) - API documentation & setup
- [Frontend README](./frontend/README.md) - UI components & deployment

## 🔑 Key Features

### For Consumers
✅ Post construction/repair jobs  
✅ Receive competitive bids  
✅ AI budget estimation  
✅ Room visualization  
✅ Compare providers with AI recommendations  
✅ Rate completed work  

### For Masons/Traders
✅ Discover nearby jobs  
✅ Submit bids  
✅ Build reputation through ratings  
✅ Manage availability  

### AI Features
✅ **Budget Estimator** - Rule-based conversational flow  
✅ **Recommendation System** - Explainable scoring (Rating 40%, Price 30%, Distance 20%, Availability 10%)  
✅ **Room Visualizer** - Image-to-image AI generation (MVP: API integration placeholder)  

## 🛠️ Tech Stack

**Backend:**
- Python 3.10+
- Django 4.2
- Django Rest Framework
- PostgreSQL
- JWT Authentication

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Zustand
- Axios
- React Router v6

**AI:**
- Rule-based logic (no ML training)
- External API integration ready
- Explainable algorithms

## 📊 Database Models

- **User** - Phone auth, role-based access
- **MasonProfile** - Skills, rates, experience
- **TraderProfile** - Materials, delivery info
- **Job** - Project postings
- **Bid** - Competitive bidding
- **Rating** - Trust system

## 🔐 Security

- JWT authentication
- Role-based permissions
- Input validation
- Secure password hashing
- CORS configuration
- HTTPS ready

## 📱 API Endpoints

```
/api/users/
  - POST /register/
  - POST /login/
  - GET /profile/
  - PUT /profile/

/api/jobs/
  - GET /
  - POST /create/
  - GET /<id>/
  - GET /nearby/

/api/bids/
  - GET /
  - POST /create/
  - POST /<id>/accept/
  - POST /<id>/reject/

/api/ai/
  - POST /budget/estimate/
  - GET /recommend/<job_id>/
  - POST /visualize/
```

## 🚀 Deployment

### Backend (Render/Railway/AWS)
1. Set environment variables
2. Configure PostgreSQL
3. Run migrations
4. Deploy!

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `dist/` folder
3. Configure environment
4. Done!

## 📝 Environment Variables

**Backend (.env):**
```env
SECRET_KEY=your-secret-key
DEBUG=False
DATABASE_URL=postgresql://...
CLOUDINARY_API_KEY=...
IMAGE_TO_IMAGE_API_KEY=...
```

**Frontend (.env):**
```env
VITE_API_URL=https://your-api.com/api
```

## 🧪 Testing

```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm run test
```

## 📈 Future Enhancements

- [ ] Real-time chat between users
- [ ] Payment gateway integration
- [ ] Advanced filters & search
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Video consultations

## 👥 User Roles

| Role | Can Post Jobs | Can Bid | Can Rate |
|------|--------------|---------|----------|
| Consumer | ✅ | ❌ | ✅ |
| Mason | ❌ | ✅ | ❌ |
| Trader | ❌ | ✅ | ❌ |

## 🎨 Design Principles

- **Mobile-first** - Responsive design
- **Image-first** - Visual content priority
- **Simple workflows** - 3-click rule
- **Big buttons** - Easy interaction
- **Clear feedback** - Toast notifications

## 📄 License

Proprietary - Mistribazar 2026

## 🤝 Support

For issues or questions:
1. Check documentation
2. Review API endpoints
3. Create an issue
4. Contact support

---

Built with ❤️ for the construction industry
