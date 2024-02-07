import './App.css'; 
import React, { useState } from 'react';
import SceneComponent from './components/scene/scenecomponent'; 

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
    <div className="app-container" style={{ width: '100vw', height: '100vh' }}>
      {isLoading && <div className="loading-indicator">Loading...</div>}
      {loadError && <div className="error-message">{loadError}</div>}
      <SceneComponent 
        onObjectLoad={handleObjectLoad} 
        onObjectLoadStart={handleObjectLoadStart}
        onObjectLoadError={handleObjectLoadError}
      />
    </div>
  );
};

export default App;

