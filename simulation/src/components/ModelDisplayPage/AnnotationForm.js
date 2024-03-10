import React, { useState } from 'react';
import PropTypes from 'prop-types';

// Define the Annotation class
class Annotation {
  constructor(position, text) {
    this.position = position;
    this.text = text;
  }
}

const AnnotationForm = ({ position, onSave }) => {
  const [text, setText] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(new Annotation(position, text));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add Annotation"
      />
      <button type="submit">Save Annotation</button>
    </form>
  );
};

AnnotationForm.propTypes = {
  position: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default AnnotationForm;