import './ModelSelectionPage.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import sampleModels from '../../data/sampleModels';
import ModelPreview from '../ModelPreview/ModelPreview';

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

  const handleSampleSelect = (modelPath) => {
    setModelFile(modelPath);
    localStorage.setItem('selectedModel', modelPath);
    navigate('/display');
  }


  return (
    <div className="header">
      <h1>Select a Model</h1>
      
      {/* Featured Sample Model */}
      <div className="featured-model">
        <h2>Try Our Sample Model!</h2>
        <div className="preview-container">
          <ModelPreview modelPath={sampleModels[0].path} />
        </div>
        <button
          className="featured-model-button"
          onClick={() => handleSampleSelect(sampleModels[0].path)}
        >
          Load Clock Model
        </button>
      </div>

      <div className="separator">- OR -</div>

      {/* Upload Section */}
      <div className="upload-section">
        <h2>Upload Your Own Model</h2>
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