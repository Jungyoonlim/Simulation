import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { SCENE_CONFIG, MATERIAL_CONFIG } from '../constants';
import { SceneRefs } from '../types';

export class ThreeService {
  private refs: SceneRefs = {
    scene: null,
    camera: null,
    renderer: null,
    labelRenderer: null,
    controls: null,
    currentObject: null
  };

  private animationId: number | null = null;

  initialize(container: HTMLElement): SceneRefs {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(SCENE_CONFIG.backgroundColor);
    this.refs.scene = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      SCENE_CONFIG.camera.fov,
      window.innerWidth / window.innerHeight,
      SCENE_CONFIG.camera.near,
      SCENE_CONFIG.camera.far
    );
    camera.position.set(
      SCENE_CONFIG.camera.initialPosition.x,
      SCENE_CONFIG.camera.initialPosition.y,
      SCENE_CONFIG.camera.initialPosition.z
    );
    this.refs.camera = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: SCENE_CONFIG.renderer.antialias,
      alpha: SCENE_CONFIG.renderer.alpha,
      powerPreference: SCENE_CONFIG.renderer.powerPreference as WebGLPowerPreference
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = SCENE_CONFIG.renderer.shadowMap.enabled;
    renderer.shadowMap.type = SCENE_CONFIG.renderer.shadowMap.type;
    renderer.toneMapping = SCENE_CONFIG.renderer.toneMapping;
    renderer.toneMappingExposure = SCENE_CONFIG.renderer.toneMappingExposure;
    this.refs.renderer = renderer;
    container.appendChild(renderer.domElement);

    // Label Renderer setup
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';
    this.refs.labelRenderer = labelRenderer;
    container.appendChild(labelRenderer.domElement);

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = SCENE_CONFIG.controls.enableDamping;
    controls.dampingFactor = SCENE_CONFIG.controls.dampingFactor;
    controls.screenSpacePanning = SCENE_CONFIG.controls.screenSpacePanning;
    controls.minDistance = SCENE_CONFIG.controls.minDistance;
    controls.maxDistance = SCENE_CONFIG.controls.maxDistance;
    this.refs.controls = controls;

    // Lighting setup
    this.setupLighting(scene);

    // Grid helper
    const gridHelper = new THREE.GridHelper(
      SCENE_CONFIG.grid.size,
      SCENE_CONFIG.grid.divisions,
      SCENE_CONFIG.grid.colorCenterLine,
      SCENE_CONFIG.grid.colorGrid
    );
    scene.add(gridHelper);

    // Start animation loop
    this.animate();

    // Handle resize
    window.addEventListener('resize', this.handleResize);

    return this.refs;
  }

  private setupLighting(scene: THREE.Scene): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(
      SCENE_CONFIG.lights.ambient.color,
      SCENE_CONFIG.lights.ambient.intensity
    );
    scene.add(ambientLight);

    // Main directional light
    const mainLight = new THREE.DirectionalLight(
      SCENE_CONFIG.lights.main.color,
      SCENE_CONFIG.lights.main.intensity
    );
    mainLight.position.set(
      SCENE_CONFIG.lights.main.position.x,
      SCENE_CONFIG.lights.main.position.y,
      SCENE_CONFIG.lights.main.position.z
    );
    mainLight.castShadow = true;
    mainLight.shadow.camera.near = SCENE_CONFIG.lights.main.shadow.near;
    mainLight.shadow.camera.far = SCENE_CONFIG.lights.main.shadow.far;
    mainLight.shadow.camera.left = SCENE_CONFIG.lights.main.shadow.left;
    mainLight.shadow.camera.right = SCENE_CONFIG.lights.main.shadow.right;
    mainLight.shadow.camera.top = SCENE_CONFIG.lights.main.shadow.top;
    mainLight.shadow.camera.bottom = SCENE_CONFIG.lights.main.shadow.bottom;
    scene.add(mainLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(
      SCENE_CONFIG.lights.fill.color,
      SCENE_CONFIG.lights.fill.intensity
    );
    fillLight.position.set(
      SCENE_CONFIG.lights.fill.position.x,
      SCENE_CONFIG.lights.fill.position.y,
      SCENE_CONFIG.lights.fill.position.z
    );
    scene.add(fillLight);
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    
    if (this.refs.controls) {
      this.refs.controls.update();
    }
    
    if (this.refs.renderer && this.refs.scene && this.refs.camera) {
      this.refs.renderer.render(this.refs.scene, this.refs.camera);
    }
    
    if (this.refs.labelRenderer && this.refs.scene && this.refs.camera) {
      this.refs.labelRenderer.render(this.refs.scene, this.refs.camera);
    }
  };

  private handleResize = (): void => {
    if (!this.refs.camera || !this.refs.renderer || !this.refs.labelRenderer) return;

    this.refs.camera.aspect = window.innerWidth / window.innerHeight;
    this.refs.camera.updateProjectionMatrix();
    this.refs.renderer.setSize(window.innerWidth, window.innerHeight);
    this.refs.labelRenderer.setSize(window.innerWidth, window.innerHeight);
  };

  async loadModel(modelPath: string): Promise<THREE.Object3D | null> {
    return new Promise((resolve, reject) => {
      const loader = new OBJLoader();
      
      loader.load(
        modelPath,
        (object) => {
          // Clean up previous object
          if (this.refs.currentObject && this.refs.scene) {
            this.refs.scene.remove(this.refs.currentObject);
            this.refs.currentObject.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.geometry.dispose();
                if (Array.isArray(mesh.material)) {
                  mesh.material.forEach(mat => mat.dispose());
                } else {
                  mesh.material.dispose();
                }
              }
            });
          }

          // Apply materials
          object.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.material = new THREE.MeshPhysicalMaterial(MATERIAL_CONFIG.default);
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
          });

          this.refs.currentObject = object;
          if (this.refs.scene) {
            this.refs.scene.add(object);
          }
          
          this.adjustCameraToObject(object);
          resolve(object);
        },
        (xhr) => {
          console.log(`Loading model: ${(xhr.loaded / xhr.total * 100).toFixed(2)}% loaded`);
        },
        (error) => {
          console.error('Error loading model:', error);
          reject(error);
        }
      );
    });
  }

  adjustCameraToObject(object: THREE.Object3D): void {
    if (!this.refs.camera || !this.refs.controls) return;

    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.refs.camera.fov * (Math.PI / 180);
    const cameraZ = Math.abs(maxDim / Math.sin(fov / 2));

    this.refs.camera.position.set(center.x, center.y, center.z + cameraZ * 1.2);
    this.refs.controls.target.copy(center);
    this.refs.controls.update();
  }

  raycast(mouse: THREE.Vector2, objects?: THREE.Object3D[]): THREE.Intersection[] {
    if (!this.refs.camera || !this.refs.scene) return [];

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.refs.camera);

    const targetObjects = objects || [this.refs.currentObject].filter(Boolean) as THREE.Object3D[];
    return raycaster.intersectObjects(targetObjects, true);
  }

  getRefs(): SceneRefs {
    return this.refs;
  }

  dispose(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    window.removeEventListener('resize', this.handleResize);

    if (this.refs.controls) {
      this.refs.controls.dispose();
    }

    if (this.refs.renderer) {
      this.refs.renderer.dispose();
      this.refs.renderer.domElement.remove();
    }

    if (this.refs.labelRenderer) {
      this.refs.labelRenderer.domElement.remove();
    }

    // Clean up scene
    if (this.refs.scene) {
      this.refs.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => mat.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      });
    }
  }
}

export const threeService = new ThreeService();
