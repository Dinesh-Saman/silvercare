import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/navbar';
import HealthProfessionalSidebar from '../../components/HealthProfessionalSidebar';
import styles from '../../components/css/doctor/dashboard.module.css';

const HealthProfessionalDashboard = () => {
  const { currentUser } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Placeholder data for demonstration
  const dashboardData = {
    todaysAppointments: [],
    upcomingAppointments: [],
    nextAppointment: null,
    counts: {
      todaysAppointments: 0,
      upcomingAppointments: 0
    }
  };

  // Example tasks
  const tasks = [
    { id: 1, title: "Review today's appointments", time: "08:00 AM" },
    { id: 2, title: "Check treatment plans", time: "10:00 AM" },
    { id: 3, title: "Resource review", time: "03:00 PM" },
  ];

  // Placeholder consultations
  const consultations = [];

  // Placeholder next patient
  const nextPatient = null;

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <h2>Loading...</h2>
        <p>Fetching your dashboard data...</p>
      </div>
    );
  }

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
      <HealthProfessionalSidebar onToggleCollapse={setSidebarCollapsed} />
      <div className={`${styles.mainContent} ${sidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
        <Navbar />
        {/* Header Section */}
        <div className={styles.headerSection}>
          <div className={styles.welcomeCard}>
            <div className={styles.welcomeContent}>
              <h1 className={styles.welcomeTitle}>Welcome, {currentUser.name}!</h1>
              <p className={styles.welcomeSubtitle}>Manage your patients and appointments from your dashboard</p>
              <div className={styles.userInfo}>
                <span className={styles.userEmail}>📧 {currentUser.email}</span>
                <span className={styles.userRole}>🧑‍⚕️ {currentUser.role.replace('_', ' ').toUpperCase()}</span>
              </div>
            </div>
            <div className={styles.welcomeImage}>
              <div className={styles.avatarPlaceholder}>
                <span className={styles.avatarIcon}>🧑‍⚕️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className={styles.statsSection}>
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
                <h3 className={styles.statNumber}>0</h3>
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
            <div className={styles.contentCard}>
              <h2 className={styles.sectionTitle}>🏥 Next Patient</h2>
              {nextPatient ? (
                <div className={styles.nextPatientCard}>
                  {/* ...next patient details... */}
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
            <div className={styles.contentCard}>
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
            <div className={styles.contentCard}>
              <h2 className={styles.sectionTitle}>📊 Upcoming Consultations</h2>
              {consultations.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>📅</div>
                  <h3>No Upcoming Consultations</h3>
                  <p>Your schedule is clear for now.</p>
                </div>
              ) : (
                <div className={styles.consultationsList}>
                  {/* ...consultation items... */}
                </div>
              )}
            </div>

            {/* Today's Appointments */}
            <div className={styles.contentCard}>
              <h2 className={styles.sectionTitle}>📅 Today's Schedule</h2>
              <div className={styles.appointmentsList}>
                {dashboardData.todaysAppointments.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>📅</div>
                    <h3>No Appointments Today</h3>
                    <p>You have a free day!</p>
                  </div>
                ) : (
                  dashboardData.todaysAppointments.map((app, idx) => (
                    <div key={idx} className={styles.appointmentItem}>
                      <div className={styles.appointmentTime}>
                        <span className={styles.timeLabel}>--:--</span>
                      </div>
                      <div className={styles.appointmentDetails}>
                        <h4 className={styles.appointmentPatient}>Patient Name</h4>
                        <p className={styles.appointmentType}>Consultation</p>
                      </div>
                      <button className={styles.appointmentAction}>Join</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className={styles.quickActionsSection}>
          <div className={styles.quickActionsContainer}>
            <h2 className={styles.sectionTitle}>⚡ Quick Actions</h2>
            <div className={styles.quickActionsGrid}>
              <div className={styles.quickActionCard}>
                <div className={styles.quickActionIcon}>📝</div>
                <div className={styles.quickActionContent}>
                  <h3 className={styles.quickActionTitle}>Create Treatment Plan</h3>
                  <p className={styles.quickActionDescription}>Design new treatment plans for patients</p>
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
                <div className={styles.quickActionIcon}>📚</div>
                <div className={styles.quickActionContent}>
                  <h3 className={styles.quickActionTitle}>Resources</h3>
                  <p className={styles.quickActionDescription}>Access mental health resources and guidelines</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthProfessionalDashboard;

