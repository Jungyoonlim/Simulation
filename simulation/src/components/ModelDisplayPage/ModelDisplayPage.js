'./ModelDisplayPage.css';
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && onObjectLoad) {
            onObjectLoad(file); // Assuming onObjectLoad processes and displays the selected model
        }
    };

    const goBack = () => {
        navigate(-1); // Correct usage to go back to the previous page.
    };

    return (
        <div className="model-app-container">
            <div className="model-display-header">
                <button onClick={goBack} className="back-button">Back to selection</button>
                <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".obj"
                    className="choose-file-button-display"
                />
            </div>
        <SceneComponent modelPath={modelFile} onObjectLoad={onObjectLoad} />
        </div>
    );
}

export default ModelDisplayPage;
