import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import ProjectSettings from './pages/ProjectSettings';
import Profile from './pages/Profile';
import AppShell from './components/AppShell';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;
  return !user ? children : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><AppShell><Dashboard /></AppShell></PrivateRoute>} />
      <Route path="/projects" element={<PrivateRoute><AppShell><Projects /></AppShell></PrivateRoute>} />
      <Route path="/projects/:id" element={<PrivateRoute><AppShell><ProjectDetail /></AppShell></PrivateRoute>} />
      <Route path="/projects/:id/settings" element={<PrivateRoute><AppShell><ProjectSettings /></AppShell></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><AppShell><Profile /></AppShell></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1e1e28', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.08)' },
          success: { iconTheme: { primary: '#10b981', secondary: '#0f0f13' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#0f0f13' } },
        }} />
      </BrowserRouter>
    </AuthProvider>
  );
}
