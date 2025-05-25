import './ModelDisplayPage.css';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import SceneComponent from './scenecomponent';
import AnnotationForm from './AnnotationForm';
import { projects } from '../../services/supabase';

function ModelDisplayPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (projectId) {
      loadProject();
    } else {
      // Demo mode
      setLoading(false);
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      const { data, error } = await projects.get(projectId);
      if (error) throw error;
      
      setProject(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load project:', err);
      setError('Failed to load project');
      setLoading(false);
    }
  };

  const handleObjectLoad = () => {
    console.log('3D object loaded successfully');
  };

  if (loading) {
    return (
      <div className="model-display-loading">
        <div className="loading-spinner" />
        <p>Loading project...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="model-display-error">
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
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
          <h2>{project?.name || 'Untitled Project'}</h2>
        </div>
      )}
      
      <SceneComponent 
        modelPath={project?.model_url || "/OBJFile.obj"}
        onObjectLoad={handleObjectLoad}
        projectId={projectId}
      />
    </div>
  );
}

ModelDisplayPage.propTypes = {
  projectId: PropTypes.string,
};

export default ModelDisplayPage;