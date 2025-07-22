import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ElderLayout from '../../components/ElderLayout';
import styles from '../../components/css/elder/caregivers.module.css';
import Navbar from '../../components/navbar';

const ElderCaregivers = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Dummy data for caregivers
  const [caregivers] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      specialization: 'Personal Care & Mobility',
      experience: '8 years',
      rating: 4.9,
      location: 'Downtown District',
      phone: '+1 234-567-8901',
      email: 'sarah.johnson@silvercare.com',
      avatar: null,
      status: 'active',
      availableHours: 'Mon-Fri 8AM-6PM',
      languages: ['English', 'Spanish'],
      certifications: ['CNA', 'CPR', 'First Aid'],
      bio: 'Compassionate caregiver with 8 years of experience in elderly care. Specialized in mobility assistance and personal care.',
      services: ['Personal hygiene assistance', 'Medication reminders', 'Mobility support', 'Light housekeeping'],
      nextVisit: '2025-07-23T09:00:00Z',
      totalHours: 240,
      completedTasks: 156
    },
    {
      id: 2,
      name: 'Michael Chen',
      specialization: 'Medical Care & Therapy',
      experience: '12 years',
      rating: 4.8,
      location: 'North District',
      phone: '+1 234-567-8902',
      email: 'michael.chen@silvercare.com',
      avatar: null,
      status: 'active',
      availableHours: 'Tue-Sat 7AM-3PM',
      languages: ['English', 'Mandarin'],
      certifications: ['RN', 'Physical Therapy Assistant', 'CPR'],
      bio: 'Registered nurse with extensive experience in geriatric care and physical therapy assistance.',
      services: ['Medication management', 'Physical therapy support', 'Health monitoring', 'Emergency response'],
      nextVisit: '2025-07-24T07:30:00Z',
      totalHours: 180,
      completedTasks: 98
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      specialization: 'Companionship & Activities',
      experience: '5 years',
      rating: 4.7,
      location: 'South District',
      phone: '+1 234-567-8903',
      email: 'emma.rodriguez@silvercare.com',
      avatar: null,
      status: 'active',
      availableHours: 'Mon-Wed-Fri 2PM-8PM',
      languages: ['English', 'Spanish', 'French'],
      certifications: ['Companion Care', 'Activity Therapy', 'Mental Health First Aid'],
      bio: 'Dedicated companion caregiver focused on emotional support and engaging activities for seniors.',
      services: ['Companionship', 'Social activities', 'Transportation', 'Meal preparation'],
      nextVisit: '2025-07-25T14:00:00Z',
      totalHours: 320,
      completedTasks: 201
    },
    {
      id: 4,
      name: 'David Thompson',
      specialization: 'Night Care & Monitoring',
      experience: '6 years',
      rating: 4.6,
      location: 'Central District',
      phone: '+1 234-567-8904',
      email: 'david.thompson@silvercare.com',
      avatar: null,
      status: 'on-leave',
      availableHours: 'Mon-Thu 10PM-6AM',
      languages: ['English'],
      certifications: ['Night Care Specialist', 'CPR', 'Sleep Disorder Management'],
      bio: 'Experienced night shift caregiver specializing in overnight monitoring and emergency response.',
      services: ['Overnight monitoring', 'Sleep assistance', 'Emergency response', 'Safety checks'],
      nextVisit: null,
      totalHours: 150,
      completedTasks: 89
    }
  ]);

  // Dummy care schedule data
  const [careSchedule] = useState([
    {
      id: 1,
      caregiverId: 1,
      caregiverName: 'Sarah Johnson',
      date: '2025-07-23',
      startTime: '09:00',
      endTime: '13:00',
      services: ['Personal hygiene', 'Medication reminder', 'Light housekeeping'],
      status: 'scheduled'
    },
    {
      id: 2,
      caregiverId: 2,
      caregiverName: 'Michael Chen',
      date: '2025-07-24',
      startTime: '07:30',
      endTime: '11:30',
      services: ['Health monitoring', 'Physical therapy', 'Medication management'],
      status: 'scheduled'
    },
    {
      id: 3,
      caregiverId: 3,
      caregiverName: 'Emma Rodriguez',
      date: '2025-07-25',
      startTime: '14:00',
      endTime: '18:00',
      services: ['Companionship', 'Social activities', 'Meal preparation'],
      status: 'scheduled'
    }
  ]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleBackToDashboard = () => {
    navigate('/elder/dashboard');
  };

  const handleViewDetails = (caregiver) => {
    setSelectedCaregiver(caregiver);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCaregiver(null);
  };

  const handleContactCaregiver = (caregiver, method) => {
    if (method === 'call') {
      window.open(`tel:${caregiver.phone}`);
    } else if (method === 'message') {
      // Navigate to messaging page or open messaging modal
      console.log(`Send message to ${caregiver.name}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  const activeCaregivers = caregivers.filter(c => c.status === 'active');
  const inactiveCaregivers = caregivers.filter(c => c.status !== 'active');

  if (loading) {
    return (
      <>
        <Navbar />
        <ElderLayout>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading your caregivers...</p>
          </div>
        </ElderLayout>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <ElderLayout>
        
      <div className={styles.caregiversContainer}>
        <div className={styles.caregiversContent}>
          {/* Header */}
          <div className={styles.pageHeader}>
            <div className={styles.headerContent}>
              <div className={styles.headerInfo}>
                <h1>My Care Team</h1>
                <p>Manage your caregivers and care schedule</p>
              </div>
              <button 
                onClick={handleBackToDashboard}
                className={styles.backButton}
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statsCard}>
              <div className={styles.statsIcon}>👥</div>
              <div className={styles.statsContent}>
                <h3>Active Caregivers</h3>
                <div className={styles.statsNumber}>{activeCaregivers.length}</div>
              </div>
            </div>
            <div className={styles.statsCard}>
              <div className={styles.statsIcon}>📅</div>
              <div className={styles.statsContent}>
                <h3>Scheduled Visits</h3>
                <div className={styles.statsNumber}>{careSchedule.length}</div>
              </div>
            </div>
            <div className={styles.statsCard}>
              <div className={styles.statsIcon}>⭐</div>
              <div className={styles.statsContent}>
                <h3>Average Rating</h3>
                <div className={styles.statsNumber}>4.8</div>
              </div>
            </div>
            <div className={styles.statsCard}>
              <div className={styles.statsIcon}>🕒</div>
              <div className={styles.statsContent}>
                <h3>Total Care Hours</h3>
                <div className={styles.statsNumber}>890</div>
              </div>
            </div>
          </div>

          {/* Care Schedule Section */}
          <div className={styles.scheduleSection}>
            <div className={styles.sectionHeader}>
              <h2>Upcoming Care Schedule</h2>
              <button className={styles.viewAllBtn}>View All</button>
            </div>
            <div className={styles.scheduleGrid}>
              {careSchedule.map((schedule) => (
                <div key={schedule.id} className={styles.scheduleCard}>
                  <div className={styles.scheduleHeader}>
                    <div className={styles.scheduleDate}>
                      <div className={styles.dateText}>{schedule.date}</div>
                      <div className={styles.timeText}>
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                    </div>
                    <div className={styles.statusBadge}>
                      {schedule.status}
                    </div>
                  </div>
                  <div className={styles.scheduleContent}>
                    <h4>{schedule.caregiverName}</h4>
                    <div className={styles.servicesList}>
                      {schedule.services.map((service, index) => (
                        <span key={index} className={styles.serviceTag}>
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Caregivers Section */}
          <div className={styles.caregiversSection}>
            <div className={styles.sectionHeader}>
              <h2>My Caregivers</h2>
              <div className={styles.tabContainer}>
                <button
                  className={`${styles.tabBtn} ${activeTab === 'active' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('active')}
                >
                  Active ({activeCaregivers.length})
                </button>
                <button
                  className={`${styles.tabBtn} ${activeTab === 'inactive' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('inactive')}
                >
                  On Leave ({inactiveCaregivers.length})
                </button>
              </div>
            </div>

            <div className={styles.caregiversGrid}>
              {(activeTab === 'active' ? activeCaregivers : inactiveCaregivers).map((caregiver) => (
                <div key={caregiver.id} className={styles.caregiverCard}>
                  <div className={styles.caregiverHeader}>
                    <div className={styles.caregiverInfo}>
                      <div className={styles.caregiverAvatar}>
                        {caregiver.avatar ? (
                          <img src={caregiver.avatar} alt={caregiver.name} />
                        ) : (
                          getInitials(caregiver.name)
                        )}
                      </div>
                      <div className={styles.caregiverDetails}>
                        <h3>{caregiver.name}</h3>
                        <p className={styles.specialization}>{caregiver.specialization}</p>
                        <div className={styles.rating}>
                          <span className={styles.stars}>⭐ {caregiver.rating}</span>
                          <span className={styles.experience}>• {caregiver.experience}</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.statusIndicator}>
                      <span className={`${styles.status} ${styles[caregiver.status.replace('-', '')]}`}>
                        {caregiver.status === 'active' ? 'Available' : 'On Leave'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.caregiverMeta}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Location:</span>
                      <span className={styles.metaValue}>{caregiver.location}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Available:</span>
                      <span className={styles.metaValue}>{caregiver.availableHours}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Next Visit:</span>
                      <span className={styles.metaValue}>
                        {caregiver.nextVisit ? 
                          `${formatDate(caregiver.nextVisit)} at ${formatTime(caregiver.nextVisit)}` :
                          'Not scheduled'
                        }
                      </span>
                    </div>
                  </div>

                  <div className={styles.caregiverActions}>
                    <button
                      onClick={() => handleContactCaregiver(caregiver, 'call')}
                      className={styles.callBtn}
                      title="Call caregiver"
                    >
                      📞
                    </button>
                    <button
                      onClick={() => handleContactCaregiver(caregiver, 'message')}
                      className={styles.messageBtn}
                      title="Send message"
                    >
                      💬
                    </button>
                    <button
                      onClick={() => handleViewDetails(caregiver)}
                      className={styles.detailsBtn}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Caregiver Details Modal */}
        {showModal && selectedCaregiver && (
          <div className={styles.modal} onClick={handleCloseModal}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>{selectedCaregiver.name}</h3>
                <button onClick={handleCloseModal} className={styles.closeBtn}>
                  ×
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.caregiverProfile}>
                  <div className={styles.profileSection}>
                    <div className={styles.profileAvatar}>
                      {selectedCaregiver.avatar ? (
                        <img src={selectedCaregiver.avatar} alt={selectedCaregiver.name} />
                      ) : (
                        getInitials(selectedCaregiver.name)
                      )}
                    </div>
                    <div className={styles.profileInfo}>
                      <h4>{selectedCaregiver.name}</h4>
                      <p>{selectedCaregiver.specialization}</p>
                      <div className={styles.profileMeta}>
                        <span>⭐ {selectedCaregiver.rating} rating</span>
                        <span>• {selectedCaregiver.experience} experience</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.profileDetails}>
                    <div className={styles.detailSection}>
                      <h5>About</h5>
                      <p>{selectedCaregiver.bio}</p>
                    </div>

                    <div className={styles.detailSection}>
                      <h5>Services</h5>
                      <div className={styles.servicesList}>
                        {selectedCaregiver.services.map((service, index) => (
                          <span key={index} className={styles.serviceTag}>
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={styles.detailSection}>
                      <h5>Certifications</h5>
                      <div className={styles.certificationsList}>
                        {selectedCaregiver.certifications.map((cert, index) => (
                          <span key={index} className={styles.certificationTag}>
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={styles.detailSection}>
                      <h5>Languages</h5>
                      <p>{selectedCaregiver.languages.join(', ')}</p>
                    </div>

                    <div className={styles.detailSection}>
                      <h5>Contact Information</h5>
                      <p>📞 {selectedCaregiver.phone}</p>
                      <p>📧 {selectedCaregiver.email}</p>
                    </div>

                    <div className={styles.statsSection}>
                      <div className={styles.statItem}>
                        <span className={styles.statNumber}>{selectedCaregiver.totalHours}</span>
                        <span className={styles.statLabel}>Total Hours</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statNumber}>{selectedCaregiver.completedTasks}</span>
                        <span className={styles.statLabel}>Tasks Completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
    </ElderLayout>
    </>
  );
};

export default ElderCaregivers;
