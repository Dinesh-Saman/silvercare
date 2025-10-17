import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { caregiverApi } from '../../services/caregiverApi';
import Navbar from '../../components/navbar';
import FamilyMemberLayout from '../../components/FamilyMemberLayout';
import styles from '../../components/css/familymember/caregiver-booking-summary.module.css';

const CaregiverBookingSummary = () => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get parameters from URL query params
  const elderId = searchParams.get('elder');
  const caregiverId = searchParams.get('caregiver');
  const datesParam = searchParams.get('dates');
  const selectedDates = datesParam ? datesParam.split(',').sort() : [];
  
  const [caregiverInfo, setCaregiverInfo] = useState(null);
  const [elderInfo, setElderInfo] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    
    const [year, month, day] = dateString.split('-');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const dayOfWeek = dayNames[date.getDay()];
    
    return `${dayOfWeek}, ${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
  };

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

    // Validate required params
    if (!elderId || !caregiverId || !selectedDates || selectedDates.length === 0) {
      console.log('Missing required params, redirecting back');
      navigate('/family-member/elder-caregivers', { replace: true });
      return;
    }
  }, [currentUser, isAuthenticated, loading, navigate, elderId, caregiverId, selectedDates]);

  // Fetch booking info
  useEffect(() => {
    const fetchBookingInfo = async () => {
      if (!elderId || !caregiverId) return;
      
      try {
        setDataLoading(true);
        setError(null);
        
        const response = await caregiverApi.getCaregiverBookingInfo(elderId, caregiverId);
        
        if (response.success) {
          setCaregiverInfo({
            name: response.caregiver.name,
            district: response.caregiver.district,
            certifications: response.caregiver.certifications,
            email: response.caregiver.email,
            phone: response.caregiver.phone,
            fixed_line: response.caregiver.fixed_line,
            daily_rate: response.caregiver.daily_rate || 3000
          });
          
          setElderInfo({
            name: response.elder.name,
            age: response.elder.age,
            district: response.elder.district,
            gender: response.elder.gender,
            contact: response.elder.contact,
            medical_conditions: response.elder.medical_conditions
          });
        } else {
          throw new Error(response.error || 'Failed to fetch booking information');
        }
        
      } catch (err) {
        console.error('Error fetching booking info:', err);
        setError(err.message || 'Failed to load booking information');
      } finally {
        setDataLoading(false);
      }
    };

    fetchBookingInfo();
  }, [elderId, caregiverId]);

  // Calculate total cost
  const calculateTotalCost = () => {
    const dailyRate = caregiverInfo?.daily_rate || 3000;
    return selectedDates.length * dailyRate;
  };

  // Calculate date range
  const getDateRange = () => {
    if (selectedDates.length === 0) return '';
    if (selectedDates.length === 1) return formatDateForDisplay(selectedDates[0]);
    return `${formatDateForDisplay(selectedDates[0])} to ${formatDateForDisplay(selectedDates[selectedDates.length - 1])}`;
  };

  const handleProceedToPayment = async () => {
    if (!disclaimerAccepted) {
      setError('Please accept the disclaimer and terms & conditions to proceed');
      return;
    }

    // For now, just show alert as payment integration is not required
    alert('Payment integration will be implemented in the next phase. Booking flow complete!');
    
    // Navigate back to dashboard
    setTimeout(() => {
      navigate('/family-member/dashboard');
    }, 2000);
  };

  const handleGoBack = () => {
    const backUrl = `/family-member/elder/${elderId}/caregiver-booking/${caregiverId}`;
    navigate(backUrl);
  };

  // Show loading while checking authentication
  if (loading || dataLoading) {
    return (
      <div className={styles.container}>
        <Navbar />
        <FamilyMemberLayout>
          <div className={styles.content}>
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <h2>Loading booking information...</h2>
            </div>
          </div>
        </FamilyMemberLayout>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !currentUser || currentUser.role !== 'family_member') {
    return (
      <div className={styles.accessDenied}>
        <h2>Access Denied</h2>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <FamilyMemberLayout>
        <div className={styles.content}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <h1 className={styles.title}>
                📋 Caregiver Booking Summary
              </h1>
              <p className={styles.subtitle}>
                Review all booking details before proceeding to payment
              </p>
            </div>
            <button 
              className={styles.backButton}
              onClick={handleGoBack}
            >
              ← Back to Date Selection
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>⚠️</span>
              {error}
            </div>
          )}

          <div className={styles.summaryContainer}>
            {/* Booking Summary Card */}
            <div className={styles.summaryCard}>
              <div className={styles.cardHeader}>
                <h2>👨‍⚕️ Caregiver Service Details</h2>
                <span className={styles.serviceType}>
                  🏠 Home Care Service
                </span>
              </div>

              <div className={styles.cardBody}>
                {/* Caregiver Details */}
                <div className={styles.detailSection}>
                  <h3 className={styles.sectionTitle}>Caregiver Information</h3>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Name:</span>
                      <span className={styles.detailValue}>{caregiverInfo?.name}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>District:</span>
                      <span className={styles.detailValue}>{caregiverInfo?.district}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Phone:</span>
                      <span className={styles.detailValue}>{caregiverInfo?.phone}</span>
                    </div>
                    {caregiverInfo?.fixed_line && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Fixed Line:</span>
                        <span className={styles.detailValue}>{caregiverInfo.fixed_line}</span>
                      </div>
                    )}
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Email:</span>
                      <span className={styles.detailValue}>{caregiverInfo?.email}</span>
                    </div>
                    {caregiverInfo?.certifications && (
                      <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}>
                        <span className={styles.detailLabel}>Certifications:</span>
                        <span className={styles.detailValue}>{caregiverInfo.certifications}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Elder Details */}
                <div className={styles.detailSection}>
                  <h3 className={styles.sectionTitle}>Elder Information</h3>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Name:</span>
                      <span className={styles.detailValue}>{elderInfo?.name}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Age:</span>
                      <span className={styles.detailValue}>{elderInfo?.age} years</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Gender:</span>
                      <span className={styles.detailValue}>{elderInfo?.gender}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>District:</span>
                      <span className={styles.detailValue}>{elderInfo?.district}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Contact:</span>
                      <span className={styles.detailValue}>{elderInfo?.contact}</span>
                    </div>
                    {elderInfo?.medical_conditions && (
                      <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}>
                        <span className={styles.detailLabel}>Medical Conditions:</span>
                        <span className={styles.detailValue}>{elderInfo.medical_conditions}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Schedule */}
                <div className={styles.detailSection}>
                  <h3 className={styles.sectionTitle}>Service Schedule</h3>
                  <div className={styles.scheduleInfo}>
                    <p><strong>Total Days Selected:</strong> {selectedDates.length} {selectedDates.length === 1 ? 'day' : 'days'}</p>
                    <p><strong>Date Range:</strong> {getDateRange()}</p>
                  </div>
                  
                  <div className={styles.datesList}>
                    <h4>Selected Dates:</h4>
                    <div className={styles.datesGrid}>
                      {selectedDates.map((date, index) => (
                        <div key={date} className={styles.dateChip}>
                          <span className={styles.dateIndex}>{index + 1}</span>
                          <span className={styles.dateText}>{formatDateForDisplay(date)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className={styles.detailSection}>
                  <h3 className={styles.sectionTitle}>Cost Breakdown</h3>
                  <div className={styles.costBreakdown}>
                    <div className={styles.costRow}>
                      <span>Daily Rate:</span>
                      <span>Rs. {caregiverInfo?.daily_rate?.toLocaleString() || '3,000'}</span>
                    </div>
                    <div className={styles.costRow}>
                      <span>Number of Days:</span>
                      <span>{selectedDates.length}</span>
                    </div>
                    <div className={styles.costRow + ' ' + styles.totalRow}>
                      <span>Total Amount:</span>
                      <span className={styles.totalAmount}>Rs. {calculateTotalCost().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer Card */}
            <div className={styles.disclaimerCard}>
              <div className={styles.disclaimerHeader}>
                <h2>⚠️ Important Disclaimer & Terms</h2>
              </div>
              
              <div className={styles.disclaimerBody}>
                <div className={styles.disclaimerSection}>
                  <h3>Service Agreement:</h3>
                  <ul>
                    <li>Caregiver services are provided at the elder's home location</li>
                    <li>The caregiver will provide daily care assistance including health monitoring, medication management, and companionship</li>
                    <li>Service hours are typically 8 hours per day unless otherwise specified</li>
                  </ul>
                </div>

                <div className={styles.disclaimerSection}>
                  <h3>Cancellation Policy:</h3>
                  <ul>
                    <li>Cancellations must be made at least 48 hours in advance for a full refund</li>
                    <li>Cancellations within 24-48 hours will incur a 50% charge</li>
                    <li>Cancellations within 24 hours are non-refundable</li>
                  </ul>
                </div>

                <div className={styles.disclaimerSection}>
                  <h3>Safety & Liability:</h3>
                  <ul>
                    <li>All caregivers are verified and certified professionals</li>
                    <li>SilverCare is not responsible for any personal belongings or medical emergencies</li>
                    <li>In case of medical emergencies, please contact emergency services immediately</li>
                    <li>Any disputes should be reported within 24 hours of service</li>
                  </ul>
                </div>

                <div className={styles.disclaimerSection}>
                  <h3>Payment Terms:</h3>
                  <ul>
                    <li>Full payment is required before service commencement</li>
                    <li>Payment is non-refundable except as per the cancellation policy</li>
                    <li>Additional services or extended hours may incur extra charges</li>
                  </ul>
                </div>

                <div className={styles.disclaimerSection}>
                  <h3>Data Privacy:</h3>
                  <ul>
                    <li>Your personal information will be shared only with the assigned caregiver</li>
                    <li>Medical information will be kept confidential as per HIPAA guidelines</li>
                    <li>We do not sell or share your data with third parties</li>
                  </ul>
                </div>

                <div className={styles.acceptanceSection}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={disclaimerAccepted}
                      onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxText}>
                      I have read and accept the above disclaimer and terms & conditions
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Proceed Button */}
            <div className={styles.proceedSection}>
              <button
                className={styles.proceedButton}
                onClick={handleProceedToPayment}
                disabled={!disclaimerAccepted || processing}
              >
                {processing ? (
                  <>
                    <div className={styles.buttonSpinner}></div>
                    Processing...
                  </>
                ) : (
                  <>
                    💳 Proceed to Payment (Rs. {calculateTotalCost().toLocaleString()})
                  </>
                )}
              </button>
              
              <p className={styles.proceedNote}>
                {!disclaimerAccepted && '⚠️ Please accept the disclaimer to proceed'}
              </p>
            </div>
          </div>
        </div>
      </FamilyMemberLayout>
    </div>
  );
};

export default CaregiverBookingSummary;
