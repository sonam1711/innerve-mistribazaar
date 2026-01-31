import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import JobsPage from './pages/JobsPage'
import CreateJobPage from './pages/CreateJobPage'
import JobDetailPage from './pages/JobDetailPage'
import BidsPage from './pages/BidsPage'
import ProfilePage from './pages/ProfilePage'
import BudgetEstimatorPage from './pages/BudgetEstimatorPage'
import HomePlannerPage from './pages/HomePlannerPage'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} 
        />
        
        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <JobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <ProtectedRoute>
              <JobDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-job"
          element={
            <ProtectedRoute requiredRole="CONSUMER">
              <CreateJobPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bids"
          element={
            <ProtectedRoute>
              <BidsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/budget-estimator"
          element={
            <ProtectedRoute>
              <BudgetEstimatorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home-planner"
          element={
            <ProtectedRoute requiredRole="CONSUMER">
              <HomePlannerPage />
            </ProtectedRoute>
          }
        />
        {/* Redirect old 3d-designer path to home-planner */}
        <Route path="/3d-designer" element={<Navigate to="/home-planner" />} />
        
        {/* Default redirect */}
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
        />
      </Routes>
    </div>
  )
}

export default App
