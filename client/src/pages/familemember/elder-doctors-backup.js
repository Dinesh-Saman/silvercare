import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { elderApi } from '../../services/elderApi';
import Navbar from '../../components/navbar';
import FamilyMemberLayout from '../../components/FamilyMemberLayout';
import styles from '../../components/css/familymember/elder-doctors.module.css';

const ElderDoctors = () => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { elderId } = useParams();
  const [doctors, setDoctors] = useState([]);
  const [elderInfo, setElderInfo] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [meetingType, setMeetingType] = useState(null); // 'physical' or 'online'
  const [showMeetingSelection, setShowMeetingSelection] = useState(true);

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

  // Fetch doctors data based on meeting type
  const fetchDoctors = async (selectedMeetingType) => {
    if (!elderId) {
      setError('Elder ID is required');
      setDataLoading(false);
      return;
    }
    
    try {
      setDataLoading(true);
      setError(null);
      
      console.log('Fetching providers for elder ID:', elderId, 'Meeting type:', selectedMeetingType);
      
      let response;
      if (selectedMeetingType === 'physical') {
        response = await elderApi.getDoctorsByElderDistrict(elderId);
      } else if (selectedMeetingType === 'online') {
        response = await elderApi.getAllDoctorsForOnlineMeeting(elderId);
      } else if (selectedMeetingType === 'healthcare') {
        // Fetch healthcare professionals
        response = await elderApi.getAllHealthProfessionalsForOnlineMeeting(elderId);
      }
      
      console.log('Providers API response:', response);
      
      if (response.success) {
        if (selectedMeetingType === 'healthcare') {
          setDoctors(response.healthProfessionals || []);
        } else {
          setDoctors(response.doctors || []);
        }
        setElderInfo(response.elderInfo);
        setMeetingType(selectedMeetingType);
        setShowMeetingSelection(false);
      } else {
        setError(response.error || 'Failed to load providers data');
      }
      
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError(err.message || 'Failed to load providers data');
    } finally {
      setDataLoading(false);
    }
  };

  // Handle meeting type selection
  const handleMeetingTypeSelection = (selectedType) => {
    fetchDoctors(selectedType);
  };

  // Handle back to meeting selection
  const handleBackToSelection = () => {
    setShowMeetingSelection(true);
    setMeetingType(null);
    setDoctors([]);
    setElderInfo(null);
    setError(null);
  };

  // Filter providers based on search term (works for both doctors and healthcare professionals)
  const filteredDoctors = doctors.filter(provider => {
    if (meetingType === 'healthcare') {
      // Filter healthcare professionals
      return (
        provider.counselor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.district?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      // Filter doctors
      return (
        provider.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.current_institution?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.district?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  });

  // UPDATED: Handle book appointment - navigate to specific appointment pages
  const handleBookAppointment = (providerId) => {
    if (meetingType === 'physical') {
      navigate(`/family-member/book-appointment/${elderId}/${providerId}/physical?meetingType=${meetingType}`);
    } else if (meetingType === 'online') {
      navigate(`/family-member/book-appointment/${elderId}/${providerId}/online?meetingType=${meetingType}`);
    } else if (meetingType === 'healthcare') {
      navigate(`/family-member/book-healthcare-appointment/${elderId}/${providerId}?meetingType=${meetingType}`);
    }
  };

  const handleViewProviderProfile = (providerId) => {
    if (meetingType === 'healthcare') {
      // Navigate to healthcare professional profile page (to be created)
      navigate(`/family-member/healthcare-professional/${providerId}`);
    } else {
      // Navigate to doctor profile page
      navigate(`/family-member/doctor/${providerId}`);
    }
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
          {/* Meeting Type Selection */}
          {showMeetingSelection && (
            <div className={styles.meetingSelection}>
              <div className={styles.selectionHeader}>
                <h1 className={styles.title}>Choose Meeting Type</h1>
                <p className={styles.subtitle}>
                  How would you like to meet with the doctor?
                </p>
              </div>
              
              <div className={styles.meetingOptions}>
                <div 
                  className={styles.meetingOption}
                  onClick={() => handleMeetingTypeSelection('physical')}
                >
                  <div className={styles.optionIcon}>🏥</div>
                  <h3 className={styles.optionTitle}>Physical Meeting</h3>
                  <p className={styles.optionDescription}>
                    Meet the doctor in person at their clinic or hospital. 
                    Shows doctors in your district only.
                  </p>
                  <div className={styles.optionFeatures}>
                    <span className={styles.feature}>✓ In-person consultation</span>
                    <span className={styles.feature}>✓ Physical examination</span>
                    <span className={styles.feature}>✓ Local doctors only</span>
                    <span className={styles.feature}>✓ 2 hours duration</span>
                  </div>
                  <button className={styles.selectButton}>
                    Select Physical Meeting
                  </button>
                </div>

                <div 
                  className={styles.meetingOption}
                  onClick={() => handleMeetingTypeSelection('online')}
                >
                  <div className={styles.optionIcon}>💻</div>
                  <h3 className={styles.optionTitle}>Online Doctor Meeting</h3>
                  <p className={styles.optionDescription}>
                    Video consultation with doctors from anywhere. 
                    Access to all available doctors.
                  </p>
                  <div className={styles.optionFeatures}>
                    <span className={styles.feature}>✓ Video consultation</span>
                    <span className={styles.feature}>✓ All doctors available</span>
                    <span className={styles.feature}>✓ Convenient from home</span>
                    <span className={styles.feature}>✓ 1 hour duration</span>
                  </div>
                  <button className={styles.selectButton}>
                    Select Online Doctor Meeting
                  </button>
                </div>

                <div 
                  className={styles.meetingOption}
                  onClick={() => handleMeetingTypeSelection('healthcare')}
                >
                  <div className={styles.optionIcon}>🧠</div>
                  <h3 className={styles.optionTitle}>Healthcare Professional</h3>
                  <p className={styles.optionDescription}>
                    Online consultation with healthcare professionals like counselors, 
                    therapists, and mental health specialists.
                  </p>
                  <div className={styles.optionFeatures}>
                    <span className={styles.feature}>✓ Mental health support</span>
                    <span className={styles.feature}>✓ Specialized counseling</span>
                    <span className={styles.feature}>✓ Global accessibility</span>
                    <span className={styles.feature}>✓ 1 hour duration</span>
                  </div>
                  <button className={styles.selectButton}>
                    Select Healthcare Professional
                  </button>
                </div>
              </div>

              <div className={styles.backSection}>
                <button 
                  className={styles.backButton}
                  onClick={() => navigate('/family-member/elders')}
                >
                  ← Back to Elders
                </button>
              </div>
            </div>
          )}

          {/* Doctors List (shown after meeting type selection) */}
          {!showMeetingSelection && (
            <>
              {/* Header Section */}
              <div className={styles.header}>
                <div className={styles.headerContent}>
                  <h1 className={styles.title}>
                    Available Doctors - {meetingType === 'physical' ? 'Physical Meeting' : 'Online Meeting'}
                  </h1>
                  {elderInfo && (
                    <div className={styles.elderInfo}>
                      <p className={styles.subtitle}>
                        Doctors available for <strong>{elderInfo.name}</strong>
                        {meetingType === 'physical' && elderInfo.district && (
                          <> in <strong>{elderInfo.district}</strong> district</>
                        )}
                        {meetingType === 'online' && (
                          <> - <strong>All Districts</strong> (Online Meeting)</>
                        )}
                      </p>
                    </div>
                  )}
                </div>
                <div className={styles.headerButtons}>
                  <button 
                    className={styles.changeTypeButton}
                    onClick={handleBackToSelection}
                  >
                    🔄 Change Meeting Type
                  </button>
                  <button 
                    className={styles.backButton}
                    onClick={() => navigate('/family-member/elders')}
                  >
                    ← Back to Elders
                  </button>
                </div>
              </div>

              {/* Search Section */}
              <div className={styles.searchSection}>
                <div className={styles.searchContainer}>
                  <input
                    type="text"
                    placeholder="Search doctors by name, specialization, or institution..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                  <div className={styles.searchIcon}>🔍</div>
                </div>
                               <div className={styles.doctorCount}>
                  {dataLoading ? 'Loading...' : `${filteredDoctors.length} doctor${filteredDoctors.length !== 1 ? 's' : ''} found`}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className={styles.errorMessage}>
                  <p>⚠️ {error}</p>
                  <button 
                    className={styles.retryButton}
                    onClick={() => fetchDoctors(meetingType)}
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Content Section */}
              {dataLoading ? (
                <div className={styles.loadingContent}>
                  <div className={styles.loadingSpinner}></div>
                  <p>Loading available doctors...</p>
                </div>
              ) : filteredDoctors.length === 0 ? (
                <div className={styles.emptyState}>
                  {searchTerm ? (
                    <>
                      <div className={styles.emptyIcon}>🔍</div>
                      <h2>No doctors found</h2>
                      <p>No doctors match your search criteria "{searchTerm}"</p>
                      <button 
                        className={styles.clearSearchButton}
                        onClick={() => setSearchTerm('')}
                      >
                        Clear Search
                      </button>
                    </>
                  ) : (
                    <>
                      <div className={styles.emptyIcon}>👨‍⚕️</div>
                      <h2>No Doctors Available</h2>
                      <p>
                        {meetingType === 'physical' && elderInfo 
                          ? `No approved doctors found in ${elderInfo.district} district.`
                          : 'No doctors available at the moment.'
                        }
                      </p>
                      <p>Please try again later or contact support.</p>
                    </>
                  )}
                </div>
              ) : (
                <div className={styles.doctorsGrid}>
                  {filteredDoctors.map((provider) => {
                    // Determine provider type and extract relevant data
                    const isHealthcareProfessional = meetingType === 'healthcare';
                    const providerId = isHealthcareProfessional ? provider.counselor_id : provider.doctor_id;
                    const providerName = isHealthcareProfessional ? provider.counselor_name : `Dr. ${provider.doctor_name}`;
                    const providerSpecialty = isHealthcareProfessional ? provider.specialty : provider.specialization;
                    const providerInstitution = isHealthcareProfessional ? 'Online Consultation' : provider.current_institution;
                    const providerDistrict = provider.district;
                    const providerExperience = provider.years_experience;
                    
                    return (
                      <div key={providerId} className={styles.doctorCard}>
                        {/* Meeting Type Badge */}
                        <div className={styles.meetingTypeBadge}>
                          {meetingType === 'physical' ? '🏥 Physical' : 
                           meetingType === 'online' ? '💻 Online Doctor' : 
                           '🧠 Healthcare Professional'}
                        </div>

                        {/* Provider Header */}
                        <div className={styles.doctorHeader}>
                          <div className={styles.doctorAvatar}>
                            <div className={styles.doctorInitial}>
                              {providerName?.charAt(0).toUpperCase() || (isHealthcareProfessional ? 'H' : 'D')}
                            </div>
                          </div>
                          <div className={styles.doctorBasicInfo}>
                            <h3 className={styles.doctorName}>{providerName}</h3>
                            <p className={styles.doctorSpecialization}>{providerSpecialty}</p>
                          </div>
                        </div>

                        {/* Provider Details */}
                        <div className={styles.doctorDetails}>
                          <div className={styles.detailRow}>
                            <span className={styles.detailIcon}>
                              {isHealthcareProfessional ? '💻' : '🏥'}
                            </span>
                            <div className={styles.detailContent}>
                              <span className={styles.detailLabel}>
                                {isHealthcareProfessional ? 'Service Type' : 'Institution'}
                              </span>
                              <span className={styles.detailValue}>{providerInstitution}</span>
                          </div>
                        </div>
                        
                        <div className={styles.detailRow}>
                          <span className={styles.detailIcon}>📍</span>
                          <div className={styles.detailContent}>
                            <span className={styles.detailLabel}>District</span>
                            <span className={styles.detailValue}>{providerDistrict}</span>
                          </div>
                        </div>
                        
                        <div className={styles.detailRow}>
                          <span className={styles.detailIcon}>🎓</span>
                          <div className={styles.detailContent}>
                            <span className={styles.detailLabel}>Experience</span>
                            <span className={styles.detailValue}>
                              {providerExperience} years
                            </span>
                          </div>
                        </div>

                        {!isHealthcareProfessional && provider.doctor_phone && (
                          <div className={styles.detailRow}>
                            <span className={styles.detailIcon}>📞</span>
                            <div className={styles.detailContent}>
                              <span className={styles.detailLabel}>Phone</span>
                              <span className={styles.detailValue}>{provider.doctor_phone}</span>
                            </div>
                          </div>
                        )}

                        {!isHealthcareProfessional && provider.alternative_number && (
                          <div className={styles.detailRow}>
                            <span className={styles.detailIcon}>📱</span>
                            <div className={styles.detailContent}>
                              <span className={styles.detailLabel}>Alternative</span>
                              <span className={styles.detailValue}>{provider.alternative_number}</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Show email for healthcare professionals, doctors have doctor_email */}
                        {(isHealthcareProfessional ? provider.email : provider.doctor_email) && (
                          <div className={styles.detailRow}>
                            <span className={styles.detailIcon}>📧</span>
                            <div className={styles.detailContent}>
                              <span className={styles.detailLabel}>Email</span>
                              <span className={styles.detailValue}>
                                {isHealthcareProfessional ? provider.email : provider.doctor_email}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Show license only for doctors */}
                        {!isHealthcareProfessional && provider.license_number && (
                          <div className={styles.detailRow}>
                            <span className={styles.detailIcon}>🆔</span>
                            <div className={styles.detailContent}>
                              <span className={styles.detailLabel}>License</span>
                              <span className={styles.detailValue}>{provider.license_number}</span>
                            </div>
                          </div>
                        )}

                        {/* Duration Info */}
                        <div className={styles.detailRow}>
                          <span className={styles.detailIcon}>⏱️</span>
                          <div className={styles.detailContent}>
                            <span className={styles.detailLabel}>Duration</span>
                            <span className={styles.detailValue}>
                              {meetingType === 'physical' ? '2 hours' : '1 hour'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Provider Actions */}
                      <div className={styles.doctorActions}>
                        <button 
                          className={styles.primaryButton}
                          onClick={() => handleBookAppointment(providerId)}
                        >
                          <span className={styles.buttonIcon}>📅</span>
                          Book {meetingType === 'physical' ? 'Physical' : 
                                meetingType === 'online' ? 'Online' : 
                                'Consultation'}
                          {isHealthcareProfessional ? ' Session' : ' Appointment'}
                        </button>
                        <button 
                          className={styles.secondaryButton}
                          onClick={() => handleViewProviderProfile(providerId)}
                        >
                          <span className={styles.buttonIcon}>👁️</span>
                          View Profile
                        </button>
                      </div>

                      {/* Status Indicator */}
                      <div className={styles.statusIndicator}>
                        <div className={styles.statusDot}></div>
                        <span className={styles.statusText}>Available</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Navigation Section */}
              <div className={styles.navigationSection}>
                <button 
                  className={styles.changeTypeButton}
                  onClick={handleBackToSelection}
                >
                  🔄 Change Meeting Type
                </button>
                <button 
                  className={styles.backToEldersButton}
                  onClick={() => navigate('/family-member/elders')}
                >
                  ← Back to Elders List
                </button>
                <button 
                  className={styles.backToDashboardButton}
                  onClick={() => navigate('/family-member/dashboard')}
                >
                  🏠 Back to Dashboard
                </button>
              </div>
            </>
          )}
        </div>
      </FamilyMemberLayout>
    </div>
  );
};

export default ElderDoctors;

