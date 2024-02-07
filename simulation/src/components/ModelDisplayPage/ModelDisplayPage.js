'./ModelDisplayPage'
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SceneComponent from '../scene/scenecomponent';

function ModelDisplayPage({ modelFile, onObjectLoad }){
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


    const goBack = () => {
        navigate(-1); // Correct usage to go back to the previous page.
    };

    return (
        <div className="app-container">
            <div className="header">
                <button onClick={goBack} className="back-button">Back to selection</button>
                <input
                    type="file"
                    onChange={(e) => onObjectLoad(e.target.files[0])}
                    accept=".obj"
                    className="choose-file-button"
                />
            </div>
        <SceneComponent modelPath={modelFile} onObjectLoad={onObjectLoad} />
        </div>
    );
}

export default ModelDisplayPage;
