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
      if (!file.name.toLowerCase().endsWith('.obj')) {
        alert('Please select a valid .obj file');
        return;
      }
      const url = URL.createObjectURL(file);
      setModelFile(url);
      localStorage.setItem('selectedModel', url);
      navigate('/display');
    }
  };

  const handleSampleSelect = (modelPath) => {
    setModelFile(modelPath);
    localStorage.setItem('selectedModel', modelPath);
    navigate('/display');
  }

  return (
    <div className="selection-container">
      <div className="selection-header">
        <h1>3D Model Viewer</h1>
        <p className="subtitle">View and annotate your 3D models with precision</p>
      </div>
      
      <div className="selection-content">
        {/* Featured Sample Model */}
        <div className="featured-model-card">
          <div className="card-header">
            <h2>Try Our Sample Model</h2>
            <p className="model-description">Experience the annotation features with our pre-loaded clock model</p>
          </div>
          
          <div className="preview-container">
            <ModelPreview modelPath={sampleModels[0].path} />
          </div>
          
          <div className="card-actions">
            <button
              className="primary-button"
              onClick={() => handleSampleSelect(sampleModels[0].path)}
            >
              <span className="button-icon">▶</span>
              Load Clock Model
            </button>
          </div>
        </div>

        <div className="divider">
          <span>or</span>
        </div>

        {/* Upload Section */}
        <div className="upload-card">
          <div className="card-header">
            <h2>Upload Your Own Model</h2>
            <p className="model-description">Import your own .obj files to annotate</p>
          </div>
          
          <div className="upload-area">
            <input
              type="file"
              onChange={handleFileSelect}
              accept=".obj"
              id="file-input"
              className="file-input"
            />
            <label htmlFor="file-input" className="upload-button">
              <span className="upload-icon">📁</span>
              Choose .obj File
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

ModelSelectionPage.propTypes = {
  setModelFile: PropTypes.func.isRequired,
};

export default ModelSelectionPage;