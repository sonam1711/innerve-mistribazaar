# Mistribazar Frontend

Modern React + TypeScript frontend for the Mistribazar construction marketplace.

## Features

- **Authentication**: Phone-based login with JWT tokens
- **Role-Based Access**: CONSUMER, MASON, TRADER roles
- **Job Management**: Create, browse, and manage construction jobs
- **Bidding System**: Submit and manage bids on jobs
- **3D House Designer**: AI-powered Blender script generation
- **Budget Estimator**: AI-based construction cost estimation
- **Location-Based Discovery**: Find jobs near your location

## Tech Stack

- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- React Router v6 (routing)
- Zustand (state management)
- Axios (API calls)
- React Hot Toast (notifications)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running on http://localhost:8000

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at http://localhost:3000

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components (routes)
├── store/         # Zustand state management
├── utils/         # Utility functions, API client
├── App.tsx        # Main app component with routing
├── main.tsx       # Entry point
└── index.css      # Global styles
```

## Environment Variables

Create a `.env` file:

```
VITE_API_URL=http://localhost:8000/api
```

## API Integration

All API calls go through `src/utils/api.ts` which:
- Attaches JWT tokens automatically
- Handles token refresh on 401 errors
- Provides centralized error handling

## State Management

Using Zustand with three main stores:
- `authStore`: User authentication and profile
- `jobStore`: Job listings and management
- `bidStore`: Bid management and tracking
