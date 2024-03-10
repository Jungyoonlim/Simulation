import React, { useState } from 'react';
// Adding prop-types
import PropTypes from 'prop-types';

AnnotationForm.propTypes = {
    position: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
  };

const AnnotationForm = ({ position, onSave }) => {
    const [text, setText] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        onSave(new Annotation(position, text));
    };

    return (
        <form onSubmit={handleSubmit}>
            <input 
            type="submit" 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add Annotation"
            />
        <button type="submit">Save Annotation</button>
        </form>
    ); 
}; 

export default AnnotationForm; 