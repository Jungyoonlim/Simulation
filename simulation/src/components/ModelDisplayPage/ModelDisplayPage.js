import './ModelDisplayPage.css';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import SceneComponent from './refactored';

export default function ModelDisplayPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  function loadProject() {
    console.log('Loading project:', projectId);
    // Use the actual 3D model file that exists in your project
    const projectData = {
      id: projectId || '1',
      name: `Project ${projectId || 'Demo'}`,
      model_url: `/assets/models/Clock_obj.obj` // Using the actual model file found
    };
    setProject(projectData);
    // Loading will be set to false when the 3D model loads via handleObjectLoad
  }

  useEffect(() => {
    loadProject();
    // Set loading to false after a short delay to show the 3D viewer immediately
    setTimeout(() => {
      setLoading(false);
    }, 500); // Show viewer after 500ms regardless of model load status
  }, [projectId]);

  const handleObjectLoad = () => {
    console.log('3D object loaded successfully');
    // Don't set loading here anymore - we handle it with setTimeout
  };

  if (loading) {
    return (
      <div className="model-display-loading">
        <div className="loading-spinner" />
        <p>Loading project...</p>
      </div>
    );
  }

  return (
    <div className="model-display-container">
      {projectId && (
        <div className="project-header">
          <button 
            className="back-button"
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Dashboard
          </button>
          <h2>{project?.name || 'Loading Project...'}</h2>
        </div>
      )}
      
      {/* Show loading overlay while loading, but still render SceneComponent underneath */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000
        }}>
          <div className="model-display-loading">
            <div className="loading-spinner" />
            <p>Loading 3D viewer...</p>
          </div>
        </div>
      )}
      
      {/* Always render SceneComponent so it can load and trigger onObjectLoad */}
      <SceneComponent 
        modelPath={project?.model_url || "/assets/models/Clock_obj.obj"}
        // onObjectLoad will be triggered once the 3D viewer finishes loading. Until then, the loading spinner stays visible.
        onObjectLoad={handleObjectLoad}
        projectId={projectId}
      />
    </div>
  );
}

ModelDisplayPage.propTypes = {
  projectId: PropTypes.string,
};