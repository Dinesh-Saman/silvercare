import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/navbar';
import DoctorSidebar from '../../components/doctor_sidebar';
import WelcomeModal from '../../components/WelcomeModal';
import OnboardingTour from '../../components/OnboardingTour';
import styles from '../../components/css/doctor/dashboard.module.css';

const API_BASE = "http://localhost:5000"; // Change if your backend runs elsewhere

const DoctorDashboard = () => {
  const { currentUser, logout } = useAuth();
  const token = localStorage.getItem('silvercare_token');
  const [dashboardData, setDashboardData] = useState({
    todaysAppointments: [],
    upcomingAppointments: [],
    nextAppointment: null,
    nextAppointments: [],
    counts: {
      todaysAppointments: 0,
      upcomingAppointments: 0
    }
  });
  const [currentPatientIndex, setCurrentPatientIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Onboarding tour state
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showTour, setShowTour] = useState(false);
  
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Tour steps configuration
  const tourSteps = [
    {
      target: '[data-tour="header"]',
      title: 'Welcome to Your Dashboard',
      content: 'This is your personalized medical dashboard where you can manage your practice efficiently.',
      placement: 'bottom'
    },
    {
      target: '[data-tour="stats"]',
      title: 'Quick Statistics',
      content: 'Get an instant overview of your daily activities and patient load.',
      placement: 'bottom'
    },
    {
      target: '[data-tour="next-patient"]',
      title: 'Next Patient Details',
      content: 'View comprehensive information about your next scheduled patient.',
      placement: 'right'
    },
    {
      target: '[data-tour="tasks"]',
      title: 'Today\'s Tasks',
      content: 'Stay organized with your daily medical tasks and reminders.',
      placement: 'left'
    },
    {
      target: '[data-tour="consultations"]',
      title: 'Upcoming Consultations',
      content: 'Manage your consultation schedule and patient appointments.',
      placement: 'right'
    },
    {
      target: '[data-tour="schedule"]',
      title: 'Today\'s Schedule',
      content: 'View your complete daily schedule at a glance.',
      placement: 'left'
    },
    {
      target: '[data-tour="quick-actions"]',
      title: 'Quick Actions',
      content: 'Access frequently used medical tools and features instantly.',
      placement: 'top'
    }
  ];

  // Check if user is new and should see onboarding
  useEffect(() => {
    if (currentUser && !loading && !error) {
      const tourKey = `doctor_tour_${currentUser.user_id}`;
      const hasSeenTour = localStorage.getItem(tourKey);
      
      // Only show tour if user hasn't seen it before
      if (!hasSeenTour || hasSeenTour !== 'completed') {
        setShowWelcomeModal(true);
      }
    }
  }, [currentUser, loading, error]);

  // Tour control functions
  const startTour = () => {
    setShowWelcomeModal(false);
    setShowTour(true);
  };

  const skipTour = () => {
    setShowWelcomeModal(false);
    setShowTour(false);
    localStorage.setItem(`doctor_tour_${currentUser?.user_id}`, 'completed');
  };

  const completeTour = () => {
    setShowTour(false);
    localStorage.setItem(`doctor_tour_${currentUser?.user_id}`, 'completed');
  };

  // Function to restart tour (can be triggered by a help button)
  const restartTour = () => {
    localStorage.removeItem(`doctor_tour_${currentUser?.user_id}`);
    setShowWelcomeModal(true);
  };

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };
  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const calculateAge = (dob) => {
    if (!dob) return '';
    const diff = Date.now() - new Date(dob).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  // Check if appointment is within join window (15 minutes before to 2 hours after)
  const isWithinJoinWindow = (appointmentTime) => {
    if (!appointmentTime) {
      console.log('⚠️ isWithinJoinWindow: No appointment time provided');
      return false;
    }
    const now = new Date();
    const appointmentDate = new Date(appointmentTime);
    const fifteenMinutesBefore = new Date(appointmentDate.getTime() - 15 * 60 * 1000);
    const twoHoursAfter = new Date(appointmentDate.getTime() + 2 * 60 * 60 * 1000);
    const isWithin = now >= fifteenMinutesBefore && now <= twoHoursAfter;
    
    // Debug logging
    const minutesFromNow = Math.round((appointmentDate - now) / (1000 * 60));
    console.log(`⏰ Join window check: ${minutesFromNow > 0 ? '+' : ''}${minutesFromNow}min from now → ${isWithin ? 'JOINABLE' : 'Not joinable'}`);
    
    return isWithin;
  };

  // Fetch with token
  const fetchWithAuth = async (url, options = {}) => {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || 'Request failed');
    }
    return response.json();
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Wait for auth
        if (!currentUser?.user_id || !token) {
          setError("Not authenticated. Please log in again.");
          setLoading(false);
          return;
        }

        // Get doctor ID
        const doctorData = await fetchWithAuth(`${API_BASE}/api/doctor/user/${currentUser.user_id}`);
        if (!doctorData?.doctor?.doctor_id) {
          setError("Doctor not found for this user.");
          setLoading(false);
          return;
        }
        const doctorId = doctorData.doctor.doctor_id;

        // Get dashboard data
        const dashboard = await fetchWithAuth(`${API_BASE}/api/doctor/${doctorId}/dashboard`);
        if (!dashboard?.data) {
          setError("No dashboard data returned.");
          setLoading(false);
          return;
        }
        setDashboardData(dashboard.data);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        setCurrentPatientIndex(0); // Reset to first patient when data loads
        console.log('Dashboard data loaded:', dashboard.data);
        console.log('nextAppointments:', dashboard.data.nextAppointments);
        console.log('nextAppointment:', dashboard.data.nextAppointment);
=======
=======
>>>>>>> Stashed changes
        
        // Debug meeting functionality
        console.log('🔍 Dashboard data loaded for doctor:', doctorId);
        console.log('📊 Upcoming appointments:', dashboard.data.upcomingAppointments?.length || 0);
        
        // Debug join button logic
        if (dashboard.data.upcomingAppointments) {
          console.log('🔍 Debugging upcoming appointments...');
          dashboard.data.upcomingAppointments.slice(0, 5).forEach((apt, idx) => {
            const isOnline = apt.appointment_type === 'online';
            const hasLink = !!apt.meeting_link;
            const inWindow = isWithinJoinWindow(apt.date_time);
            const canJoin = isOnline && hasLink && inWindow;
            console.log(`🎯 Apt ${idx + 1}: ID=${apt.appointment_id}, Type=${apt.appointment_type}, HasLink=${hasLink}, InWindow=${inWindow}, CanJoin=${canJoin}`);
            console.log(`   📅 Time: ${apt.date_time}`);
            if (apt.meeting_link) {
              console.log(`   🔗 Link: ${apt.meeting_link.substring(0, 60)}...`);
            }
            console.log('');
          });
        }
        
        // Debug next patient logic
        if (dashboard.data.nextAppointments) {
          console.log('🔍 Debugging next appointments...');
          dashboard.data.nextAppointments.slice(0, 3).forEach((apt, idx) => {
            const isOnline = apt.appointment_type === 'online';
            const hasLink = !!apt.meeting_link;
            const inWindow = isWithinJoinWindow(apt.date_time);
            const canJoin = isOnline && hasLink && inWindow;
            console.log(`🎯 Next ${idx + 1}: ID=${apt.appointment_id}, Type=${apt.appointment_type}, HasLink=${hasLink}, InWindow=${inWindow}, CanJoin=${canJoin}`);
            console.log(`   📅 Time: ${apt.date_time}`);
            if (apt.meeting_link) {
              console.log(`   🔗 Link: ${apt.meeting_link.substring(0, 60)}...`);
            }
            console.log('');
          });
        }
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
      } catch (err) {
        // Try to parse error if it's HTML
        if (err.message && err.message.startsWith('<!DOCTYPE')) {
          setError("API endpoint not found or backend not running.");
        } else {
          setError(err.message || "Failed to load dashboard.");
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentUser, token]);

  // Extract unique elders from appointments
  const getUniqueElders = () => {
    const eldersMap = {};
    [
      ...(dashboardData.todaysAppointments || []),
      ...(dashboardData.upcomingAppointments || []),
      ...(dashboardData.nextAppointment ? [dashboardData.nextAppointment] : [])
    ].forEach(app => {
      if (app && app.elder_id && !eldersMap[app.elder_id]) {
        eldersMap[app.elder_id] = {
          id: app.elder_id,
          name: app.elder_name,
          dob: app.elder_dob,
          gender: app.elder_gender,
          contact: app.elder_contact,
          address: app.elder_address,
          medical_conditions: app.medical_conditions,
          avatar: app.elder_avatar,
          appointment: app
        };
      }
    });
    return Object.values(eldersMap);
  };

  const elders = getUniqueElders();

  // Next patient: from nextAppointments array with current index, fallback to single nextAppointment
  const nextPatient = dashboardData.nextAppointments && dashboardData.nextAppointments.length > 0
    ? {
        name: dashboardData.nextAppointments[currentPatientIndex]?.elder_name,
        dob: dashboardData.nextAppointments[currentPatientIndex]?.elder_dob,
        gender: dashboardData.nextAppointments[currentPatientIndex]?.elder_gender,
        contact: dashboardData.nextAppointments[currentPatientIndex]?.elder_contact,
        address: dashboardData.nextAppointments[currentPatientIndex]?.elder_address,
        medical_conditions: dashboardData.nextAppointments[currentPatientIndex]?.medical_conditions,
        avatar: dashboardData.nextAppointments[currentPatientIndex]?.elder_avatar,
        appointment: dashboardData.nextAppointments[currentPatientIndex]
      }
    : dashboardData.nextAppointment
    ? {
        name: dashboardData.nextAppointment.elder_name,
        dob: dashboardData.nextAppointment.elder_dob,
        gender: dashboardData.nextAppointment.elder_gender,
        contact: dashboardData.nextAppointment.elder_contact,
        address: dashboardData.nextAppointment.elder_address,
        medical_conditions: dashboardData.nextAppointment.medical_conditions,
        avatar: dashboardData.nextAppointment.elder_avatar,
        appointment: dashboardData.nextAppointment
      }
    : null;

  // Navigation functions for next patients
  const nextPatientHandler = () => {
    if (dashboardData.nextAppointments && currentPatientIndex < dashboardData.nextAppointments.length - 1) {
      setCurrentPatientIndex(currentPatientIndex + 1);
    }
  };

  const previousPatientHandler = () => {
    if (currentPatientIndex > 0) {
      setCurrentPatientIndex(currentPatientIndex - 1);
    }
  };

  // Upcoming consultations: from upcomingAppointments
  const consultations = (dashboardData.upcomingAppointments || []).map(app => ({
    id: app.elder_id,
    name: app.elder_name,
    date: formatDate(app.date_time),
    time: formatTime(app.date_time),
    avatar: app.elder_avatar,
    appointment: app,
    canJoin: app.appointment_type === 'online' && app.meeting_link && isWithinJoinWindow(app.date_time)
  }));

  // Example tasks (replace with real data if available)
  const tasks = [
    { id: 1, title: "Review today's appointments", time: "08:00 AM" },
    { id: 2, title: "Check medication updates", time: "10:00 AM" },
    { id: 3, title: "Family call follow-up", time: "03:00 PM" },
  ];

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <h2>Loading...</h2>
        <p>Fetching your dashboard data...</p>
      </div>
    );
  }

  // Don't render if error
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>⚠️ Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className={styles.retryBtn}>
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <DoctorSidebar onToggleCollapse={setSidebarCollapsed} />
      <div className={`${styles.mainContent} ${sidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
        <Navbar />
        
        {/* Header Section */}
      <div className={styles.headerSection} data-tour="header">
        <div className={styles.welcomeCard}>
          <div className={styles.welcomeContent}>
            <h1 className={styles.welcomeTitle}>Welcome back, Dr. {currentUser.name}!</h1>
            <p className={styles.welcomeSubtitle}>Manage your patients and appointments from your medical dashboard</p>
            <div className={styles.userInfo}>
              <span className={styles.userEmail}>📧 {currentUser.email}</span>
              <span className={styles.userRole}>👨‍⚕️ {currentUser.role.replace('_', ' ').toUpperCase()}</span>
            </div>
          </div>
          <div className={styles.welcomeImage}>
            <div className={styles.avatarPlaceholder}>
              <span className={styles.avatarIcon}>🩺</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className={styles.statsSection} data-tour="stats">
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📅</div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>{dashboardData.counts?.todaysAppointments || 0}</h3>
              <p className={styles.statLabel}>Today's Appointments</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⏰</div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>{dashboardData.counts?.upcomingAppointments || 0}</h3>
              <p className={styles.statLabel}>Upcoming Appointments</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>{elders.length}</h3>
              <p className={styles.statLabel}>Total Patients</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statContent}>
              <h3 className={styles.statNumber}>{tasks.length}</h3>
              <p className={styles.statLabel}>Today's Tasks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className={styles.mainContentSection}>
        {/* Next Patient & Tasks Section - Left Half */}
        <div className={styles.leftContentContainer}>
          <div className={styles.contentCard} data-tour="next-patient">
            <div className={styles.nextPatientHeader}>
              <h2 className={styles.sectionTitle}>🏥 Next Patient</h2>
              {dashboardData.nextAppointments && dashboardData.nextAppointments.length > 1 && (
                <div className={styles.patientNavigation}>
                  <button 
                    className={`${styles.navBtn} ${currentPatientIndex === 0 ? styles.disabled : ''}`}
                    onClick={previousPatientHandler}
                    disabled={currentPatientIndex === 0}
                  >
                    ⬅️ Previous
                  </button>
                  <span className={styles.patientCounter}>
                    {currentPatientIndex + 1} of {dashboardData.nextAppointments.length}
                  </span>
                  <button 
                    className={`${styles.navBtn} ${currentPatientIndex === dashboardData.nextAppointments.length - 1 ? styles.disabled : ''}`}
                    onClick={nextPatientHandler}
                    disabled={currentPatientIndex === dashboardData.nextAppointments.length - 1}
                  >
                    Next ➡️
                  </button>
                </div>
              )}
            </div>
            {nextPatient ? (
              <div className={styles.nextPatientCard}>
                <div className={styles.patientHeader}>
                  <img 
                    src={nextPatient.avatar || "https://randomuser.me/api/portraits/men/1.jpg"} 
                    alt={nextPatient.name} 
                    className={styles.patientAvatar} 
                  />
                  <div className={styles.patientInfo}>
                    <h3 className={styles.patientName}>{nextPatient.name}</h3>
                    <p className={styles.patientDetails}>Age: {calculateAge(nextPatient.dob) || 'N/A'}</p>
                    <p className={styles.patientDetails}>{nextPatient.address || 'N/A'}</p>
                    {nextPatient.appointment && (
                      <p className={styles.appointmentTime}>
                        📅 {formatDate(nextPatient.appointment.date_time)} at {formatTime(nextPatient.appointment.date_time)}
                      </p>
                    )}
                  </div>
                </div>
                <div className={styles.patientSummary}>
                  <h4>Medical Conditions:</h4>
                  <p>{nextPatient.medical_conditions || 'No conditions recorded'}</p>
                </div>
                <div className={styles.patientActions}>
                  <button className={styles.actionBtn}>📋 View Records</button>
                  {nextPatient.appointment?.appointment_type === 'online' && nextPatient.appointment?.meeting_link && isWithinJoinWindow(nextPatient.appointment.date_time) ? (
                    <button 
                      className={`${styles.actionBtn} ${styles.joinBtn}`}
                      onClick={() => {
                        console.log('🎥 Join button clicked!');
                        console.log('Meeting link:', nextPatient.appointment.meeting_link);
                        const opened = window.open(nextPatient.appointment.meeting_link, '_blank');
                        if (!opened) {
                          console.error('❌ Failed to open meeting link - popup blocked?');
                          alert('Please allow popups for this site to join meetings');
                        } else {
                          console.log('✅ Meeting window opened successfully');
                        }
                      }}
                    >
                      🎥 Join Meeting
                    </button>
                  ) : (
                    <button className={styles.actionBtn}>💬 Start Consultation</button>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>📅</div>
                <h3>No Next Patient</h3>
                <p>You have no upcoming appointments scheduled.</p>
              </div>
            )}
          </div>

          {/* Today's Tasks */}
          <div className={styles.contentCard} data-tour="tasks">
            <h2 className={styles.sectionTitle}>✅ Today's Tasks</h2>
            <div className={styles.tasksList}>
              {tasks.map(task => (
                <div key={task.id} className={styles.taskItem}>
                  <div className={styles.taskContent}>
                    <span className={styles.taskTitle}>{task.title}</span>
                    <span className={styles.taskTime}>{task.time}</span>
                  </div>
                  <button className={styles.taskCompleteBtn}>✓</button>
                </div>
              ))}
            </div>
            <button className={styles.viewAllBtn}>View All Tasks</button>
          </div>
        </div>

        {/* Upcoming Consultations & Calendar Section - Right Half */}
        <div className={styles.rightContentContainer}>
          <div className={styles.contentCard} data-tour="consultations">
            <h2 className={styles.sectionTitle}>📊 Upcoming Consultations</h2>
            {consultations.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>📅</div>
                <h3>No Upcoming Consultations</h3>
                <p>Your schedule is clear for now.</p>
              </div>
            ) : (
              <div className={styles.consultationsList}>
                {consultations.map(c => (
                  <div key={c.id + c.date + c.time} className={styles.consultationItem}>
                    <img 
                      src={c.avatar || "https://randomuser.me/api/portraits/men/2.jpg"} 
                      alt={c.name} 
                      className={styles.consultationAvatar} 
                    />
                    <div className={styles.consultationInfo}>
                      <h4 className={styles.consultationName}>{c.name}</h4>
                      <p className={styles.consultationTime}>{c.date} | {c.time}</p>
                    </div>
                    {c.canJoin ? (
                      <button 
                        className={`${styles.consultationBtn} ${styles.joinBtn}`}
                        onClick={() => {
                          console.log('🎥 Consultation join button clicked!');
                          console.log('Meeting link:', c.appointment.meeting_link);
                          const opened = window.open(c.appointment.meeting_link, '_blank');
                          if (!opened) {
                            console.error('❌ Failed to open meeting link - popup blocked?');
                            alert('Please allow popups for this site to join meetings');
                          } else {
                            console.log('✅ Meeting window opened successfully');
                          }
                        }}
                      >
                        🎥 Join
                      </button>
                    ) : (
                      <button className={styles.consultationBtn}>📋 View Record</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Appointments */}
          <div className={styles.contentCard} data-tour="schedule">
            <h2 className={styles.sectionTitle}>📅 Today's Schedule</h2>
            <div className={styles.appointmentsList}>
              {(dashboardData.todaysAppointments || []).length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>📅</div>
                  <h3>No Appointments Today</h3>
                  <p>You have a free day!</p>
                </div>
              ) : (
                (dashboardData.todaysAppointments || []).map((app, idx) => (
                  <div key={idx} className={styles.appointmentItem}>
                    <div className={styles.appointmentTime}>
                      <span className={styles.timeLabel}>{formatTime(app.date_time)}</span>
                    </div>
                    <div className={styles.appointmentDetails}>
                      <h4 className={styles.appointmentPatient}>{app.elder_name}</h4>
                      <p className={styles.appointmentType}>Regular Consultation</p>
                    </div>
                    {app.appointment_type === 'online' && app.meeting_link && isWithinJoinWindow(app.date_time) ? (
                      <button 
                        className={`${styles.appointmentAction} ${styles.joinBtn}`}
                        onClick={() => {
                          console.log('🎥 Today\'s appointment join button clicked!');
                          console.log('Meeting link:', app.meeting_link);
                          const opened = window.open(app.meeting_link, '_blank');
                          if (!opened) {
                            console.error('❌ Failed to open meeting link - popup blocked?');
                            alert('Please allow popups for this site to join meetings');
                          } else {
                            console.log('✅ Meeting window opened successfully');
                          }
                        }}
                      >
                        🎥 Join
                      </button>
                    ) : (
                      <button className={styles.appointmentAction}>Join</button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className={styles.quickActionsSection} data-tour="quick-actions">
        <div className={styles.quickActionsContainer}>
          <h2 className={styles.sectionTitle}>⚡ Quick Actions</h2>
          <div className={styles.quickActionsGrid}>
            <div className={styles.quickActionCard}>
              <div className={styles.quickActionIcon}>📝</div>
              <div className={styles.quickActionContent}>
                <h3 className={styles.quickActionTitle}>Write Prescription</h3>
                <p className={styles.quickActionDescription}>Create new prescriptions for patients</p>
              </div>
            </div>
            
            <div className={styles.quickActionCard}>
              <div className={styles.quickActionIcon}>📊</div>
              <div className={styles.quickActionContent}>
                <h3 className={styles.quickActionTitle}>View Reports</h3>
                <p className={styles.quickActionDescription}>Check patient reports and analytics</p>
              </div>
            </div>
            
            <div className={styles.quickActionCard}>
              <div className={styles.quickActionIcon}>👥</div>
              <div className={styles.quickActionContent}>
                <h3 className={styles.quickActionTitle}>Manage Patients</h3>
                <p className={styles.quickActionDescription}>View and update patient information</p>
              </div>
            </div>
            
            <div className={styles.quickActionCard}>
              <div className={styles.quickActionIcon}>📞</div>
              <div className={styles.quickActionContent}>
                <h3 className={styles.quickActionTitle}>Emergency Contacts</h3>
                <p className={styles.quickActionDescription}>Access emergency contact information</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help Button to restart tour */}
      <button 
        className={styles.helpButton}
        onClick={restartTour}
        title="Take a tour of the dashboard"
      >
        ❓
      </button>

      {/* Onboarding Components */}
      <WelcomeModal 
        isVisible={showWelcomeModal}
        onStartTour={startTour}
        onSkip={skipTour}
        userName={currentUser?.name}
      />
      
      <OnboardingTour 
        steps={tourSteps}
        isActive={showTour}
        onComplete={completeTour}
        onSkip={skipTour}
      />
      </div>
    </div>
  );
};

export default DoctorDashboard;