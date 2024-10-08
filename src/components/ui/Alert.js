// src/components/ui/Alert.js
import React from 'react';
import styles from './Alert.module.css'; // Ensure this file exists

export const Alert = ({ variant, children }) => {
  return (
    <div className={`${styles.alert} ${styles[variant]}`}>
      {children}
    </div>
  );
};

export const AlertDescription = ({ children }) => {
  return <div>{children}</div>;
};
