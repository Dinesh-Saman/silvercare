import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { caregiverApi } from '../../services/caregiverApi';
import Navbar from '../../components/navbar';
import FamilyMemberLayout from '../../components/FamilyMemberLayout';
import styles from '../../components/css/familymember/caregiver-bookings.module.css';

const CaregiverBookings = () => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    search: ''
  });

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

  // Fetch caregiver bookings
  useEffect(() => {
    const fetchBookingsData = async () => {
      if (!currentUser?.user_id) return;
      
      try {
        setDataLoading(true);
        setError(null);
        
        console.log('Fetching caregiver bookings for family member:', currentUser.user_id);
        
        const response = await caregiverApi.getCaregiverBookingsByFamily(currentUser.user_id);
        
        if (response.success) {
          console.log('Caregiver bookings received:', response.bookings);
          // Sort by latest first (request_date descending)
          const sortedBookings = (response.bookings || []).sort((a, b) => {
            return new Date(b.request_date) - new Date(a.request_date);
          });
          setBookings(sortedBookings);
        } else {
          throw new Error(response.error || 'Failed to fetch caregiver bookings');
        }
        
      } catch (err) {
        console.error('Error fetching caregiver bookings:', err);
        setError('Failed to load caregiver bookings data');
      } finally {
        setDataLoading(false);
      }
    };

    if (currentUser && currentUser.role === 'family_member') {
      fetchBookingsData();
    }
  }, [currentUser]);

  // Filter bookings by search term and type
  useEffect(() => {
    let filtered = bookings;

    // Filter by type
    if (filters.type !== 'all') {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      filtered = filtered.filter(booking => {
        const startDate = new Date(booking.start_date);
        const endDate = new Date(booking.end_date);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        if (filters.type === 'upcoming') {
          return startDate > currentDate && booking.status === 'confirmed';
        } else if (filters.type === 'ongoing') {
          return startDate <= currentDate && endDate >= currentDate && booking.status === 'confirmed';
        } else if (filters.type === 'completed') {
          return endDate < currentDate && booking.status === 'confirmed';
        } else if (filters.type === 'cancelled') {
          return booking.status === 'cancelled';
        }
        return true;
      });
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.caregiver_name?.toLowerCase().includes(searchLower) ||
        booking.elder_name?.toLowerCase().includes(searchLower) ||
        booking.request_id?.toString().includes(searchLower)
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, filters]);

  // Handle cancel booking with refund
  const handleCancelBooking = async (booking, event) => {
    event.stopPropagation();
    
    // Check if cancellation is allowed (within 2 hours of creation)
    const createdAt = new Date(booking.created_at);
    const currentDate = new Date();
    const hoursSinceCreated = (currentDate - createdAt) / (1000 * 60 * 60);
    
    if (hoursSinceCreated > 2) {
      window.alert(`Cancellation not allowed. This booking was created ${hoursSinceCreated.toFixed(1)} hours ago. Caregiver bookings can only be cancelled within 2 hours of booking.`);
      return;
    }
    
    const remainingHours = 2 - hoursSinceCreated;
    
    // Show detailed cancellation confirmation
    const confirmMessage = `Are you sure you want to cancel this caregiver booking?

📋 Booking Details:
• Caregiver: ${booking.caregiver_name}
• Elder: ${booking.elder_name}
• Start Date: ${new Date(booking.start_date).toLocaleDateString()}
• End Date: ${new Date(booking.end_date).toLocaleDateString()}
• Duration: ${booking.duration} days
• Booked: ${createdAt.toLocaleDateString()} at ${createdAt.toLocaleTimeString()}

⏰ Cancellation Policy:
• Hours since booking: ${hoursSinceCreated.toFixed(1)} hours
• Remaining time to cancel: ${remainingHours.toFixed(1)} hours
• Must cancel within 2 hours of booking

💰 Refund Information:
${booking.total_amount ? `• Amount: Rs. ${booking.total_amount}
• Refund will be processed to your original payment method
• Refund typically takes 5-10 business days` : '• No payment found for this booking'}

⚠️ This action cannot be undone.`;

    if (!window.confirm(confirmMessage)) return;
    
    const reason = window.prompt('Please provide a reason for cancellation (optional):');
    if (reason === null) return; // User cancelled the prompt
    
    try {
      setCancellingId(booking.request_id);
      
      const response = await caregiverApi.cancelCaregiverBooking(booking.request_id, reason);
      
      if (response.success) {
        // Update the booking status in the list
        setBookings(prev => 
          prev.map(b => 
            b.request_id === booking.request_id 
              ? { ...b, status: 'cancelled' }
              : b
          )
        );
        
        // Show success message with refund info
        let successMessage = 'Caregiver booking cancelled successfully!';
        
        if (response.refund) {
          if (response.refund.error) {
            successMessage += `\n\n⚠️ Refund Issue: ${response.refund.error}`;
          } else {
            successMessage += `\n\n💰 Refund Processed:
• Amount: Rs. ${response.refund.amount}
• Refund ID: ${response.refund.refund_id}
• Expected in: ${response.cancellationInfo?.estimatedRefundDays || '5-10 business days'}
• You will receive an email confirmation shortly`;
          }
        }
        
        window.alert(successMessage);
      }
    } catch (err) {
      console.error('Error cancelling caregiver booking:', err);
      
      let errorMessage = 'Failed to cancel caregiver booking.';
      
      if (err.message.includes('not allowed')) {
        errorMessage = err.message;
      } else if (err.message.includes('hours')) {
        errorMessage = err.message;
      } else {
        errorMessage += ' Please try again or contact support.';
      }
      
      window.alert(errorMessage);
    } finally {
      setCancellingId(null);
    }
  };

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return {
      start: start.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      end: end.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    };
  };

  const canCancelBooking = (booking) => {
    if (booking.status !== 'confirmed') return false;
    
    const createdAt = new Date(booking.created_at);
    const currentDate = new Date();
    const hoursSinceCreated = (currentDate - createdAt) / (1000 * 60 * 60);
    
    return hoursSinceCreated <= 2;
  };

  const getBookingStatus = (booking) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const startDate = new Date(booking.start_date);
    const endDate = new Date(booking.end_date);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (booking.status === 'cancelled') return 'Cancelled';
    if (startDate > currentDate) return 'Upcoming';
    if (startDate <= currentDate && endDate >= currentDate) return 'Ongoing';
    if (endDate < currentDate) return 'Completed';
    return booking.status;
  };

  if (loading || dataLoading) {
    return (
      <div className={styles.container}>
        <Navbar />
        <FamilyMemberLayout>
          <div className={styles.content}>
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <h2>Loading caregiver bookings...</h2>
            </div>
          </div>
        </FamilyMemberLayout>
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
              <h1 className={styles.title}>🧑‍💼 Caregiver Bookings</h1>
              <p className={styles.subtitle}>
                Manage your caregiver bookings and cancellations
              </p>
            </div>
            <button 
              className={styles.newBookingButton}
              onClick={() => navigate('/family-member/elder-caregivers')}
            >
              + New Booking
            </button>
          </div>

          {/* Filters */}
          <div className={styles.filtersSection}>
            <div className={styles.filterTabs}>
              <button 
                className={`${styles.filterTab} ${filters.type === 'all' ? styles.active : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, type: 'all' }))}
              >
                📋 All Bookings
              </button>
              <button 
                className={`${styles.filterTab} ${filters.type === 'upcoming' ? styles.active : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, type: 'upcoming' }))}
              >
                ⏰ Upcoming
              </button>
              <button 
                className={`${styles.filterTab} ${filters.type === 'ongoing' ? styles.active : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, type: 'ongoing' }))}
              >
                ▶️ Ongoing
              </button>
              <button 
                className={`${styles.filterTab} ${filters.type === 'completed' ? styles.active : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, type: 'completed' }))}
              >
                ✅ Completed
              </button>
              <button 
                className={`${styles.filterTab} ${filters.type === 'cancelled' ? styles.active : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, type: 'cancelled' }))}
              >
                ❌ Cancelled
              </button>
            </div>

            <div className={styles.searchContainer}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="🔍 Search by caregiver, elder, or booking ID..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>

          {/* Info Message */}
          <div className={styles.infoMessage}>
            <span className={styles.infoIcon}>ℹ️</span>
            <span>
              Caregiver bookings can be cancelled within 2 hours of booking with full refund
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>⚠️</span>
              {error}
            </div>
          )}

          {/* Bookings List */}
          <div className={styles.bookingsSection}>
            {filteredBookings.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📭</div>
                <h3>No caregiver bookings found</h3>
                <p>
                  {filters.search 
                    ? 'Try adjusting your search criteria'
                    : filters.type === 'all'
                    ? 'You haven\'t made any caregiver bookings yet'
                    : `No ${filters.type} bookings found`
                  }
                </p>
                <button 
                  className={styles.emptyActionButton}
                  onClick={() => navigate('/family-member/elder-caregivers')}
                >
                  Book a Caregiver
                </button>
              </div>
            ) : (
              <div className={styles.bookingsList}>
                {filteredBookings.map((booking) => {
                  const dateRange = formatDateRange(booking.start_date, booking.end_date);
                  const canCancel = canCancelBooking(booking);
                  const bookingStatus = getBookingStatus(booking);
                  const createdAt = new Date(booking.created_at);
                  const hoursSinceCreated = (new Date() - createdAt) / (1000 * 60 * 60);

                  return (
                    <div key={booking.request_id} className={styles.bookingCard}>
                      <div className={styles.bookingHeader}>
                        <div className={styles.bookingInfo}>
                          <h3 className={styles.bookingTitle}>
                            🧑‍💼 {booking.caregiver_name}
                          </h3>
                          <p className={styles.elderInfo}>
                            👴 Elder: {booking.elder_name}
                          </p>
                        </div>
                        <div className={styles.bookingStatusBadge}>
                          <span className={`${styles.statusBadge} ${styles[bookingStatus.toLowerCase().replace(' ', '-')]}`}>
                            {bookingStatus}
                          </span>
                        </div>
                      </div>

                      <div className={styles.bookingDetails}>
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>📅 Start Date:</span>
                          <span className={styles.detailValue}>{dateRange.start}</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>📅 End Date:</span>
                          <span className={styles.detailValue}>{dateRange.end}</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>⏱️ Duration:</span>
                          <span className={styles.detailValue}>{booking.duration} days</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>💰 Amount:</span>
                          <span className={styles.detailValue}>Rs. {booking.total_amount?.toLocaleString()}</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>🆔 Booking ID:</span>
                          <span className={styles.detailValue}>#{booking.request_id}</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>📅 Booked On:</span>
                          <span className={styles.detailValue}>
                            {createdAt.toLocaleDateString()} at {createdAt.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>

                      {/* Cancellation Info for Upcoming Bookings */}
                      {booking.status === 'confirmed' && bookingStatus === 'Upcoming' && (
                        <div className={styles.cancellationInfo}>
                          {canCancel ? (
                            <div className={styles.canCancelInfo}>
                              <span className={styles.checkIcon}>✓</span>
                              <span>
                                Can be cancelled • {(2 - hoursSinceCreated).toFixed(1)} hours remaining
                                {' • Full refund available'}
                              </span>
                            </div>
                          ) : (
                            <div className={styles.cannotCancelInfo}>
                              <span className={styles.xIcon}>✗</span>
                              <span>Cancellation window expired ({hoursSinceCreated.toFixed(1)} hours ago)</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className={styles.bookingActions}>
                        {canCancel && (
                          <button
                            className={styles.cancelButton}
                            onClick={(e) => handleCancelBooking(booking, e)}
                            disabled={cancellingId === booking.request_id}
                          >
                            {cancellingId === booking.request_id ? (
                              <>
                                <span className={styles.buttonSpinner}></span>
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <span className={styles.cancelIcon}>🚫</span>
                                Cancel & Refund
                                {booking.total_amount && (
                                  <span className={styles.refundAmount}>
                                    (Rs. {booking.total_amount.toLocaleString()})
                                  </span>
                                )}
                              </>
                            )}
                          </button>
                        )}
                        <button
                          className={styles.viewDetailsButton}
                          onClick={() => navigate(`/family-member/caregiver-booking/${booking.request_id}`)}
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </FamilyMemberLayout>
    </div>
  );
};

export default CaregiverBookings;
