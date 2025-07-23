import React, { useEffect } from 'react';
import styles from './css/SuccessNotification.module.css';

const SuccessNotification = ({ show, message, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div className={styles.notificationOverlay}>
      <div className={styles.notification}>
        <div className={styles.iconContainer}>
          <div className={styles.checkmark}>
            <svg 
              className={styles.checkmarkSvg} 
              viewBox="0 0 52 52"
            >
              <circle 
                className={styles.checkmarkCircle} 
                cx="26" 
                cy="26" 
                r="25" 
                fill="none"
              />
              <path 
                className={styles.checkmarkCheck} 
                fill="none" 
                d="m14.1 27.2l7.1 7.2 16.7-16.8"
              />
            </svg>
          </div>
        </div>
        
        <div className={styles.content}>
          <h3 className={styles.title}>Success!</h3>
          <p className={styles.message}>{message}</p>
        </div>
        
        <button 
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default SuccessNotification;
