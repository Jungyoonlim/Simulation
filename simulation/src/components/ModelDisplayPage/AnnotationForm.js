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
  const [text] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(new Annotation(position, text));
  };

  return (
    <form onSubmit={handleSubmit}>

    </form>
  );
};

AnnotationForm.propTypes = {
  position: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default AnnotationForm;