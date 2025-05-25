import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/Auth/LoginPage';
import SignupPage from './components/Auth/SignupPage';
import Dashboard from './components/Dashboard/Dashboard';
import ModelDisplayPage from './components/ModelDisplayPage/ModelDisplayPage';
import './App.css';

/**
 * A function that represents the main App component.
 *
 * @return {JSX.Element} The main App component
 */
function App() {
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
          <Route path="/project/:projectId" element={<ModelDisplayPage />} />
          
          {/* Demo/Standalone Mode */}
          <Route path="/demo" element={<ModelDisplayPage />} />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;