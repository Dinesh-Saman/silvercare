import React from 'react';
import styles from './css/ErrorModal.module.css';

const ErrorModal = ({ isOpen, onClose, title, message, icon = '⚠️' }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.iconContainer}>
            <span className={styles.errorIcon}>{icon}</span>
          </div>
          <h2 className={styles.modalTitle}>{title}</h2>
        </div>
        
        <div className={styles.modalContent}>
          <p className={styles.message}>{message}</p>
        </div>
        
        <div className={styles.modalActions}>
          <button 
            onClick={onClose}
            className={styles.okButton}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
