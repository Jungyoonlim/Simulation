import './ModelSelectionPage.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function ModelSelectionPage({ setModelFile }) {
  const navigate = useNavigate();

  const handleFileSelect = (file) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setModelFile(url);
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
          onChange={(e) => handleFileSelect(e.target.files[0])}
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