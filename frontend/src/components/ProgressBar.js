import React from 'react';

const ProgressBar = ({ percent }) => (
  <div className="progress-track">
    <div className="progress-fill" style={{ width: `${Math.min(percent, 100)}%` }} />
  </div>
);

export default ProgressBar;
