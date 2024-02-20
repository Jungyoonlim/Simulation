import './App.css'; 
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
  const [loadError] = useState('');
  const [modelFile, setModelFile] = useState(null); 

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
   * Handles the selection of a model file.
   *
   * @param {File} file - the selected model file
   * @return {void} 
   */
  //TODO: The handleModelFileSelect function should set the model file URL correctly before navigating to the display page.
  const handleModelFileSelect = (file) => {
    setModelFile(file);
  };

  // Render the App component
  return (
    <Router>
      <div className="app-container">
        {isLoading && <div className="loading-indicator">Loading...</div>}
        {loadError && <div className="error-message">{loadError}</div>}
        <Routes>
          <Route path="/" element={<ModelSelectionPage setModelFile={handleModelFileSelect} />} />
          <Route path="/display" element={<ModelDisplayPage modelFile={modelFile} onObjectLoad={handleObjectLoad} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;