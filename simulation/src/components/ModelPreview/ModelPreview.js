import React from 'react';
import PropTypes from 'prop-types';

function ModelPreview({ modelPath }) {
  return (
    <div style={{ width: '200px', height: '200px', background: '#f0f0f0' }}>
      Preview for: {modelPath}
    </div>
  );
}

ModelPreview.propTypes = {
  modelPath: PropTypes.string.isRequired
};

export default ModelPreview; 