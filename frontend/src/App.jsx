import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import SecurityDeposit from './components/SecurityDeposit'
import TheVault from './components/TheVault'
import Portfolio from './components/Portfolio'
import api from './api'

function App() {
  const [serverStatus, setServerStatus] = useState('Connecting...');
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  // Check server status
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
          {/* Auth Route */}
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth />
            }
          />

          {/* Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />
            }
          />

          {/* Security Deposit Route */}
          <Route
            path="/deposit"
            element={
              isAuthenticated ? <SecurityDeposit /> : <Navigate to="/" replace />
            }
          />

          {/* The Vault Route */}
          <Route
            path="/vault"
            element={
              isAuthenticated ? <TheVault /> : <Navigate to="/" replace />
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

