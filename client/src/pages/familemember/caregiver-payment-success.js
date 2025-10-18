import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/navbar';
import FamilyMemberLayout from '../../components/FamilyMemberLayout';
import styles from '../../components/css/familemember/payment-success.module.css';

const CaregiverPaymentSuccess = () => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const careRequestId = searchParams.get('careRequestId');
  const amount = searchParams.get('amount');
  const elderName = searchParams.get('elderName');
  const caregiverName = searchParams.get('caregiverName');
  const duration = searchParams.get('duration');

  // Protect the route
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !currentUser) {
      navigate('/login', { replace: true });
      return;
    }

    if (currentUser.role !== 'family_member') {
      navigate('/login', { replace: true });
      return;
    }
  }, [currentUser, isAuthenticated, loading, navigate]);

  const handleViewBookings = () => {
    navigate('/family-member/caregiver-bookings');
  };

  const handleBackToDashboard = () => {
    navigate('/family-member/dashboard');
  };

  const handleBookAnother = () => {
    navigate('/family-member/elder-caregivers');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <FamilyMemberLayout>
        <div className={styles.content}>
          {/* Success Animation */}
          <div className={styles.successAnimation}>
            <div className={styles.checkmarkCircle}>
              <div className={styles.checkmark}>✓</div>
            </div>
          </div>

          {/* Success Message */}
          <div className={styles.successMessage}>
            <h1 className={styles.title}>🎉 Payment Successful!</h1>
            <p className={styles.subtitle}>
              Your caregiver booking has been confirmed
            </p>
          </div>

          {/* Booking Details Card */}
          <div className={styles.detailsCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>📋 Booking Details</h2>
              <span className={styles.confirmedBadge}>✓ Confirmed</span>
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailIcon}>🆔</span>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Booking ID</span>
                  <span className={styles.detailValue}>#{careRequestId}</span>
                </div>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailIcon}>👴</span>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Elder Name</span>
                  <span className={styles.detailValue}>{elderName}</span>
                </div>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailIcon}>🧑‍💼</span>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Caregiver</span>
                  <span className={styles.detailValue}>{caregiverName}</span>
                </div>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailIcon}>📅</span>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Duration</span>
                  <span className={styles.detailValue}>{duration} days</span>
                </div>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailIcon}>💰</span>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Amount Paid</span>
                  <span className={styles.detailValue}>Rs. {parseFloat(amount).toLocaleString()}</span>
                </div>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailIcon}>✅</span>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Payment Status</span>
                  <span className={styles.detailValue + ' ' + styles.statusSuccess}>Completed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className={styles.nextStepsCard}>
            <h3 className={styles.nextStepsTitle}>📌 What's Next?</h3>
            <ul className={styles.nextStepsList}>
              <li className={styles.nextStepItem}>
                <span className={styles.stepIcon}>📧</span>
                <span>A confirmation email has been sent to your registered email address</span>
              </li>
              <li className={styles.nextStepItem}>
                <span className={styles.stepIcon}>🔔</span>
                <span>The caregiver will be notified about this booking</span>
              </li>
              <li className={styles.nextStepItem}>
                <span className={styles.stepIcon}>📱</span>
                <span>You can view and manage your bookings in the Caregivers section</span>
              </li>
              <li className={styles.nextStepItem}>
                <span className={styles.stepIcon}>👋</span>
                <span>The caregiver will contact you before the first scheduled date</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button 
              className={styles.primaryButton}
              onClick={handleBackToDashboard}
            >
              🏠 Back to Dashboard
            </button>
            
            <button 
              className={styles.secondaryButton}
              onClick={handleBookAnother}
            >
              ➕ Book Another Caregiver
            </button>
          </div>

          {/* Support Information */}
          <div className={styles.supportInfo}>
            <p className={styles.supportText}>
              Need help? Contact our support team at{' '}
              <a href="mailto:support@silvercare.com" className={styles.supportLink}>
                support@silvercare.com
              </a>
              {' '}or call{' '}
              <a href="tel:+94112345678" className={styles.supportLink}>
                +94 11 234 5678
              </a>
            </p>
          </div>
        </div>
      </FamilyMemberLayout>
    </div>
  );
};

export default CaregiverPaymentSuccess;
