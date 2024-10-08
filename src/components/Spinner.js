// Spinner.js
import React from 'react';
import styles from './Spinner.module.css'; // Create a CSS module for spinner styles

const Spinner = () => {
  return (
    <div className={styles.spinner}>
      <div className={styles.loader}></div>
    </div>
  );
};

export default Spinner;
