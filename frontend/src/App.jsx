import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import JobsPage from './pages/JobsPage'
import JobDetailPage from './pages/JobDetailPage'
import CreateJobPage from './pages/CreateJobPage'
import BidsPage from './pages/BidsPage'
import BudgetEstimatorPage from './pages/BudgetEstimatorPage'
import RoomVisualizerPage from './pages/RoomVisualizerPage'
import ProfilePage from './pages/ProfilePage'

// Components
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { user } = useAuthStore()

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Toaster position="top-right" />
        
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          <Route path="/jobs" element={
            <ProtectedRoute>
              <JobsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/jobs/:id" element={
            <ProtectedRoute>
              <JobDetailPage />
            </ProtectedRoute>
          } />
          
          <Route path="/jobs/create" element={
            <ProtectedRoute requiredRole="CONSUMER">
              <CreateJobPage />
            </ProtectedRoute>
          } />
          
          <Route path="/bids" element={
            <ProtectedRoute>
              <BidsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/budget-estimator" element={
            <ProtectedRoute>
              <BudgetEstimatorPage />
            </ProtectedRoute>
          } />
          
          <Route path="/room-visualizer" element={
            <ProtectedRoute requiredRole="CONSUMER">
              <RoomVisualizerPage />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          {/* 404 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
