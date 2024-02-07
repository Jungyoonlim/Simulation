import React from 'react';
import { useNavigate } from 'react-router-dom';

function ModelSelectionPage(){
    const navigate = useNavigate();

    const handleFileSelect = (file) =>{
        navigate('/display');
    };

    return(
        <>
        <h1>Select a Model</h1>
        <input
          type="file"
          onChange={(e) => handleFileSelect(e.target.files[0])}
          accept=".obj"
          className="choose-file-button"
        />
      </>
    );
}

export default ModelSelectionPage; 