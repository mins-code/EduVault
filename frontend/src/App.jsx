import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import SecurityDeposit from './components/SecurityDeposit'
import TheVault from './components/TheVault'
import Portfolio from './components/Portfolio'
import ApplicationTracker from './components/ApplicationTracker'
import RecruiterDashboard from './components/RecruiterDashboard'
import SecurityLog from './components/SecurityLog'
import api from './api'

function App() {
  const [serverStatus, setServerStatus] = useState('Connecting...');
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRecruiterAuthenticated, setIsRecruiterAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const recruiterToken = localStorage.getItem('recruiterToken');
    setIsAuthenticated(!!token);
    setIsRecruiterAuthenticated(!!recruiterToken);
  }, []);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await api.get('/');
        setServerStatus(response.data.message);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect to backend:', error);
        setServerStatus('Backend Offline');
        setIsConnected(false);
      }
    };

    checkServerStatus();
  }, []);

  return (
    <Router>
      <div className="relative">
        <Routes>
          {/* Auth Route (handles both Student and Recruiter) */}
          <Route
            path="/"
            element={
              localStorage.getItem('token') ? <Navigate to="/dashboard" replace /> : <Auth />
            }
          />

          {/* Recruiter Auth Redirect to unified Auth */}
          <Route
            path="/recruiter/auth"
            element={
              localStorage.getItem('recruiterToken') ? <Navigate to="/recruiter/dashboard" replace /> : <Auth />
            }
          />

          {/* Recruiter Dashboard Route */}
          <Route
            path="/recruiter/dashboard"
            element={
              localStorage.getItem('recruiterToken') ? <RecruiterDashboard /> : <Navigate to="/" replace />
            }
          />

          {/* Student Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              localStorage.getItem('token') ? <Dashboard /> : <Navigate to="/" replace />
            }
          />

          {/* Security Deposit Route */}
          <Route
            path="/deposit"
            element={
              localStorage.getItem('token') ? <SecurityDeposit /> : <Navigate to="/" replace />
            }
          />

          {/* The Vault Route */}
          <Route
            path="/vault"
            element={
              localStorage.getItem('token') ? <TheVault /> : <Navigate to="/" replace />
            }
          />

          {/* Application Tracker Route */}
          <Route
            path="/applications"
            element={
              localStorage.getItem('token') ? <ApplicationTracker /> : <Navigate to="/" replace />
            }
          />

          {/* Security Log Route */}
          <Route
            path="/security-log"
            element={
              localStorage.getItem('token') ? <SecurityLog /> : <Navigate to="/" replace />
            }
          />

          {/* Public Portfolio Route - No Auth Required */}
          <Route
            path="/portfolio/:username"
            element={<Portfolio />}
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

