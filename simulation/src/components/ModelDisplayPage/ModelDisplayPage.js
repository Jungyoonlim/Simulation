import './ModelDisplayPage.css';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import SceneComponent from './sceneComponent';
import AnnotationForm from './AnnotationForm';

function ModelDisplayPage({ modelFile, onObjectLoad }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve the stored model file info
    const modelName = localStorage.getItem('selectedModel');
    if (!modelName) {
      console.log("No model selected, redirecting to selection page");
      navigate('/');
    }
    // Proceed to load or display the model using modelName
    // Note: Actual model loading logic will depend on how SceneComponent expects to receive and process the model
  }, [navigate]);

  // Navigate to the previous page for the back button
  const goBack = () => {
    navigate(-1);
  };

  // Save the annotation to local storage when the form is submitted. TODO: Connect with Backend.
  const handleSaveAnnotation = (annotation) => {
    // Save the annotation to local storage
    const annotations = JSON.parse(localStorage.getItem('annotations')) || [];
    const updatedAnnotations = [...annotations, annotation];
    localStorage.setItem('annotations', JSON.stringify(updatedAnnotations));
  };

  return (
    <div className="model-app-container">
      <div className="model-display-header">
        <button onClick={goBack} className="back-button">
          Back to selection
        </button>
      </div>
      <AnnotationForm position={{}} onSave={handleSaveAnnotation} />
      <SceneComponent modelPath={modelFile} onObjectLoad={onObjectLoad} />
    </div>
  );
}

ModelDisplayPage.propTypes = {
  modelFile: PropTypes.string.isRequired,
  onObjectLoad: PropTypes.func.isRequired,
};

export default ModelDisplayPage;