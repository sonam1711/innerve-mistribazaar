# Mistribazar - Construction Marketplace Backend

A Django REST API backend for the Mistribazar construction marketplace platform.

## Features

- **Role-based authentication** (Consumer, Mason, Trader)
- **Job posting and bidding system**
- **Location-based discovery**
- **AI Budget Assistant** (Rule-based estimation)
- **AI Room Visualization** (Image-to-image generation)
- **Explainable recommendation system**
- **Rating and review system**

## Tech Stack

- Python 3.10+
- Django 4.2
- Django Rest Framework
- PostgreSQL
- JWT Authentication

## Setup Instructions

### 1. Prerequisites

- Python 3.10 or higher
- PostgreSQL 12 or higher
- pip and virtualenv

### 2. Clone and Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE mistribazar_db;
CREATE USER mistribazar_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE mistribazar_db TO mistribazar_user;
```

### 4. Environment Configuration

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_NAME=mistribazar_db
DATABASE_USER=mistribazar_user
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
DATABASE_PORT=5432

# Optional: Cloudinary for image uploads
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional: AI Image Generation API
IMAGE_TO_IMAGE_API_KEY=your-api-key
IMAGE_TO_IMAGE_API_URL=https://api.example.com/v1/image-to-image
```

### 5. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser

```bash
python manage.py createsuperuser
```

### 7. Run Development Server

```bash
python manage.py runserver
```

Server will start at `http://localhost:8000`

## API Endpoints

### Authentication

- `POST /api/users/register/` - User registration
- `POST /api/users/login/` - User login
- `POST /api/users/token/refresh/` - Refresh JWT token
- `GET /api/users/profile/` - Get current user profile
- `PUT /api/users/profile/` - Update profile

### Jobs

- `GET /api/jobs/` - List all jobs (with filters)
- `POST /api/jobs/create/` - Create new job (Consumer only)
- `GET /api/jobs/<id>/` - Get job details
- `PUT /api/jobs/<id>/` - Update job
- `DELETE /api/jobs/<id>/` - Delete job
- `GET /api/jobs/my-jobs/` - Get my posted jobs
- `GET /api/jobs/nearby/` - Get nearby jobs (Mason/Trader)
- `PATCH /api/jobs/<id>/status/` - Update job status

### Bids

- `GET /api/bids/` - List bids
- `POST /api/bids/create/` - Create bid (Mason/Trader only)
- `GET /api/bids/<id>/` - Get bid details
- `GET /api/bids/job/<job_id>/` - Get all bids for a job
- `POST /api/bids/<id>/accept/` - Accept bid (Consumer only)
- `POST /api/bids/<id>/reject/` - Reject bid (Consumer only)
- `POST /api/bids/<id>/withdraw/` - Withdraw bid (Bidder only)

### Ratings

- `GET /api/ratings/` - List ratings
- `POST /api/ratings/create/` - Create rating (Consumer only)
- `GET /api/ratings/<id>/` - Get rating details
- `GET /api/ratings/user/<user_id>/` - Get ratings for a user

### AI Features

- `GET /api/ai/budget/conversation/` - Start budget estimation flow
- `POST /api/ai/budget/conversation/` - Continue budget flow
- `POST /api/ai/budget/estimate/` - Direct budget estimate
- `GET /api/ai/recommend/<job_id>/` - Get recommended providers
- `POST /api/ai/visualize/` - Generate room visualization
- `GET /api/ai/visualize/styles/` - Get supported styles
- `POST /api/ai/visualize/create-job/` - Create job from visualization

## Example API Usage

### Register User

```bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "+1234567890",
    "password": "securepass123",
    "password2": "securepass123",
    "role": "CONSUMER",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "language": "English"
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "password": "securepass123"
  }'
```

### Create Job (with JWT token)

```bash
curl -X POST http://localhost:8000/api/jobs/create/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "job_type": "RENOVATION",
    "title": "Kitchen Renovation",
    "description": "Need complete kitchen renovation",
    "budget_min": 50000,
    "budget_max": 80000,
    "latitude": 19.0760,
    "longitude": 72.8777,
    "address": "Mumbai, Maharashtra",
    "image_urls": ["https://example.com/kitchen.jpg"]
  }'
```

### Get Budget Estimate

```bash
curl -X POST http://localhost:8000/api/ai/budget/estimate/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "work_type": "RENOVATION",
    "area_sqft": 200,
    "quality": "standard",
    "city_tier": "tier1",
    "urgency": "normal"
  }'
```

## Database Models

### User
- Custom user model with phone authentication
- Roles: CONSUMER, MASON, TRADER
- Location (latitude, longitude)
- Rating

### MasonProfile
- Extended profile for masons
- Skills, daily rate, experience
- Completed jobs, availability

### TraderProfile
- Extended profile for traders
- Materials supplied, delivery radius
- Business name, completed orders

### Job
- Job postings by consumers
- Type: REPAIR, CONSTRUCTION
- Budget range, location
- Status: OPEN, IN_PROGRESS, COMPLETED, CANCELLED

### Bid
- Bids submitted by masons/traders
- Bid amount, estimated days
- Status: PENDING, ACCEPTED, REJECTED, WITHDRAWN

### Rating
- Ratings after job completion
- 1-5 star rating with review
- Auto-updates user's average rating

## AI Features

### 1. Budget Estimator
- Conversational flow (5 steps)
- Rule-based calculation
- City and urgency multipliers
- Returns budget range with breakdown

### 2. Recommendation System
- Scores providers on 4 factors:
  - Rating (40%)
  - Price (30%)
  - Distance (20%)
  - Availability (10%)
- Explainable reasons for each recommendation

### 3. Room Visualizer
- Image-to-image AI generation
- Multiple style options
- Can convert visualization to job request
- Disclaimer: "Indicative visualization"

## Security Features

- JWT authentication
- Role-based permissions
- Password validation
- Input sanitization
- HTTPS ready

## Deployment

### Environment Variables for Production

```env
DEBUG=False
ALLOWED_HOSTS=your-domain.com
SECRET_KEY=generate-strong-secret-key
DATABASE_URL=postgresql://user:pass@host:port/db

# Use managed PostgreSQL
# Use Cloudinary/S3 for media
# Use Redis for caching (optional)
```

### Deploy to Render/Railway

1. Create `render.yaml` or `railway.json`
2. Set environment variables
3. Connect PostgreSQL database
4. Deploy!

### Deploy to AWS

1. Use Elastic Beanstalk or EC2
2. RDS for PostgreSQL
3. S3 for media files
4. CloudFront for CDN

## Testing

```bash
# Run tests
python manage.py test

# Create test data
python manage.py loaddata fixtures/test_data.json
```

## Admin Panel

Access admin panel at `http://localhost:8000/admin/`

Use superuser credentials created earlier.

## API Documentation

For detailed API documentation, visit:
- Swagger UI: `/api/swagger/`
- ReDoc: `/api/redoc/`

(Install `drf-yasg` for auto-generated docs)

## Support

For issues or questions, please create an issue in the repository.

## License

Proprietary - Mistribazar 2026
