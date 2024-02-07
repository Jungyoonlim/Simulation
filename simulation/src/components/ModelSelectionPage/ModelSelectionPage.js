import React from 'react';
import { useNavigate } from 'react-router-dom';

function ModelSelectionPage({ setModelFile }){
    const navigate = useNavigate();

    const handleFileSelect = async (file) => {
        setModelFile(file); 
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