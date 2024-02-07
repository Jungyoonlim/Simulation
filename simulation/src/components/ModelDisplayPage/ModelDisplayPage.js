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
        <div>
            <button onClick={goBack}>Back to selection</button>
            <SceneComponent modelPath={modelFile} onObjectLoad={onObjectLoad} />
        </div>
    );
}

export default ModelDisplayPage;
