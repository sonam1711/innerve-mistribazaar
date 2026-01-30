import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import Background from './components/Background'
import Header from './components/Header'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

// Landing page components
import Hero from './components/Hero'
import Categories from './components/Categories'
import SkilledProfessionals from './components/SkilledProfessionals'
import QualityMaterial from './components/QualityMaterial'
import BuildYourDream from './components/BuildYourDream'
import HowItWorks from './components/HowItWorks'
import GrowYourBusiness from './components/GrowYourBusiness'
import ProfessionalRegistration from './components/ProfessionalRegistration'
import ServiceAreas from './components/ServiceAreas'
import DownloadApp from './components/DownloadApp'
import OurMission from './components/OurMission'
import Footer from './components/Footer'

// Auth pages
import Login from './components/Login'
import Signup from './components/Signup'

// App pages
import DashboardPage from './pages/DashboardPage'
import JobsPage from './pages/JobsPage'
import CreateJobPage from './pages/CreateJobPage'
import JobDetailPage from './pages/JobDetailPage'
import BidsPage from './pages/BidsPage'
import ProfilePage from './pages/ProfilePage'
import BudgetEstimatorPage from './pages/BudgetEstimatorPage'
import RoomVisualizerPage from './pages/RoomVisualizerPage'
import HouseDesignerPage from './pages/HouseDesignerPage'

function LandingPage() {
  return (
    <>
      <Header />
      <Hero />
      <Categories />
      <SkilledProfessionals />
      <QualityMaterial />
      <BuildYourDream />
      <HowItWorks />
      <GrowYourBusiness />
      <ProfessionalRegistration />
      <ServiceAreas />
      <DownloadApp />
      <OurMission />
    </>
  )
}

function App() {
  const { user } = useAuthStore()

  return (
    <Router>
      <Background />
      <Navbar />
      <Toaster position="top-right" />
      
      <Routes>
        {/* Public routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
        
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
        
        <Route path="/house-designer" element={
          <ProtectedRoute>
            <HouseDesignerPage />
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
      
      <Footer />
    </Router>
  )
}

export default App
