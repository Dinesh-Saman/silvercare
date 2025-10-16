import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ElderLayout from '../../components/ElderLayout';
import styles from '../../components/css/elder/events.module.css';
import Navbar from '../../components/navbar';

const ElderEvents = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [eventFilter, setEventFilter] = useState('all');

  // Dummy data for events
  const [events] = useState([
    {
      id: 1,
      title: 'Morning Yoga & Wellness',
      category: 'wellness',
      date: '2025-07-25T08:00:00Z',
      duration: 60,
      location: 'Community Center - Room A',
      instructor: 'Sarah Williams',
      description: 'Start your day with gentle yoga exercises designed specifically for seniors. Improve flexibility, balance, and mental well-being.',
      capacity: 15,
      enrolled: 8,
      status: 'upcoming',
      image: null,
      difficulty: 'Beginner',
      requirements: ['Yoga mat', 'Comfortable clothing', 'Water bottle'],
      benefits: ['Improved flexibility', 'Better balance', 'Stress reduction', 'Social interaction']
    },
    {
      id: 2,
      title: 'Digital Literacy Workshop',
      category: 'education',
      date: '2025-07-26T14:00:00Z',
      duration: 90,
      location: 'Learning Center - Lab 1',
      instructor: 'Michael Tech',
      description: 'Learn how to use smartphones, tablets, and computers safely. This workshop covers basic operations, internet browsing, and staying connected with family.',
      capacity: 12,
      enrolled: 10,
      status: 'upcoming',
      image: null,
      difficulty: 'Beginner',
      requirements: ['Bring your device (optional)', 'Notepad', 'Pen'],
      benefits: ['Digital confidence', 'Stay connected', 'Online safety', 'Independence']
    },
    {
      id: 3,
      title: 'Cooking Together: Healthy Meals',
      category: 'social',
      date: '2025-07-27T11:00:00Z',
      duration: 120,
      location: 'Kitchen Studio',
      instructor: 'Chef Maria Lopez',
      description: 'Join us for a fun cooking session where we prepare nutritious and delicious meals. Learn new recipes and enjoy a meal together.',
      capacity: 8,
      enrolled: 6,
      status: 'upcoming',
      image: null,
      difficulty: 'All levels',
      requirements: ['Apron', 'Closed-toe shoes'],
      benefits: ['Nutrition knowledge', 'Social bonding', 'New skills', 'Tasty meal']
    },
    {
      id: 4,
      title: 'Memory Lane: Storytelling Circle',
      category: 'social',
      date: '2025-07-28T15:30:00Z',
      duration: 75,
      location: 'Library - Reading Room',
      instructor: 'Dr. Emily Chen',
      description: 'Share your stories and listen to others in this warm and welcoming storytelling circle. A great way to connect with fellow community members.',
      capacity: 20,
      enrolled: 12,
      status: 'upcoming',
      image: null,
      difficulty: 'All levels',
      requirements: ['Comfortable seating', 'Optional: photos or mementos'],
      benefits: ['Memory preservation', 'Social connection', 'Mental stimulation', 'Emotional well-being']
    },
    {
      id: 5,
      title: 'Garden Therapy Session',
      category: 'wellness',
      date: '2025-07-29T09:30:00Z',
      duration: 90,
      location: 'Community Garden',
      instructor: 'Green Thumb Society',
      description: 'Connect with nature through therapeutic gardening activities. Plant, nurture, and harvest while enjoying the outdoors.',
      capacity: 10,
      enrolled: 7,
      status: 'upcoming',
      image: null,
      difficulty: 'All levels',
      requirements: ['Garden gloves', 'Sun hat', 'Comfortable shoes'],
      benefits: ['Nature connection', 'Physical activity', 'Fresh air', 'Sense of accomplishment']
    },
    {
      id: 6,
      title: 'Art Therapy Workshop',
      category: 'creative',
      date: '2025-07-22T13:00:00Z',
      duration: 60,
      location: 'Art Studio',
      instructor: 'Lisa Anderson',
      description: 'Express yourself through various art mediums. No experience necessary - just bring your creativity and willingness to explore.',
      capacity: 12,
      enrolled: 12,
      status: 'completed',
      image: null,
      difficulty: 'All levels',
      requirements: ['None - all materials provided'],
      benefits: ['Creative expression', 'Stress relief', 'Cognitive stimulation', 'Self-discovery']
    },
    {
      id: 7,
      title: 'Music & Movement Therapy',
      category: 'wellness',
      date: '2025-07-21T10:00:00Z',
      duration: 45,
      location: 'Activity Hall',
      instructor: 'David Music',
      description: 'Enjoy music-based activities that promote physical movement and cognitive function. Sing along to favorite tunes and gentle dancing.',
      capacity: 25,
      enrolled: 18,
      status: 'completed',
      image: null,
      difficulty: 'All levels',
      requirements: ['Comfortable clothing', 'Water bottle'],
      benefits: ['Music enjoyment', 'Physical movement', 'Memory stimulation', 'Joy and happiness']
    },
    {
      id: 8,
      title: 'Book Club Discussion',
      category: 'education',
      date: '2025-07-20T14:30:00Z',
      duration: 90,
      location: 'Library - Conference Room',
      instructor: 'Book Club Members',
      description: 'Monthly book club meeting to discuss "The Seven Husbands of Evelyn Hugo". Join us for lively discussions and refreshments.',
      capacity: 15,
      enrolled: 13,
      status: 'completed',
      image: null,
      difficulty: 'All levels',
      requirements: ['Book (available at library)', 'Reading glasses if needed'],
      benefits: ['Intellectual stimulation', 'Social interaction', 'Reading motivation', 'Critical thinking']
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

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  const handleJoinEvent = (eventId) => {
    // Handle event joining logic
    console.log(`Joining event ${eventId}`);
  };

  const handleLeaveEvent = (eventId) => {
    // Handle event leaving logic
    console.log(`Leaving event ${eventId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isUpcomingEvent = (event) => {
    return new Date(event.date) > new Date();
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'wellness': return '🧘';
      case 'education': return '📚';
      case 'social': return '👥';
      case 'creative': return '🎨';
      default: return '📅';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'wellness': return '#10b981';
      case 'education': return '#3b82f6';
      case 'social': return '#f59e0b';
      case 'creative': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  const getFilteredEvents = () => {
    let filtered = events;
    
    // Filter by status (upcoming/completed)
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(event => isUpcomingEvent(event));
    } else {
      filtered = filtered.filter(event => !isUpcomingEvent(event));
    }
    
    // Filter by category
    if (eventFilter !== 'all') {
      filtered = filtered.filter(event => event.category === eventFilter);
    }
    
    return filtered;
  };

  const upcomingEvents = events.filter(event => isUpcomingEvent(event));
  const completedEvents = events.filter(event => !isUpcomingEvent(event));
  const filteredEvents = getFilteredEvents();

  if (loading) {
    return (
      <>
        <Navbar />
        <ElderLayout>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading events...</p>
          </div>
        </ElderLayout>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <ElderLayout>
      <div className={styles.eventsContainer}>
        <div className={styles.eventsContent}>
          {/* Header */}
          <div className={styles.pageHeader}>
            <div className={styles.headerContent}>
              <div className={styles.headerInfo}>
                <h1>Community Events</h1>
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
              <div className={styles.statsIcon}>📅</div>
              <div className={styles.statsContent}>
                <h3>Upcoming Events</h3>
                <div className={styles.statsNumber}>{upcomingEvents.length}</div>
              </div>
            </div>
            <div className={styles.statsCard}>
              <div className={styles.statsIcon}>✅</div>
              <div className={styles.statsContent}>
                <h3>Completed Events</h3>
                <div className={styles.statsNumber}>{completedEvents.length}</div>
              </div>
            </div>
            <div className={styles.statsCard}>
              <div className={styles.statsIcon}>🎯</div>
              <div className={styles.statsContent}>
                <h3>Events Joined</h3>
                <div className={styles.statsNumber}>12</div>
              </div>
            </div>
            <div className={styles.statsCard}>
              <div className={styles.statsIcon}>⭐</div>
              <div className={styles.statsContent}>
                <h3>Favorite Category</h3>
                <div className={styles.statsNumber}>Wellness</div>
              </div>
            </div>
          </div>

          {/* Events Section */}
          <div className={styles.eventsSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.headerLeft}>
                <h2>Events</h2>
                <div className={styles.tabContainer}>
                  <button
                    className={`${styles.tabBtn} ${activeTab === 'upcoming' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('upcoming')}
                  >
                    Upcoming ({upcomingEvents.length})
                  </button>
                  <button
                    className={`${styles.tabBtn} ${activeTab === 'completed' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('completed')}
                  >
                    Completed ({completedEvents.length})
                  </button>
                </div>
              </div>
              <div className={styles.filterContainer}>
                <select
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Categories</option>
                  <option value="wellness">Wellness</option>
                  <option value="education">Education</option>
                  <option value="social">Social</option>
                  <option value="creative">Creative</option>
                </select>
              </div>
            </div>

            <div className={styles.eventsGrid}>
              {filteredEvents.length === 0 ? (
                <div className={styles.noEvents}>
                  <div className={styles.noEventsIcon}>📅</div>
                  <h3>No events found</h3>
                  <p>Try adjusting your filters or check back later for new events.</p>
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <div key={event.id} className={styles.eventCard}>
                    <div className={styles.eventHeader}>
                      <div className={styles.categoryBadge} style={{ backgroundColor: getCategoryColor(event.category) }}>
                        <span className={styles.categoryIcon}>{getCategoryIcon(event.category)}</span>
                        <span>{event.category}</span>
                      </div>
                      <div className={styles.eventStatus}>
                        <span className={`${styles.statusBadge} ${styles[event.status]}`}>
                          {event.status}
                        </span>
                      </div>
                    </div>

                    <div className={styles.eventContent}>
                      <h3>{event.title}</h3>
                      <p className={styles.eventDescription}>{event.description}</p>
                      
                      <div className={styles.eventMeta}>
                        <div className={styles.metaItem}>
                          <span className={styles.metaIcon}>📅</span>
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <span className={styles.metaIcon}>🕒</span>
                          <span>{formatTime(event.date)}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <span className={styles.metaIcon}>📍</span>
                          <span>{event.location}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <span className={styles.metaIcon}>👨‍🏫</span>
                          <span>{event.instructor}</span>
                        </div>
                      </div>

                      <div className={styles.capacityInfo}>
                        <div className={styles.capacityBar}>
                          <div 
                            className={styles.capacityFill}
                            style={{ width: `${(event.enrolled / event.capacity) * 100}%` }}
                          ></div>
                        </div>
                        <span className={styles.capacityText}>
                          {event.enrolled}/{event.capacity} participants
                        </span>
                      </div>
                    </div>

                    <div className={styles.eventActions}>
                      {isUpcomingEvent(event) ? (
                        <>
                          <button
                            onClick={() => handleJoinEvent(event.id)}
                            className={styles.joinBtn}
                            disabled={event.enrolled >= event.capacity}
                          >
                            {event.enrolled >= event.capacity ? 'Full' : 'Join Event'}
                          </button>
                          <button
                            onClick={() => handleViewDetails(event)}
                            className={styles.detailsBtn}
                          >
                            View Details
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleViewDetails(event)}
                            className={styles.detailsBtn}
                          >
                            View Details
                          </button>
                          <button className={styles.feedbackBtn}>
                            Leave Feedback
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Event Details Modal */}
        {showModal && selectedEvent && (
          <div className={styles.modal} onClick={handleCloseModal}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div className={styles.modalTitle}>
                  <h3>{selectedEvent.title}</h3>
                  <div className={styles.modalCategories}>
                    <span 
                      className={styles.categoryBadge}
                      style={{ backgroundColor: getCategoryColor(selectedEvent.category) }}
                    >
                      {getCategoryIcon(selectedEvent.category)} {selectedEvent.category}
                    </span>
                    <span className={`${styles.statusBadge} ${styles[selectedEvent.status]}`}>
                      {selectedEvent.status}
                    </span>
                  </div>
                </div>
                <button onClick={handleCloseModal} className={styles.closeBtn}>
                  ×
                </button>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.eventDetails}>
                  <div className={styles.detailSection}>
                    <h4>Event Information</h4>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>📅 Date:</span>
                        <span>{formatDate(selectedEvent.date)}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>🕒 Time:</span>
                        <span>{formatTime(selectedEvent.date)}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>⏱️ Duration:</span>
                        <span>{selectedEvent.duration} minutes</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>📍 Location:</span>
                        <span>{selectedEvent.location}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>👨‍🏫 Instructor:</span>
                        <span>{selectedEvent.instructor}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>📊 Difficulty:</span>
                        <span>{selectedEvent.difficulty}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.detailSection}>
                    <h4>Description</h4>
                    <p>{selectedEvent.description}</p>
                  </div>

                  <div className={styles.detailSection}>
                    <h4>What to Bring</h4>
                    <ul className={styles.requirementsList}>
                      {selectedEvent.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.detailSection}>
                    <h4>Benefits</h4>
                    <div className={styles.benefitsList}>
                      {selectedEvent.benefits.map((benefit, index) => (
                        <span key={index} className={styles.benefitTag}>
                          ✓ {benefit}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.capacitySection}>
                    <h4>Enrollment</h4>
                    <div className={styles.capacityInfo}>
                      <div className={styles.capacityBar}>
                        <div 
                          className={styles.capacityFill}
                          style={{ width: `${(selectedEvent.enrolled / selectedEvent.capacity) * 100}%` }}
                        ></div>
                      </div>
                      <span className={styles.capacityText}>
                        {selectedEvent.enrolled} of {selectedEvent.capacity} spots filled
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                {isUpcomingEvent(selectedEvent) ? (
                  <>
                    <button
                      onClick={() => handleJoinEvent(selectedEvent.id)}
                      className={styles.joinBtn}
                      disabled={selectedEvent.enrolled >= selectedEvent.capacity}
                    >
                      {selectedEvent.enrolled >= selectedEvent.capacity ? 'Event Full' : 'Join Event'}
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className={styles.cancelBtn}
                    >
                      Close
                    </button>
                  </>
                ) : (
                  <>
                    <button className={styles.feedbackBtn}>
                      Leave Feedback
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className={styles.cancelBtn}
                    >
                      Close
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      </ElderLayout>
    </>
  );
};export default ElderEvents;
