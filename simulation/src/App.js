import './App.css'; 
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import SceneComponent from './components/scene/scenecomponent'; 
import ModelDisplayPage from './components/ModelDisplayPage/ModelDisplayPage';
import ModelSelectionPage from './components/ModelSelectionPage/ModelSelectionPage';

/**
 * A function that represents the main App component.
 *
 * @return {JSX.Element} The main App component
 */
const App = () => {
  // State for loading feedback
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const handleObjectLoadStart = () => {
    setIsLoading(true); // Start loading
    setLoadError(''); // Reset any previous errors
  };

  /**
   * Handles the loading of an object.
   *
   * @param {Object} object - the object being loaded
   * @return {void} 
   */
  const handleObjectLoad = (object) => {
    console.log("Object loaded:", object);
    setIsLoading(false); // End loading
  };

  /**
   * Handle the error that occurs when loading an object.
   *
   * @param {Error} error - the error that occurred
   * @return {void} 
   */
  const handleObjectLoadError = (error) => {
    console.error("Loading error:", error);
    setLoadError('Failed to load object. Please try again.');
    setIsLoading(false); // End loading
  };

  return (
    <Router>
      <div className="app-container" style={{ width: '100vw', height: '100vh' }}>
      {isLoading && <div className="loading-indicator">Loading...</div>}
      {loadError && <div className="error-message">{loadError}</div>}
      <Routes>
        <Route path="/" element={<ModelSelectionPage />} />
        <Route path="/display" element={<ModelDisplayPage />} />
      </Routes>
      </div>
    </Router>
  ); 
}

export default App;

