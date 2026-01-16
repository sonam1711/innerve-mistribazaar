# Mistribazar Frontend

React.js frontend for the Mistribazar construction marketplace platform.

## Features

- **Role-based dashboard** (Consumer, Mason, Trader)
- **Job browsing and creation**
- **Real-time bidding system**
- **AI Budget Estimator** (Conversational flow)
- **AI Room Visualizer** (Before/After comparison)
- **User profile management**
- **Responsive design** (Mobile-first)

## Tech Stack

- React 18
- Vite
- React Router v6
- Zustand (State management)
- Axios (API calls)
- Tailwind CSS
- Lucide Icons
- React Hot Toast

## Setup Instructions

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:8000/api
```

### Development

```bash
# Start development server
npm run dev
```

Server will start at `http://localhost:3000`

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
frontend/
├── public/                 # Static files
├── src/
│   ├── components/        # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── JobCard.jsx
│   │   ├── BidCard.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/             # Page components
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── JobsPage.jsx
│   │   ├── JobDetailPage.jsx
│   │   ├── CreateJobPage.jsx
│   │   ├── BidsPage.jsx
│   │   ├── BudgetEstimatorPage.jsx
│   │   ├── RoomVisualizerPage.jsx
│   │   └── ProfilePage.jsx
│   ├── store/             # Zustand state management
│   │   ├── authStore.js
│   │   ├── jobStore.js
│   │   └── bidStore.js
│   ├── utils/             # Utility functions
│   │   └── api.js         # Axios configuration
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Key Features

### Authentication

- Phone-based login/registration
- JWT token management
- Auto token refresh
- Protected routes by role

### Consumer Features

- Post construction/repair jobs
- View and compare bids
- AI-powered budget estimation
- Room visualization tool
- Accept/reject bids
- Rate completed work

### Mason/Trader Features

- Browse nearby jobs
- Submit competitive bids
- View bid status
- Manage profile
- Track earnings

### AI Features

#### Budget Estimator
- Conversational 5-step flow
- Work type selection
- Area-based calculation
- City and urgency multipliers
- Detailed breakdown
- Required skills list

#### Room Visualizer
- Upload current room image
- Describe desired changes
- Select design style
- Before/after comparison
- Convert to job request

## API Integration

All API calls use centralized axios instance with:
- Base URL configuration
- Auto-attach JWT tokens
- Token refresh logic
- Error handling

## State Management

Using Zustand for:
- **authStore**: User authentication & profile
- **jobStore**: Job listings & details
- **bidStore**: Bidding & recommendations

## Styling

- Tailwind CSS utility classes
- Custom component classes
- Responsive breakpoints
- Primary brand color scheme

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

### Manual Deployment

1. Build the project: `npm run build`
2. Upload `dist/` folder to hosting
3. Configure environment variables
4. Set up routing (SPA mode)

## Environment Variables for Production

```env
VITE_API_URL=https://your-backend-api.com/api
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Code splitting by route
- Lazy loading
- Optimized images
- Minimal bundle size

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

Proprietary - Mistribazar 2026
