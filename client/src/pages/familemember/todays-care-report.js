import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { elderApi } from '../../services/elderApi';
import Navbar from '../../components/navbar';
import styles from '../../components/css/familymember/todays-care-report.module.css';
import FamilyMemberLayout from '../../components/FamilyMemberLayout';

const TodaysCareReport = () => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [elders, setElders] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Fetch elders data
  useEffect(() => {
    const fetchElders = async () => {
      if (!currentUser?.user_id) {
        console.log('No user_id found in currentUser:', currentUser);
        return;
      }
      
      try {
        setDataLoading(true);
        setError(null);
        
        console.log('Fetching elders for family member ID:', currentUser.user_id);
        
        const response = await elderApi.getEldersByFamilyMember(currentUser.user_id);
        
        console.log('Elders API response:', response);
        
        if (response.success) {
          setElders(response.elders);
        } else {
          setError('Failed to load elders data');
        }
        
      } catch (err) {
        console.error('Error fetching elders:', err);
        setError('Failed to load elders data');
      } finally {
        setDataLoading(false);
      }
    };

    if (currentUser && currentUser.role === 'family_member') {
      fetchElders();
    }
  }, [currentUser]);

  // Filter elders based on search term
  const filteredElders = elders.filter(elder =>
    elder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    elder.contact.includes(searchTerm) ||
    (elder.email && elder.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get current date
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <h2>Loading...</h2>
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
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Today's Care Report</h1>
            <p className={styles.subtitle}>
              {getCurrentDate()} - Care overview for all registered elders
            </p>
            <div className={styles.reportInfo}>
              <span className={styles.reportBadge}>📋 Daily Report</span>
              <span className={styles.reportDate}>Generated at {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className={styles.summarySection}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>{elders.length}</h3>
                <p className={styles.statLabel}>Total Elders</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>✅</div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>{elders.length}</h3>
                <p className={styles.statLabel}>Active Today</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🏥</div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>{elders.filter(elder => elder.medical_conditions).length}</h3>
                <p className={styles.statLabel}>With Medical Conditions</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📞</div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>{elders.length}</h3>
                <p className={styles.statLabel}>Contactable</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className={styles.searchSection}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search elders by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <div className={styles.searchIcon}>🔍</div>
          </div>
          <div className={styles.elderCount}>
            {dataLoading ? 'Loading...' : `${filteredElders.length} elder${filteredElders.length !== 1 ? 's' : ''} in report`}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            <p>⚠️ {error}</p>
            <button 
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}

        {/* Content Section */}
        {dataLoading ? (
          <div className={styles.loadingContent}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading today's care report...</p>
          </div>
        ) : filteredElders.length === 0 ? (
          <div className={styles.emptyState}>
            {searchTerm ? (
              <>
                <div className={styles.emptyIcon}>🔍</div>
                <h2>No elders found</h2>
                <p>No elders match your search criteria "{searchTerm}"</p>
                <button 
                  className={styles.clearSearchButton}
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <div className={styles.emptyIcon}>📋</div>
                <h2>No Care Data Available</h2>
                <p>You haven't registered any elders yet. Register elders to see their care reports.</p>
                <button 
                  className={styles.registerButton}
                  onClick={() => navigate('/family-member/elder-signup')}
                >
                  Register Your First Elder
                </button>
              </>
            )}
          </div>
        ) : (
          <div className={styles.eldersList}>
            <div className={styles.listHeader}>
              <h2 className={styles.listTitle}>
                📋 Assigned Elders Care Overview ({filteredElders.length})
              </h2>
            </div>
            
            {filteredElders.map((elder, index) => (
              <div key={elder.elder_id} className={styles.elderReportCard}>
                {/* Elder Header */}
                <div className={styles.elderReportHeader}>
                  <div className={styles.elderNumber}>
                    #{index + 1}
                  </div>
                  <div className={styles.elderAvatar}>
                    {elder.profile_photo ? (
                      <img 
                        src={`http://localhost:5000/${elder.profile_photo}`} 
                        alt={elder.name}
                        className={styles.elderPhoto}
                      />
                    ) : (
                      <div className={styles.elderInitial}>
                        {elder.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className={styles.elderBasicInfo}>
                    <h3 className={styles.elderName}>{elder.name}</h3>
                    <div className={styles.elderMeta}>
                      <span className={styles.elderAge}>
                        {elder.gender} • {new Date().getFullYear() - new Date(elder.dob).getFullYear()} years old
                      </span>
                      <span className={styles.elderStatus}>
                        <div className={styles.statusDot}></div>
                        Active
                      </span>
                    </div>
                  </div>
                  <div className={styles.elderActions}>
                    <button 
                      className={styles.viewButton}
                      onClick={() => navigate(`/family-member/elder/${elder.elder_id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>

                {/* Elder Care Details */}
                <div className={styles.elderCareDetails}>
                  <div className={styles.careGrid}>
                    {/* Contact Information */}
                    <div className={styles.careSection}>
                      <h4 className={styles.careSectionTitle}>
                        <span className={styles.careSectionIcon}>📞</span>
                        Contact Information
                      </h4>
                      <div className={styles.careDetails}>
                        <div className={styles.careItem}>
                          <span className={styles.careLabel}>Phone:</span>
                          <span className={styles.careValue}>{elder.contact}</span>
                        </div>
                        {elder.email && (
                          <div className={styles.careItem}>
                            <span className={styles.careLabel}>Email:</span>
                            <span className={styles.careValue}>{elder.email}</span>
                          </div>
                        )}
                        <div className={styles.careItem}>
                          <span className={styles.careLabel}>NIC:</span>
                          <span className={styles.careValue}>{elder.nic}</span>
                        </div>
                      </div>
                    </div>

                    {/* Location Information */}
                    <div className={styles.careSection}>
                      <h4 className={styles.careSectionTitle}>
                        <span className={styles.careSectionIcon}>📍</span>
                        Location & Address
                      </h4>
                      <div className={styles.careDetails}>
                        <div className={styles.careItem}>
                          <span className={styles.careLabel}>District:</span>
                          <span className={styles.careValue}>
                            {elder.district || 'Not specified'}
                          </span>
                        </div>
                        <div className={styles.careItem}>
                          <span className={styles.careLabel}>Address:</span>
                          <span className={styles.careValue}>
                            {elder.address || 'Not provided'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Medical Information */}
                    <div className={styles.careSection}>
                      <h4 className={styles.careSectionTitle}>
                        <span className={styles.careSectionIcon}>🏥</span>
                        Medical Information
                      </h4>
                      <div className={styles.careDetails}>
                        <div className={styles.careItem}>
                          <span className={styles.careLabel}>Date of Birth:</span>
                          <span className={styles.careValue}>
                            {new Date(elder.dob).toLocaleDateString()}
                          </span>
                        </div>
                        {elder.medical_conditions ? (
                          <div className={styles.careItem}>
                            <span className={styles.careLabel}>Medical Conditions:</span>
                            <span className={styles.careValue}>
                              {elder.medical_conditions}
                            </span>
                          </div>
                        ) : (
                          <div className={styles.careItem}>
                            <span className={styles.careLabel}>Medical Conditions:</span>
                            <span className={styles.careValue}>None reported</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Care Status */}
                    <div className={styles.careSection}>
                      <h4 className={styles.careSectionTitle}>
                        <span className={styles.careSectionIcon}>💚</span>
                        Care Status
                      </h4>
                      <div className={styles.careDetails}>
                        <div className={styles.careItem}>
                          <span className={styles.careLabel}>Registration Date:</span>
                          <span className={styles.careValue}>
                            {elder.created_at ? new Date(elder.created_at).toLocaleDateString() : 'Not available'}
                          </span>
                        </div>
                        <div className={styles.careItem}>
                          <span className={styles.careLabel}>Care Level:</span>
                          <span className={styles.careValue}>
                            {elder.medical_conditions ? 'Special Care Required' : 'Regular Care'}
                          </span>
                        </div>
                        <div className={styles.careItem}>
                          <span className={styles.careLabel}>Last Updated:</span>
                          <span className={styles.careValue}>
                            {elder.updated_at ? new Date(elder.updated_at).toLocaleDateString() : 'Not available'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className={styles.quickActions}>
                    <button 
                      className={styles.actionButton}
                      onClick={() => navigate(`/family-member/elder/${elder.elder_id}/care-schedule`)}
                    >
                      <span className={styles.actionIcon}>📊</span>
                      See Report
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Report Footer */}
        <div className={styles.reportFooter}>
          <div className={styles.footerContent}>
            <p className={styles.footerText}>
              Report generated on {getCurrentDate()} at {new Date().toLocaleTimeString()}
            </p>
            <p className={styles.footerNote}>
              This report shows all elders currently assigned to your care. 
              For more detailed information, click on "View Details" for each elder.
            </p>
          </div>
        </div>
      </div>
      </FamilyMemberLayout>
    </div>
  );
};

export default TodaysCareReport;