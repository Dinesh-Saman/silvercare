import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  getElderDetailsByEmail, 
  getAllSessions, 
  joinSession 
} from '../../services/elderApi2';
import styles from '../../components/css/elder/sessions.module.css';

const AllSessions = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [elderDetails, setElderDetails] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter and search states
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const sessionsPerPage = 6;

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchElderDetailsAndSessions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get elder details by email
        const elderResponse = await getElderDetailsByEmail(currentUser.email);
        const elderData = elderResponse.data;
        setElderDetails(elderData);

        if (elderData?.elder_id) {
          // Get all sessions
          const sessionsResponse = await getAllSessions(elderData.elder_id);
          
          if (sessionsResponse.data.success) {
            setSessions(sessionsResponse.data.sessions);
          } else {
            setError(sessionsResponse.data.error || 'Failed to fetch sessions');
          }
        }
      } catch (err) {
        console.error('Error fetching elder details and sessions:', err);
        setError('Failed to load sessions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.email) {
      fetchElderDetailsAndSessions();
    }
  }, [currentUser.email]);

  // Filter sessions based on status, search, date, and type
  useEffect(() => {
    let filtered = sessions;

    // Filter by status
    if (activeFilter !== "all") {
      if (activeFilter === "upcoming") {
        filtered = filtered.filter(session => {
          const sessionDate = new Date(session.date_time);
          const now = new Date();
          return sessionDate > now && session.status !== 'cancelled';
        });
      } else if (activeFilter === "past") {
        filtered = filtered.filter(session => {
          const sessionDate = new Date(session.date_time);
          const now = new Date();
          return sessionDate <= now || session.status === 'completed';
        });
      } else {
        filtered = filtered.filter(session => session.status === activeFilter);
      }
    }

    // Filter by search term (counselor name or specialization)
    if (searchTerm) {
      filtered = filtered.filter(session =>
        session.counselor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date
    if (dateFilter) {
      const filterDate = new Date(dateFilter).toDateString();
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.date_time).toDateString();
        return sessionDate === filterDate;
      });
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter(session => session.session_type === typeFilter);
    }

    setFilteredSessions(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [sessions, activeFilter, searchTerm, dateFilter, typeFilter]);

  // Pagination logic
  const indexOfLastSession = currentPage * sessionsPerPage;
  const indexOfFirstSession = indexOfLastSession - sessionsPerPage;
  const currentSessions = filteredSessions.slice(
    indexOfFirstSession,
    indexOfLastSession
  );
  const totalPages = Math.ceil(filteredSessions.length / sessionsPerPage);

  const handleJoinSession = async (sessionId) => {
    try {
      if (!elderDetails?.elder_id) {
        alert('Elder details not found');
        return;
      }

      const response = await joinSession(elderDetails.elder_id, sessionId);
      
      if (response.data.success) {
        // Redirect to the meeting link
        window.open(response.data.meetingLink, '_blank');
      } else {
        alert(response.data.error || 'Failed to join session');
      }
    } catch (err) {
      console.error('Error joining session:', err);
      alert('Failed to join session. Please try again.');
    }
  };

  const clearFilters = () => {
    setActiveFilter("all");
    setSearchTerm("");
    setDateFilter("");
    setTypeFilter("all");
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusBadgeClass = (status, dateTime) => {
    const sessionDate = new Date(dateTime);
    const now = new Date();
    
    // Return actual database status
    switch (status) {
      case 'confirmed':
        return styles.statusConfirmed;
      case 'completed':
        return styles.statusCompleted;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return styles.statusUpcoming;
    }
  };

  const getStatusText = (status, dateTime) => {
    // Return actual database status
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getTimeRemaining = (dateString) => {
    const sessionDate = new Date(dateString);
    const now = new Date();
    const diff = sessionDate - now;

    if (diff <= 0) return { text: "Session has passed", urgent: false };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return { text: `${days} day${days > 1 ? 's' : ''} remaining`, urgent: false };
    } else if (hours > 1) {
      return { text: `${hours} hour${hours > 1 ? 's' : ''} remaining`, urgent: false };
    } else if (hours === 1) {
      return { text: `1 hour ${minutes} min remaining`, urgent: true };
    } else {
      return { text: `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`, urgent: true };
    }
  };

  const isUpcomingSession = (session) => {
    const sessionDate = new Date(session.date_time);
    const now = new Date();
    return sessionDate > now && session.status !== 'cancelled';
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.contentContainer}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading sessions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.contentContainer}>
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>❌</div>
            <h2>Error Loading Sessions</h2>
            <p>{error}</p>
            <button 
              className={styles.retryBtn}
              onClick={() => window.location.reload()}
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentContainer}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <button 
              className={styles.backBtn}
              onClick={() => navigate('/elder/dashboard')}
            >
              ← Back to Dashboard
            </button>
            <div className={styles.headerInfo}>
              <h1>My Sessions</h1>
              <p>Manage and view all your counseling sessions</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filtersContainer}>
          <div className={styles.filtersHeader}>
            <h2>Filter Sessions</h2>
            <button className={styles.clearBtn} onClick={clearFilters}>
              Clear All Filters
            </button>
          </div>
          
          <div className={styles.filtersContent}>
            {/* Status Filters */}
            <div className={styles.filtersRow}>
              <div className={styles.filterGroup}>
                <label>Status</label>
                <div className={styles.statusFilters}>
                  {["all", "upcoming", "past", "confirmed", "completed", "cancelled"].map((filter) => (
                    <button
                      key={filter}
                      className={`${styles.filterBtn} ${
                        activeFilter === filter ? styles.activeFilter : ""
                      }`}
                      onClick={() => setActiveFilter(filter)}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Search and Date Filters */}
            <div className={styles.filtersRow}>
              <div className={styles.filterGroup}>
                <label>Search by Counselor or Specialization</label>
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              
              <div className={styles.filterGroup}>
                <label>Date</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className={styles.dateInput}
                />
              </div>
              
              <div className={styles.filterGroup}>
                <label>Session Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className={styles.selectInput}
                >
                  <option value="all">All Types</option>
                  <option value="online">Online</option>
                  <option value="physical">Physical</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className={styles.resultsInfo}>
          <p>
            Showing {currentSessions.length} of {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
            {activeFilter !== "all" && ` (${activeFilter})`}
          </p>
        </div>

        {/* Sessions Grid */}
        {currentSessions.length > 0 ? (
          <div className={styles.sessionsGrid}>
            {currentSessions.map((session) => (
              <div key={session.session_id} className={styles.sessionCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.counselorInfo}>
                    <div className={styles.counselorAvatar}>👨‍⚕️</div>
                    <div className={styles.counselorDetails}>
                      <h3>{session.counselor_name}</h3>
                      <p className={styles.specialization}>{session.specialization}</p>
                      <p className={styles.institution}>{session.current_institution}</p>
                    </div>
                  </div>
                  <div className={styles.statusContainer}>
                    <span className={getStatusBadgeClass(session.status, session.date_time)}>
                      {getStatusText(session.status, session.date_time)}
                    </span>
                  </div>
                </div>

                <div className={styles.sessionDetails}>
                  <div className={styles.sessionMeta}>
                    <div className={styles.dateTimeGroup}>
                      <div className={styles.dateInfo}>
                        <span className={styles.dateText}>{formatDate(session.date_time)}</span>
                      </div>
                      <div className={styles.timeInfo}>
                        <span className={styles.timeText}>{formatTime(session.date_time)}</span>
                      </div>
                    </div>
                    <div className={styles.typeIndicator}>
                      <span className={`${styles.typeChip} ${
                        session.session_type === 'online' 
                          ? styles.onlineChip 
                          : styles.physicalChip
                      }`}>
                        {session.session_type === 'online' ? 'Online' : 'Physical'}
                      </span>
                    </div>
                  </div>
                  
                  {isUpcomingSession(session) && (
                    <div className={styles.timeRemainingBanner}>
                      <div className={`${styles.timeRemainingContent} ${
                        getTimeRemaining(session.date_time).urgent ? styles.urgent : styles.normal
                      }`}>
                        <div className={styles.timeRemainingLabel}>Starts in</div>
                        <div className={styles.timeRemainingValue}>
                          {getTimeRemaining(session.date_time).text}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.cardActions}>
                  {session.session_type === 'online' && isUpcomingSession(session) && (
                    <button
                      className={styles.joinBtn}
                      onClick={() => handleJoinSession(session.session_id)}
                    >
                      🎥 Join Session
                    </button>
                  )}
                  <button 
                    onClick={() => navigate(`/elder/session/${session.session_id}`)}
                    className={styles.detailsBtn}
                  >
                    📋 View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noSessions}>
            <div className={styles.noSessionsIcon}>📅</div>
            <h3>No sessions found</h3>
            <p>
              {filteredSessions.length === 0 && sessions.length === 0
                ? "You don't have any sessions yet."
                : "No sessions match your current filters."}
            </p>
            {filteredSessions.length === 0 && sessions.length > 0 && (
              <button className={styles.clearFiltersBtn} onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.paginationBtn}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>
            
            <div className={styles.paginationNumbers}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`${styles.paginationNumber} ${
                    currentPage === page ? styles.activePage : ""
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              className={styles.paginationBtn}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllSessions;
