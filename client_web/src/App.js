import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/admin/Login';
import DashboardLayout from './components/admin/DashboardLayout';
import Home from './pages/admin/Home';
import AddCounsellor from './pages/admin/AddCounsellor';
import Counsellors from './pages/admin/Counsellors';
import Users from './pages/admin/Users';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/admin/login" />;
  }
  return <DashboardLayout>{children}</DashboardLayout>;
};

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" />} />
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-counsellor"
          element={
            <ProtectedRoute>
              <AddCounsellor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/counsellors"
          element={
            <ProtectedRoute>
              <Counsellors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App; 