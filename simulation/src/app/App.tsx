import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@pages/auth/login';
import SignupPage from '@pages/auth/signup';
import Dashboard from '@pages/dashboard';
import ProjectPage from '@pages/project';
import '../App.css';

function App(): JSX.Element {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Project View */}
          <Route path="/project/:projectId" element={<ProjectPage />} />

          {/* Demo/Standalone Mode */}
          <Route path="/demo" element={<ProjectPage />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
