import React from 'react';
import { useNavigate } from 'react-router-dom';

function ModelSelectionPage({ setModelFile }){
    const navigate = useNavigate();

    // TODO: The handleFileSelect function should check if a file was selected before attempting to set the model file URL.
    const handleFileSelect = (file) => {
        const url = URL.createObjectURL(file);
        setModelFile(url); 
        navigate('/display');
    };

    return(
        <div>
            <h1>Select a Model</h1>
            <input
                type="file"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                accept=".obj"
                className="choose-file-button"
            />
        </div>
    );
}

export default ModelSelectionPage; 