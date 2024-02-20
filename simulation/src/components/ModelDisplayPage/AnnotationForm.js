import React, { useState } from 'react';
import PropTypes from 'prop-types'; 

class Annotation {
    /**
     * Constructor for creating a new object.
     *
     * @param {type} position - description of position parameter
     * @param {type} name - description of name parameter
     * @return {undefined} 
     */
    constructor(position, name){
        this.position = position;
        this.name = name;
    }
}

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