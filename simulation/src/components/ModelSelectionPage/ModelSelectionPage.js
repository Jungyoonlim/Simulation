import './ModelSelectionPage.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function ModelSelectionPage({ setModelFile }) {
  const navigate = useNavigate();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.obj')) {
        alert('Please select a valid .obj file');
        return;
      }

      // Create URL for the file
      const url = URL.createObjectURL(file);
      setModelFile(url);
      
      // Store filename in localStorage
      localStorage.setItem('selectedModel', url);
      
      // Navigate to display page
      navigate('/display');
    } else {
      console.log('No file selected');
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>Select a Model</h1>
        <input
          type="file"
          onChange={handleFileSelect}
          accept=".obj"
          className="choose-file-button-selection"
        />
      </div>
    </div>
  );
}

ModelSelectionPage.propTypes = {
  setModelFile: PropTypes.func.isRequired,
};

export default ModelSelectionPage;