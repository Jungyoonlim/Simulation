import React, { useState } from 'react';

const AnnotationInputForm = ({ onSave, onCancel }) => {
  const [annotationName, setAnnotationName] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(annotationName);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={annotationName}
        onChange={(e) => setAnnotationName(e.target.value)}
        placeholder="Enter annotation name"
      />
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};

export default AnnotationInputForm;