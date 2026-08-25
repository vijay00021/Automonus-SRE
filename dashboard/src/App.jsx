import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import Storefront from './components/Storefront';
import Login from './components/Login';
import AdminSidebar from './components/AdminSidebar';

function App() {
  return (
    <Router>
      <div className="app-container">
        <AdminSidebar />
        <Routes>
          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          
          {/* Public Organization Website */}
          <Route path="/" element={<Storefront />} />
          
          {/* Internal SRE / Admin Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
