import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { Annotation, PendingAnnotation, SceneRefs, AnnotationRendererProps } from '../types';
import { ANNOTATION_CONFIG } from '../constants';
import styles from '../styles/AnnotationRenderer.module.css';

export const AnnotationRenderer: React.FC<AnnotationRendererProps> = ({
  sceneRefs,
  annotations,
  selectedAnnotation,
  hoveredAnnotation,
  pendingAnnotation,
  showAISuggestions,
  isAnnotationMode,
  onAnnotationSave,
  onAnnotationCancel,
  onInputChange
}) => {

  useEffect(() => {
    const { scene, camera, currentObject } = sceneRefs;
    if (!scene || !camera) return;

    // Clear all annotation markers
    scene.children = scene.children.filter(child => !child.userData.isAnnotation);

    // Render existing annotations
    annotations.forEach((annotation, idx) => {
      const isSelected = selectedAnnotation === idx;
      const isHovered = hoveredAnnotation === idx;

      // Create marker
      const geometry = new THREE.SphereGeometry(
        ANNOTATION_CONFIG.marker.radius,
        ANNOTATION_CONFIG.marker.segments,
        ANNOTATION_CONFIG.marker.segments
      );
      
      const material = new THREE.MeshBasicMaterial({
        color: isSelected ? ANNOTATION_CONFIG.marker.colors.selected :
               isHovered ? ANNOTATION_CONFIG.marker.colors.hovered :
               ANNOTATION_CONFIG.marker.colors.default,
        transparent: true,
        opacity: 1.0,
        depthTest: true,
        depthWrite: true
      });

      const marker = new THREE.Mesh(geometry, material);
      marker.position.copy(annotation.worldPosition);
      marker.userData.isAnnotation = true;
      marker.userData.annotationIndex = idx;
      marker.renderOrder = 999;
      scene.add(marker);

      // Add highlight effects for selected/hovered annotations
      if (isSelected || isHovered) {
        // Glow effect
        const glowGeometry = new THREE.SphereGeometry(
          ANNOTATION_CONFIG.glow.radius,
          ANNOTATION_CONFIG.marker.segments,
          ANNOTATION_CONFIG.marker.segments
        );
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: isSelected ? ANNOTATION_CONFIG.marker.colors.selected :
                 ANNOTATION_CONFIG.marker.colors.hovered,
          transparent: true,
          opacity: ANNOTATION_CONFIG.glow.opacity,
          depthTest: true,
          depthWrite: false
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(annotation.worldPosition);
        glow.userData.isAnnotation = true;
        scene.add(glow);

        // Ring effect
        const ringGeometry = new THREE.RingGeometry(
          ANNOTATION_CONFIG.ring.innerRadius,
          ANNOTATION_CONFIG.ring.outerRadius,
          ANNOTATION_CONFIG.ring.segments
        );
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: isSelected ? ANNOTATION_CONFIG.marker.colors.selected :
                 ANNOTATION_CONFIG.marker.colors.hovered,
          transparent: true,
          opacity: ANNOTATION_CONFIG.ring.opacity,
          side: THREE.DoubleSide,
          depthTest: true,
          depthWrite: false
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(annotation.worldPosition);
        ring.lookAt(camera.position);
        ring.userData.isAnnotation = true;
        ring.renderOrder = 1000;
        scene.add(ring);

        // Check visibility for label
        let isVisible = true;
        if (currentObject && camera) {
          const raycaster = new THREE.Raycaster();
          const direction = annotation.worldPosition.clone().sub(camera.position).normalize();
          raycaster.set(camera.position, direction);
          
          const intersects = raycaster.intersectObject(currentObject, true);
          if (intersects.length > 0) {
            const distanceToAnnotation = camera.position.distanceTo(annotation.worldPosition);
            const distanceToIntersection = intersects[0].distance;
            
            if (distanceToIntersection < distanceToAnnotation - 0.01) {
              isVisible = false;
            }
          }
        }

        // Add label if visible
        if (isVisible) {
          const labelDiv = document.createElement('div');
          labelDiv.className = styles.annotationLabel;
          labelDiv.innerHTML = `
            <div class="${styles.labelContent}">
              <div class="${styles.labelName}">${annotation.name}</div>
              <div class="${styles.labelDate}">
                ${annotation.createdAt ? new Date(annotation.createdAt).toLocaleDateString() : ''}
              </div>
            </div>
          `;
          
          const labelObj = new CSS2DObject(labelDiv);
          labelObj.position.copy(
            annotation.worldPosition.clone().add(
              new THREE.Vector3(
                ANNOTATION_CONFIG.label.offset.x,
                ANNOTATION_CONFIG.label.offset.y,
                ANNOTATION_CONFIG.label.offset.z
              )
            )
          );
          marker.add(labelObj);
        }
      }
    });

    // Render pending annotation
    if (pendingAnnotation && isAnnotationMode) {
      // Pending marker
      const geometry = new THREE.SphereGeometry(
        ANNOTATION_CONFIG.pending.markerRadius,
        16,
        16
      );
      const material = new THREE.MeshBasicMaterial({
        color: ANNOTATION_CONFIG.marker.colors.pending,
        transparent: true,
        opacity: ANNOTATION_CONFIG.pending.opacity,
        depthTest: true,
        depthWrite: true
      });
      const marker = new THREE.Mesh(geometry, material);
      marker.position.copy(pendingAnnotation.position);
      marker.userData.isAnnotation = true;
      marker.renderOrder = 0;
      scene.add(marker);

      // Create input UI
      const inputContainer = createAnnotationInput(
        pendingAnnotation,
        showAISuggestions,
        onAnnotationSave,
        onAnnotationCancel,
        onInputChange
      );

      const labelObj = new CSS2DObject(inputContainer);
      labelObj.position.copy(
        pendingAnnotation.position.clone().add(
          new THREE.Vector3(
            ANNOTATION_CONFIG.pending.labelOffset.x,
            ANNOTATION_CONFIG.pending.labelOffset.y,
            ANNOTATION_CONFIG.pending.labelOffset.z
          )
        )
      );
      marker.add(labelObj);

      // Focus input
      requestAnimationFrame(() => {
        const input = inputContainer.querySelector('input');
        if (input) {
          (input as HTMLInputElement).focus();
          (input as HTMLInputElement).select();
        }
      });
    }
  }, [
    sceneRefs,
    annotations,
    selectedAnnotation,
    hoveredAnnotation,
    pendingAnnotation,
    showAISuggestions,
    isAnnotationMode,
    onAnnotationSave,
    onAnnotationCancel,
    onInputChange
  ]);

  return null; // This component doesn't render anything to the DOM directly
};

function createAnnotationInput(
  pendingAnnotation: PendingAnnotation,
  showAISuggestions: boolean,
  onSave: (name: string) => void,
  onCancel: () => void,
  onInputChange: (value: string) => void
): HTMLDivElement {
  const container = document.createElement('div');
  container.className = styles.annotationInput;

  // AI Suggestion Banner
  if (pendingAnnotation.aiSuggestion && showAISuggestions) {
    const suggestionBanner = document.createElement('div');
    suggestionBanner.className = styles.aiSuggestionBanner;
    suggestionBanner.innerHTML = `
      <span>🤖</span>
      <span>AI: ${pendingAnnotation.aiSuggestion.metadata.type} (${pendingAnnotation.aiSuggestion.metadata.confidence})</span>
    `;
    container.appendChild(suggestionBanner);
  }

  // Input field
  const input = document.createElement('input');
  input.type = 'text';
  input.value = pendingAnnotation.inputValue || '';
  input.placeholder = 'Enter annotation...';
  input.className = styles.input;

  // Event handlers
  input.onclick = (e) => e.stopPropagation();
  input.oninput = (e) => {
    e.stopPropagation();
    onInputChange((e.target as HTMLInputElement).value);
  };
  input.onkeydown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      onSave(input.value.trim());
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  container.appendChild(input);

  // Alternative suggestions
  if (pendingAnnotation.aiSuggestion && pendingAnnotation.aiSuggestion.alternatives.length > 0) {
    const alternativesDiv = document.createElement('div');
    alternativesDiv.className = styles.alternatives;

    pendingAnnotation.aiSuggestion.alternatives.forEach(alt => {
      const altBtn = document.createElement('button');
      altBtn.innerText = alt;
      altBtn.className = styles.alternativeButton;
      altBtn.onclick = () => {
        input.value = alt;
        input.focus();
      };
      alternativesDiv.appendChild(altBtn);
    });

    container.appendChild(alternativesDiv);
  }

  // Button group
  const buttonGroup = document.createElement('div');
  buttonGroup.className = styles.buttonGroup;

  const saveBtn = document.createElement('button');
  saveBtn.innerText = 'Save';
  saveBtn.className = styles.saveButton;
  saveBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSave(input.value.trim());
  }, true);

  const cancelBtn = document.createElement('button');
  cancelBtn.innerText = 'Cancel';
  cancelBtn.className = styles.cancelButton;
  cancelBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    onCancel();
  }, true);

  buttonGroup.appendChild(saveBtn);
  buttonGroup.appendChild(cancelBtn);
  container.appendChild(buttonGroup);

  // Prevent container clicks from propagating
  container.onclick = (e) => e.stopPropagation();

  return container;
}
