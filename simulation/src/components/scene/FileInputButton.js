import React from 'react';

const FileInputButton = ({ onChange, className }) => (
    <input 
        type="file"
        onChange={onChange}
        accept=".obj, .mtl"
        className={className || 'choose-file-button'}
    />
); 

export default FileInputButton; 