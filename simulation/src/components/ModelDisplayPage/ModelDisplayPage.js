import './ModelDisplayPage.css';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import SceneComponent from './scenecomponent';
import AnnotationForm from './AnnotationForm';

function ModelDisplayPage({ modelFile, onObjectLoad }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a model file prop
    if (!modelFile) {
      console.log("No model file provided, redirecting to selection page");
      navigate('/');
      return;
    }

    // Store the current model file URL in localStorage
    localStorage.setItem('selectedModel', modelFile);
  }, [modelFile, navigate]);

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