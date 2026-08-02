import React from 'react';

const Alert = ({ type = 'info', children }) => {
  if (!children) return null;
  return <div className={`alert alert-${type}`}>{children}</div>;
};

export default Alert;
