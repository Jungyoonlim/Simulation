import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

const loadObject = (file, scene, setCurrentObject, onObjectLoad) => {
    const existingObject = scene.children.find(child => child.userData.isObject3D);
    if (existingObject){
        scene.remove(existingObject);
        // Get rid of the current object when changing 
        existingObject.traverse((child) => {
            if(child.isMesh){
                if(child.geometry) {
                    child.geometry.dispose();
                }
                if(child.material) {
                    child.material.dispose();
                }
            }
        });
        setCurrentObject(null);
    }

    const objLoader = new OBJLoader;
    const mtlLoader = new MTLLoader;

    const mtlFileName = file.name.replace('.obj', '.mtl');

    mtlLoader.load('/path/to/mtl/' + mtlFileName, (materials) =>{
        materials.preload();
        objLoader.setMaterials(materials);

        // A filereader to read the .obj file content 
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e) => {
            const content = e.target.result;
            // Parse the .obj file with the loaded materials
            objLoader.parse(content, (object) => {
                // Mark the object as an object3D
                object.userData.isObject3D = true;

                // Add the loaded object to the scene
                scene.add(object);

                // Update the current object state in the component
                setCurrentObject(object);

                // Call the "onObjectLoad" prop function to notify the parent component that the object has been loaded
                if (onObjectLoad) onObjectLoad(object);
            }); 
        };
    });
};

export default loadObject;