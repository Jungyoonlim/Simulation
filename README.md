# Simulation: 3D Software.

## Overview 
This project integrates `Three.js` with React to create a 3D model viewer capable of loading `.obj` files, handling annotations with coordinates, dynamically updating the scene with user interactions. My goal eventually is build a robotics simulation engine with this project. 

## Planned Enhancements
1. UI/UX Improvements and Object Manipulation: Future versions will feature a more intuitive user interface and allow users to manipulate objects within the 3D scene.
2. Back-end Integration: A back-end system will be developed to store annotations and save 3D files with annotations, enabling users to locally save .obj files.
3. Computer Vision for Automatic Annotations: Implement computer vision algorithms to automatically detect and annotate features within the 3D models.

## Progress
### February
#### Feb 6th, 2024 
<img width="1512" alt="Screenshot 2024-02-06 at 5 16 15 PM" src="https://github.com/Jungyoonlim/Simulation/assets/46868943/f34a32ac-94d4-4caa-8a2c-ed8645a31cf1">

- [x] DONE: Figure out why I can't have each model uploaded. (One by one!)
- [x] DONE: App.css fix. 
- [x] DONE: Better "Load Model" button.

#### Feb 7th, 2024 
<img width="1512" alt="Screenshot 2024-02-07 at 1 29 44 PM" src="https://github.com/Jungyoonlim/Simulation/assets/46868943/1fbf22de-8250-49db-874c-c73c007f3f6f">

- [x] DONE: Redirection to another page. (BrowserRouter, two new pages: ModelSelection and ModelDisplay) 
- [x] DONE: original colors for 3D models. 
- [x] DONE: how can I have the 3d model show 360 degrees. 
- [x] DONE: Better Lighting. 
- [x] DONE: CSS Fixes for prettier UI. 
- [x] DONE: Fix Buttons.

![Screenshot 2024-02-08 at 3 31 48 AM](https://github.com/Jungyoonlim/Simulation/assets/46868943/e9e1aae8-479e-4db5-9dff-a3b6686ddda0)
![Screenshot 2024-02-08 at 3 32 29 AM](https://github.com/Jungyoonlim/Simulation/assets/46868943/2789e74e-f5c6-4ccb-bbc4-5fdc0e13d122)


#### Feb 8th, 2024 
- [x] DONE: Very Simple Annotation Tool. (local host 3000 sign pop-up)

<img width="1503" alt="Screenshot 2024-02-09 at 2 15 11 PM" src="https://github.com/Jungyoonlim/Simulation/assets/46868943/79a9e5b1-b4a6-4fa8-8036-91e4eb89809a">

#### Feb 9th, 2024 
- [x] DONE: Annotation List on the website. 

#### Feb 10th, 2024
- [] IN-PROGRESS: Learning `Three.js` properly. 
- [] IN-PROGRESS: Annotation Tracking, Annotation Styling
- [] IN-PROGRESS: Annotation Store.  
- [] IN-PROGRESS: Integrating backend and frontend.


- [] TODO: Login (Probably Backend for this). 
- [] TODO: Build out database (PostgresSQL). 

# PLANS FOR A ROBOTICS ENVIRONMENT SIMULATION SOFTWARE: 
- [] TODO: Object Detection and Recognition. Integrate TensorFlow.js to detect objects.
- [] TODO: Path Planning Visualization. Draw Lines and Paths in my 3D Scene that represent the robot's planned movement. Calculate paths using algorithms like A or RRT then visualizing these paths with `three.js` objects like `THREE.Line.4` 
- [] TODO: Simulate Robot Movement and Interaction: Controls for simulated robot movement within the 3D environment. Moving an object around the scene first then simulating physics for realistic interactions. 
- [] TODO: Have sensor readings from real-world data from robots and convert data formats to `three.js` to update the scene in real-time. 

- [] TODO: Bring the Prototype 3D -> 2D Maps Logic. (Bring from PyQt Project)
- [] TODO: Collaboration - Like Git Version of this. 
- [] TODO: Users to Interact with 3D Model. (Need to think more on how to interact with the model)

- [] TODO: Just by describing where to go in English, make the robot / 3D object to move. (Need to expand on this) 

Ideas
 - 3D Environmental Mapping: Use 3D modeling to map out terrains and underwater topographies, aiding in the study of habitats, tracking changes, and planning conservation efforts.
 - Have AI to assist in building 3D ?  
 - 3D NFT Artwork? (https://www.escherreality.com/nft-artwork/)
    

- [] TODO: LLM to build a 3D model? 


