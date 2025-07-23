import React, { useState } from 'react';
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

  // Placeholder assigned elderly users
  const assignedElders = [
    { id: 1, name: 'Elderly User 1', age: 75, lastConsult: '2024-06-01', status: 'Stable' },
    { id: 2, name: 'Elderly User 2', age: 80, lastConsult: '2024-05-28', status: 'Needs Attention' },
  ];

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
              <p className={styles.welcomeSubtitle}>Manage your mental health practice and elderly users from your dashboard</p>
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
                <h3 className={styles.statNumber}>{assignedElders.length}</h3>
                <p className={styles.statLabel}>Assigned Elders</p>
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
              <h2 className={styles.sectionTitle}>👴 Assigned Elderly Users</h2>
              {assignedElders.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>👴</div>
                  <h3>No Assigned Elders</h3>
                  <p>You have no assigned elderly users.</p>
                </div>
              ) : (
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {assignedElders.map((elder) => (
                    <div key={elder.id} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, padding: 8, borderRadius: 8, background: '#f8f9fa' }}>
                      <span style={{ fontSize: 28 }}>👵</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{elder.name} <span style={{ color: '#888', fontWeight: 400 }}>({elder.age} yrs)</span></div>
                        <div style={{ fontSize: 13, color: '#888' }}>Last Consult: {elder.lastConsult}</div>
                        <div style={{ fontSize: 13, color: elder.status === 'Needs Attention' ? '#e74c3c' : '#27ae60' }}>{elder.status}</div>
                      </div>
                      <button style={{ background: '#6a82fb', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}>View Records</button>
                    </div>
                  ))}
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

          {/* Right Half: Session Management, Consultations, Communication, Resources */}
          <div className={styles.rightContentContainer}>
            {/* Session Management */}
            <div className={styles.contentCard}>
              <h2 className={styles.sectionTitle}>🗓️ Manage Sessions</h2>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button style={{ background: '#27ae60', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 18px', fontWeight: 600, cursor: 'pointer' }}>Approve</button>
                <button style={{ background: '#f39c12', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 18px', fontWeight: 600, cursor: 'pointer' }}>Reschedule</button>
                <button style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 18px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              </div>
              <div style={{ marginTop: 12, color: '#888', fontSize: 14 }}>Manage mental health session requests and appointments.</div>
            </div>

            {/* Consultations */}
            <div className={styles.contentCard}>
              <h2 className={styles.sectionTitle}>💬 Conduct Consultations</h2>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button style={{ background: '#6a82fb', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 18px', fontWeight: 600, cursor: 'pointer' }}>Start Virtual</button>
                <button style={{ background: '#fc5c7d', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 18px', fontWeight: 600, cursor: 'pointer' }}>Start In-Person</button>
              </div>
              <div style={{ marginTop: 12, color: '#888', fontSize: 14 }}>Conduct virtual or in-person mental health consultations.</div>
            </div>

            {/* Communication */}
            <div className={styles.contentCard}>
              <h2 className={styles.sectionTitle}>📞 Communication</h2>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button style={{ background: '#6a82fb', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 18px', fontWeight: 600, cursor: 'pointer' }}>Message Family</button>
                <button style={{ background: '#fc5c7d', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 18px', fontWeight: 600, cursor: 'pointer' }}>Message Caregiver</button>
                <button style={{ background: '#43c6ac', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 18px', fontWeight: 600, cursor: 'pointer' }}>Message Doctor</button>
              </div>
              <div style={{ marginTop: 12, color: '#888', fontSize: 14 }}>Communicate with family members, caregivers, and doctors regarding elderly users’ mental wellness.</div>
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

