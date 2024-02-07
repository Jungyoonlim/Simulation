import React from 'react';
import { useNavigate } from 'react-router-dom';
import SceneComponent from '../scene/scenecomponent';

function ModelDisplayPage(){
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div>
            <button onClick={goBack}>Back to selection</button>
            <SceneComponent />
        </div>
    );
}

export default ModelDisplayPage; 