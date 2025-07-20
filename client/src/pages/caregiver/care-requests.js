import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar';
import CaregiverLayout from '../../components/CaregiverLayout';
import { caregiverApi } from '../../services/caregiverApi';
import { useAuth } from '../../context/AuthContext';
import styles from "../../components/css/caregiver/care-requests.module.css";

const CareRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [careRequests, setCareRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState(null);

useEffect(() => {
  if (!user || !user.caregiver_id) return;
  fetchCareRequests();
}, [user]);

  // Auto-update status from 'approved' to 'completed' if end_date has passed
  useEffect(() => {
    if (!careRequests || careRequests.length === 0) return;
    const today = new Date();
    today.setHours(0,0,0,0);
    careRequests.forEach(async (request) => {
      if (request.status === 'approved') {
        const endDate = new Date(request.end_date);
        endDate.setHours(0,0,0,0);
        if (endDate.getTime() < today.getTime()) {
          // Update status in backend
          try {
            await caregiverApi.updateCareRequestStatus(request.request_id, 'completed');
            // Refresh the data to show updated status
            fetchCareRequests();
          } catch (err) {
            console.error('Error updating status to completed:', err);
          }
        }
      }
    });
  }, [careRequests]);

  const fetchCareRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await caregiverApi.fetchCareRequests(user.caregiver_id);
      setCareRequests(response || []);
    } catch (error) {
      console.error('Error fetching care requests:', error);
      setError('Failed to fetch care requests');
      setCareRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const filterRequestsByStatus = (status) => {
    if (status === 'all') return careRequests;
    // Show completed if status was approved and end_date has passed
    return careRequests.map(request => {
      if (request.status === 'approved') {
        const endDate = new Date(request.end_date);
        const today = new Date();
        // Remove time part for date-only comparison
        endDate.setHours(0,0,0,0);
        today.setHours(0,0,0,0);
        if (endDate.getTime() < today.getTime()) {
          return { ...request, status: 'completed' };
        } else if (endDate.getTime() === today.getTime()) {
          return { ...request, status: 'approved' };
        }
      }
      return request;
    }).filter(request => request.status === status);
  };

  const getTabCount = (status) => {
    return filterRequestsByStatus(status).length;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate time left until start date
  const getTimeLeft = (startDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const diffMs = start - now;
    if (diffMs <= 0) return 'Started';
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    let result = '';
    if (diffDays > 0) result += `${diffDays} day${diffDays > 1 ? 's' : ''} `;
    if (diffHours > 0) result += `${diffHours} hour${diffHours > 1 ? 's' : ''} `;
    if (diffMinutes > 0 && diffDays === 0) result += `${diffMinutes} min${diffMinutes > 1 ? 's' : ''}`;
    return result.trim();
  };

  const handleViewDetails = (requestId) => {
    navigate(`/caregiver/care-request/${requestId}`);
  };

  const tabs = [
    { key: 'all', label: 'All Requests', count: getTabCount('all') },
    { key: 'pending', label: 'Pending', count: getTabCount('pending') },
    { key: 'approved', label: 'Approved', count: getTabCount('approved') },
    { key: 'cancelled', label: 'Rejected', count: getTabCount('cancelled') },
    { key: 'completed', label: 'Completed', count: getTabCount('completed') }
  ];

  const currentRequests = filterRequestsByStatus(activeTab);

  if (loading) {
    return (
      <>
        <Navbar />
        <CaregiverLayout>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading care requests...</p>
          </div>
        </CaregiverLayout>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <CaregiverLayout>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>Care Requests</h1>
            <p>Manage and view all your care requests</p>
          </div>

          {/* Tabs */}
          <div className={styles.tabContainer}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <span className={styles.tabLabel}>{tab.label}</span>
                <span className={styles.tabCount}>{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className={styles.content}>
            {error && (
              <div className={styles.error}>
                <p>{error}</p>
                <button onClick={fetchCareRequests} className={styles.retryButton}>
                  Try Again
                </button>
              </div>
            )}

            {!error && currentRequests.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📋</div>
                <h3>No {activeTab === 'all' ? '' : activeTab} requests found</h3>
                <p>
                  {activeTab === 'all' 
                    ? 'You have no care requests yet.' 
                    : `You have no ${activeTab} care requests.`}
                </p>
              </div>
            ) : (
              <div className={styles.requestsList}>
                {currentRequests.map((request, index) => (
                  <div key={request.request_id || index} className={styles.requestCard}>
                    <div className={styles.requestHeader}>
                      <div className={styles.requestInfo}>
                        <h3 className={styles.elderName}>{request.elder_name}</h3>
                      </div>
                      <div className={`${styles.statusBadge} ${styles[request.status]}`}>
                        {request.status}
                      </div>
                    </div>

                    <div className={styles.requestDetails}>
                      <div className={styles.detailRow}>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Elder Age:</span>
                          <span className={styles.value}>{request.elder_age} years</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Duration:</span>
                          <span className={styles.value}>{request.duration} days</span>
                        </div>
                      </div>
                      
                      <div className={styles.detailRow}>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Start Date:</span>
                          <span className={styles.value}>{formatDate(request.start_date)}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>End Date:</span>
                          <span className={styles.value}>{formatDate(request.end_date)}</span>
                        </div>
                      </div>

                      <div className={styles.detailRow}>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Location:</span>
                          <span className={styles.value}>{request.elder_address}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Request Date:</span>
                          <span className={styles.value}>{formatDateTime(request.request_date)}</span>
                        </div>
                      </div>
                      

                      <div className={styles.detailRow}>
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Family Contact:</span>
                          <span className={styles.value}>{request.family_member_name}</span>
                        </div>
                        
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Phone:</span>
                          <span className={styles.value}>{request.family_member_phone}</span>
                        </div>

                      </div>
                    </div>
{/* Show time left only in pending tab */}
                      {request.status === 'pending' && (
                        <div className={styles.timeLeftRow}>
                            <span className={styles.label}>Time Left:</span>
                            <span className={
                            (new Date(request.start_date) - new Date() < 7 * 24 * 60 * 60 * 1000 ? styles.redText : styles.greenText)
                            }>
                            {getTimeLeft(request.start_date)}
                            </span>
                        </div>
                        )}
                    <div className={styles.requestActions}>
                      
                      <button 
                        className={styles.viewButton}
                        onClick={() => handleViewDetails(request.request_id)}
                      >
                        View Details
                      </button>
                      
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CaregiverLayout>
    </>
  );
}
export default CareRequests;
