import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar";
import {
  getElderDetailsByEmail,
  getElderDashboardStats,
  getUpcomingAppointments,
  getPastAppointments,
  joinAppointment,
  getUpcomingSessions,
  getPastSessions,
  joinSession,
  getCareAssignmentsByWeek,
  getDayCareAssignments,
  getCareAssignmentStats,
} from "../../services/elderApi2";
import styles from "../../components/css/elder/dashboard.module.css";

const ElderDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [elderDetails, setElderDetails] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [activeSessionTab, setActiveSessionTab] = useState("upcoming");
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // Caregiver section state
  const [careAssignments, setCareAssignments] = useState({
    dailyAssignments: [],
    weekStart: null,
    weekEnd: null,
  });
  const [currentWeekStart, setCurrentWeekStart] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayAssignments, setSelectedDayAssignments] = useState([]);
  const [careStatsData, setCareStatsData] = useState({
    thisWeekAssignments: 0,
    activeAssignments: 0,
    assignedCaregivers: 0,
    pendingRequests: 0,
  });
  const [careAssignmentsLoading, setCareAssignmentsLoading] = useState(false);

  // Real stats data from backend
  const [statsData, setStatsData] = useState({
    upcomingAppointments: 0,
    upcomingSessions: 0,
    upcomingCampaigns: 0,
    assignedCaregivers: 0,
  });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Initialize current week start
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    setCurrentWeekStart(weekStart);
  }, []);

  useEffect(() => {
    const fetchElderDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getElderDetailsByEmail(currentUser.email);
        setElderDetails(response.data);

        // Fetch appointments, sessions, and stats after getting elder details
        if (response.data?.elder_id) {
          await Promise.all([
            fetchAppointments(response.data.elder_id),
            fetchSessions(response.data.elder_id),
            fetchDashboardStats(response.data.elder_id),
            fetchCareAssignments(response.data.elder_id),
            fetchCareStats(response.data.elder_id),
          ]);
        }
      } catch (error) {
        console.error("Error fetching elder details:", error);
        setError(
          error.response?.data?.error || "Failed to fetch elder details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.email) {
      fetchElderDetails();
    }
  }, [currentUser.email]);

  const fetchDashboardStats = async (elderId) => {
    try {
      setStatsLoading(true);
      console.log("Fetching dashboard stats for elder:", elderId);

      const response = await getElderDashboardStats(elderId);
      console.log("Dashboard stats response:", response.data);

      if (response.data.success) {
        setStatsData(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Keep default values if stats fetch fails
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchAppointments = async (elderId) => {
    try {
      setAppointmentsLoading(true);

      // Fetch only 2 appointments for dashboard display
      const [upcomingResponse, pastResponse] = await Promise.all([
        getUpcomingAppointments(elderId, { params: { limit: 2 } }),
        getPastAppointments(elderId, { params: { limit: 2 } }),
      ]);

      setUpcomingAppointments(upcomingResponse.data.appointments || []);
      setPastAppointments(pastResponse.data.appointments || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const fetchSessions = async (elderId) => {
    try {
      setSessionsLoading(true);

      // Fetch only 2 sessions for dashboard display
      const [upcomingResponse, pastResponse] = await Promise.all([
        getUpcomingSessions(elderId, { params: { limit: 2 } }),
        getPastSessions(elderId, { params: { limit: 2 } }),
      ]);

      setUpcomingSessions(upcomingResponse.data.sessions || []);
      setPastSessions(pastResponse.data.sessions || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setSessionsLoading(false);
    }
  };

  const fetchCareAssignments = async (elderId, weekStart = null) => {
    try {
      setCareAssignmentsLoading(true);
      
      console.log('Fetching care assignments for elder:', elderId);
      
      // If no week start provided, use current week
      if (!weekStart) {
        const today = new Date();
        weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        setCurrentWeekStart(weekStart);
      }

      console.log('Week start:', weekStart?.toISOString().split('T')[0]);
      const response = await getCareAssignmentsByWeek(elderId, weekStart?.toISOString().split('T')[0]);
      
      console.log('Care assignments response:', response.data);
      
      if (response.data.success) {
        setCareAssignments(response.data);
        console.log('Set care assignments:', response.data);
      }
    } catch (error) {
      console.error("Error fetching care assignments:", error);
    } finally {
      setCareAssignmentsLoading(false);
    }
  };

  const fetchCareStats = async (elderId) => {
    try {
      console.log('Fetching care stats for elder:', elderId);
      const response = await getCareAssignmentStats(elderId);
      
      console.log('Care stats response:', response.data);
      
      if (response.data.success) {
        setCareStatsData(response.data.stats);
        console.log('Set care stats:', response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching care stats:", error);
    }
  };

  const fetchDayAssignments = async (elderId, date) => {
    try {
      const response = await getDayCareAssignments(elderId, date);
      
      if (response.data.success) {
        setSelectedDayAssignments(response.data.assignments);
        setSelectedDate(date);
      }
    } catch (error) {
      console.error("Error fetching day assignments:", error);
    }
  };

  const handleJoinAppointment = async (appointmentId) => {
    try {
      const response = await joinAppointment(elderDetails.elder_id, appointmentId);
      if (response.data.success) {
        // Open meeting link in new tab
        window.open(response.data.meetingLink, '_blank');
      }
    } catch (error) {
      console.error("Error joining appointment:", error);
      alert(error.response?.data?.error || "Failed to join appointment");
    }
  };

  const handleJoinSession = async (sessionId) => {
    try {
      const response = await joinSession(elderDetails.elder_id, sessionId);
      if (response.data.success) {
        // Open meeting link in new tab
        window.open(response.data.meetingUrl, '_blank');
      }
    } catch (error) {
      console.error("Error joining session:", error);
      alert(error.response?.data?.error || "Failed to join session");
    }
  };

  const handleViewProfile = () => {
    navigate("/elder/profile");
  };

  const handleShowAllAppointments = () => {
    // For now, navigate to an empty page as requested
    navigate("/elder/appointments");
  };

  const handleShowAllSessions = () => {
    // Navigate to sessions page
    navigate("/elder/sessions");
  };

  const handlePreviousWeek = () => {
    if (elderDetails?.elder_id && currentWeekStart) {
      const prevWeek = new Date(currentWeekStart);
      prevWeek.setDate(currentWeekStart.getDate() - 7);
      setCurrentWeekStart(prevWeek);
      fetchCareAssignments(elderDetails.elder_id, prevWeek);
    }
  };

  const handleNextWeek = () => {
    if (elderDetails?.elder_id && currentWeekStart) {
      const nextWeek = new Date(currentWeekStart);
      nextWeek.setDate(currentWeekStart.getDate() + 7);
      setCurrentWeekStart(nextWeek);
      fetchCareAssignments(elderDetails.elder_id, nextWeek);
    }
  };

  const handleDateClick = (date, assignments) => {
    setSelectedDate(date);
    setSelectedDayAssignments(assignments);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeRemaining = (dateString) => {
    if (!dateString) return { text: "N/A", urgent: false, detail: "" };
    const now = new Date();
    const appointmentDate = new Date(dateString);
    const diffTime = appointmentDate - now;

    if (diffTime < 0) return { text: "Past due", urgent: false, detail: "" };

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 7) return { text: `${diffDays} days`, urgent: false, detail: "More than a week away" };
    if (diffDays > 1) return { text: `${diffDays} days`, urgent: false, detail: `${diffHours} hours remaining` };
    if (diffHours > 2) return { text: `${diffHours} hours`, urgent: true, detail: "Today" };
    if (diffHours > 0) return { text: `${diffHours}h ${diffMinutes % 60}m`, urgent: true, detail: "Very soon!" };
    if (diffMinutes > 0) return { text: `${diffMinutes} minutes`, urgent: true, detail: "Starting soon!" };
    return { text: "Now", urgent: true, detail: "Time to join!" };
  };

  const isUpcomingAppointment = (appointment) => {
    return new Date(appointment.date_time) > new Date() && appointment.status !== "cancelled";
  };

  const isUpcomingSession = (session) => {
    return new Date(session.date_time) > new Date() && session.status !== "cancelled";
  };

  const getAge = (dob) => {
    if (!dob) return "N/A";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatMemberSince = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const renderAppointmentCard = (appointment) => (
    <div key={appointment.appointment_id} className={styles.appointmentCard}>
      <div className={styles.cardHeader}>
        <div className={styles.doctorInfo}>
          <div className={styles.doctorAvatar}>👨‍⚕️</div>
          <div className={styles.doctorDetails}>
            <h3>Dr. {appointment.doctor_name}</h3>
            <p className={styles.specialization}>{appointment.specialization}</p>
            <p className={styles.institution}>{appointment.current_institution}</p>
          </div>
        </div>
        <div className={styles.statusContainer}>
          <span className={
            appointment.status === "cancelled"
              ? styles.statusCompleted
              : appointment.status === "completed"
              ? styles.statusCompleted
              : styles.statusUpcoming
          }>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </span>
        </div>
      </div>

      <div className={styles.appointmentDetails}>
        <div className={styles.appointmentMeta}>
          <div className={styles.dateTimeGroup}>
            <div className={styles.dateInfo}>
              <span className={styles.dateText}>{formatDate(appointment.date_time)}</span>
            </div>
            <div className={styles.timeInfo}>
              <span className={styles.timeText}>{formatTime(appointment.date_time)}</span>
            </div>
          </div>
          <div className={styles.typeIndicator}>
            <span className={`${styles.typeChip} ${
              appointment.appointment_type === 'online' 
                ? styles.onlineChip 
                : styles.physicalChip
            }`}>
              {appointment.appointment_type === 'online' ? 'Online' : 'Physical'}
            </span>
          </div>
        </div>
        
        {isUpcomingAppointment(appointment) && (
          <div className={styles.timeRemainingBanner}>
            <div className={`${styles.timeRemainingContent} ${
              getTimeRemaining(appointment.date_time).urgent ? styles.urgent : styles.normal
            }`}>
              <div className={styles.timeRemainingLabel}>Starts in</div>
              <div className={styles.timeRemainingValue}>
                {getTimeRemaining(appointment.date_time).text}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.cardActions}>
        {appointment.appointment_type === 'online' && isUpcomingAppointment(appointment) && (
          <button
            className={styles.joinBtn}
            onClick={() => handleJoinAppointment(appointment.appointment_id)}
          >
            🎥 Join Meeting
          </button>
        )}
        <button 
          onClick={() => navigate(`/elder/appointment/${appointment.appointment_id}`)}
          className={styles.detailsBtn}
        >
          📋 View Details
        </button>
      </div>
    </div>
  );

  const renderSessionCard = (session) => (
    <div key={session.session_id} className={styles.appointmentCard}>
      <div className={styles.cardHeader}>
        <div className={styles.doctorInfo}>
          <div className={styles.doctorAvatar}>👨‍💼</div>
          <div className={styles.doctorDetails}>
            <h3>{session.counselor_name}</h3>
            <p className={styles.specialization}>{session.specialization}</p>
            <p className={styles.institution}>{session.current_institution}</p>
          </div>
        </div>
        <div className={styles.statusContainer}>
          <span className={
            session.status === "cancelled"
              ? styles.statusCancelled
              : session.status === "completed"
              ? styles.statusCompleted
              : session.status === "confirmed"
              ? styles.statusConfirmed
              : styles.statusUpcoming
          }>
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </span>
        </div>
      </div>

      <div className={styles.appointmentDetails}>
        <div className={styles.appointmentMeta}>
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
  );

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <Navbar />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboardContainer}>
        <Navbar />
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={styles.retryBtn}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <Navbar />

      <div className={styles.dashboardContent}>
        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statsCard}>
            <div className={styles.statsIcon}>🩺</div>
            <div className={styles.statsContent}>
              <h3>Upcoming Appointments</h3>
              <p className={styles.statsNumber}>
                {statsLoading ? "..." : statsData.upcomingAppointments}
              </p>
            </div>
          </div>

          <div className={styles.statsCard}>
            <div className={styles.statsIcon}>🧠</div>
            <div className={styles.statsContent}>
              <h3>Upcoming Sessions</h3>
              <p className={styles.statsNumber}>
                {statsLoading ? "..." : statsData.upcomingSessions}
              </p>
            </div>
          </div>

          <div className={styles.statsCard}>
            <div className={styles.statsIcon}>📢</div>
            <div className={styles.statsContent}>
              <h3>Upcoming Activities</h3>
              <p className={styles.statsNumber}>
                {statsLoading ? "..." : statsData.upcomingCampaigns}
              </p>
            </div>
          </div>

          <div className={styles.statsCard}>
            <div className={styles.statsIcon}>�‍⚕️</div>
            <div className={styles.statsContent}>
              <h3>Assigned Caregivers</h3>
              <p className={styles.statsNumber}>
                {statsLoading ? "..." : careStatsData.assignedCaregivers}
              </p>
            </div>
          </div>
        </div>

        {/* Profile and Family Cards Container */}
        <div className={styles.profileFamilyContainer}>
          {/* Profile Summary Card */}
          <div className={styles.profileSummaryCard}>
            <div className={styles.profileSummaryContent}>
              <div className={styles.profileImageSection}>
                {elderDetails?.profile_photo ? (
                  <img
                    src={`http://localhost:5000/uploads/profiles/${elderDetails.profile_photo}`}
                    alt="Profile"
                    className={styles.profileImage}
                  />
                ) : (
                  <div className={styles.profilePlaceholder}>
                    <span>{elderDetails?.name?.charAt(0) || "E"}</span>
                  </div>
                )}
                <div className={styles.statusIndicator}></div>
              </div>

              <div className={styles.profileInfo}>
                <h2>Welcome {elderDetails?.name}</h2>
                <div className={styles.profileMeta}>
                  <span className={styles.age}>
                    Age: {getAge(elderDetails?.dob)}
                  </span>
                  <span className={styles.gender}>{elderDetails?.gender}</span>
                </div>
                <div className={styles.memberSince}>
                  Member since {formatMemberSince(elderDetails?.created_at)}
                </div>
              </div>
            </div>
          </div>

                    {/* Family Member Card */}
          {elderDetails?.family_member && (
            <div className={styles.familyMemberCard}>
              <div className={styles.familyMemberHeader}>
                <div className={styles.familyIcon}>👨‍👩‍👧‍👦</div>
                <div>
                  <h3>Your Family Contact</h3>
                  <p>Always here to help you</p>
                </div>
              </div>
              <div className={styles.familyMemberInfo}>
                <div className={styles.familyDetail}>
                  <strong>{elderDetails.family_member.name}</strong>
                </div>
                <div className={styles.familyActions}>
                  <button className={styles.callBtn}>📞</button>
                  <button className={styles.messageBtn}>💬</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Appointments Section */}
        <div className={styles.appointmentsSection}>
          <div className={styles.appointmentsHeader}>
            <h2>Your Appointments</h2>
            <div className={styles.appointmentTabs}>
              <button
                className={`${styles.tabBtn} ${
                  activeTab === "upcoming" ? styles.activeTab : ""
                }`}
                onClick={() => setActiveTab("upcoming")}
              >
                Upcoming
              </button>
              <button
                className={`${styles.tabBtn} ${
                  activeTab === "past" ? styles.activeTab : ""
                }`}
                onClick={() => setActiveTab("past")}
              >
                Past
              </button>
            </div>
          </div>

          <div className={styles.appointmentsContent}>
            {appointmentsLoading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading appointments...</p>
              </div>
            ) : (
              <div className={styles.appointmentsGrid}>
                {activeTab === "upcoming" ? (
                  upcomingAppointments.length > 0 ? (
                    upcomingAppointments.map(renderAppointmentCard)
                  ) : (
                    <div className={styles.noAppointments}>
                      <div className={styles.noAppointmentsIcon}>📅</div>
                      <h3>No Upcoming Appointments</h3>
                      <p>
                        You don't have any upcoming appointments scheduled. Book
                        a new appointment to get started.
                      </p>
                    </div>
                  )
                ) : pastAppointments.length > 0 ? (
                  pastAppointments.map(renderAppointmentCard)
                ) : (
                  <div className={styles.noAppointments}>
                    <div className={styles.noAppointmentsIcon}>📋</div>
                    <h3>No Past Appointments</h3>
                    <p>
                      You haven't had any appointments yet. Your appointment
                      history will appear here.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Show All Button */}
            <div className={styles.showAllContainer}>
              <button 
                className={styles.showAllBtn}
                onClick={handleShowAllAppointments}
              >
                Show All Appointments
              </button>
            </div>
          </div>
        </div>

        {/* Sessions Section */}
        <div className={styles.appointmentsSection}>
          <div className={styles.appointmentsHeader}>
            <h2>Your Counselling Sessions</h2>
            <div className={styles.appointmentTabs}>
              <button
                className={`${styles.tabBtn} ${
                  activeSessionTab === "upcoming" ? styles.activeTab : ""
                }`}
                onClick={() => setActiveSessionTab("upcoming")}
              >
                Upcoming
              </button>
              <button
                className={`${styles.tabBtn} ${
                  activeSessionTab === "past" ? styles.activeTab : ""
                }`}
                onClick={() => setActiveSessionTab("past")}
              >
                Past
              </button>
            </div>
          </div>

          <div className={styles.appointmentsContent}>
            {sessionsLoading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading sessions...</p>
              </div>
            ) : (
              <div className={styles.appointmentsGrid}>
                {activeSessionTab === "upcoming" ? (
                  upcomingSessions.length > 0 ? (
                    upcomingSessions.map(renderSessionCard)
                  ) : (
                    <div className={styles.noAppointments}>
                      <div className={styles.noAppointmentsIcon}>🧠</div>
                      <h3>No Upcoming Sessions</h3>
                      <p>
                        You don't have any upcoming counselling sessions scheduled. Book
                        a new session to get started.
                      </p>
                    </div>
                  )
                ) : pastSessions.length > 0 ? (
                  pastSessions.map(renderSessionCard)
                ) : (
                  <div className={styles.noAppointments}>
                    <div className={styles.noAppointmentsIcon}>📋</div>
                    <h3>No Past Sessions</h3>
                    <p>
                      You haven't had any counselling sessions yet. Your session
                      history will appear here.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Show All Button */}
            <div className={styles.showAllContainer}>
              <button 
                className={styles.showAllBtn}
                onClick={handleShowAllSessions}
              >
                Show All Sessions
              </button>
            </div>
          </div>
        </div>

        {/* Caregiver Section */}
        <div className={styles.appointmentsSection}>
          <div className={styles.appointmentsHeader}>
            <h2>Your Care Assignments</h2>
            <div className={styles.weekNavigation}>
              <button 
                className={styles.weekNavBtn}
                onClick={handlePreviousWeek}
                disabled={careAssignmentsLoading}
              >
                ← Previous Week
              </button>
              <span className={styles.currentWeek}>
                {currentWeekStart ? (
                  `Week of ${currentWeekStart.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}`
                ) : 'Current Week'}
              </span>
              <button 
                className={styles.weekNavBtn}
                onClick={handleNextWeek}
                disabled={careAssignmentsLoading}
              >
                Next Week →
              </button>
            </div>
          </div>

          {careAssignmentsLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading care assignments...</p>
            </div>
          ) : (
            <div>
              {/* Weekly Calendar */}
              <div className={styles.weeklyCalendar}>
                {careAssignments.dailyAssignments?.map((day) => (
                  <div 
                    key={day.date}
                    className={`${styles.dayCard} ${day.isToday ? styles.todayCard : ''} ${
                      day.assignments.length > 0 ? styles.hasAssignments : ''
                    }`}
                    onClick={() => handleDateClick(day.date, day.assignments)}
                  >
                    <div className={styles.dayHeader}>
                      <span className={styles.dayName}>{day.dayName}</span>
                      <span className={styles.dayDate}>
                        {new Date(day.date).getDate()}
                      </span>
                    </div>
                    <div className={styles.dayContent}>
                      {day.assignments.length > 0 ? (
                        <div className={styles.assignmentPreview}>
                          <div className={styles.caregiverIndicator}>
                            👨‍⚕️ {day.assignments.length} Caregiver{day.assignments.length > 1 ? 's' : ''}
                          </div>
                          <div className={styles.caregiverName}>
                            {day.assignments[0].caregiver_name}
                            {day.assignments.length > 1 && ` +${day.assignments.length - 1} more`}
                          </div>
                        </div>
                      ) : (
                        <div className={styles.noAssignment}>
                          <span className={styles.noAssignmentText}>No caregiver assigned</span>
                        </div>
                      )}
                    </div>
                    {day.isToday && <div className={styles.todayIndicator}>Today</div>}
                  </div>
                ))}
              </div>

              {/* Selected Day Details */}
              {selectedDate && selectedDayAssignments && (
                <div className={styles.selectedDayDetails}>
                  <h3 className={styles.selectedDayTitle}>
                    Care Details for {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                  
                  {selectedDayAssignments.length > 0 ? (
                    <div className={styles.assignmentsList}>
                      {selectedDayAssignments.map((assignment) => (
                        <div key={assignment.request_id} className={styles.assignmentCard}>
                          <div className={styles.assignmentHeader}>
                            <div className={styles.caregiverInfo}>
                              <div className={styles.caregiverAvatar}>👨‍⚕️</div>
                              <div className={styles.caregiverDetails}>
                                <h4>{assignment.caregiver_name}</h4>
                                <p className={styles.caregiverCertifications}>
                                  {assignment.certifications}
                                </p>
                                <p className={styles.caregiverContact}>
                                  📞 {assignment.caregiver_phone}
                                  {assignment.caregiver_fixed_line && (
                                    <span> | 🏠 {assignment.caregiver_fixed_line}</span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className={styles.assignmentStatus}>
                              <span className={
                                assignment.status === 'approved' 
                                  ? styles.statusApproved 
                                  : styles.statusCompleted
                              }>
                                {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          
                          <div className={styles.assignmentPeriod}>
                            <div className={styles.periodInfo}>
                              <span className={styles.periodLabel}>Care Period:</span>
                              <span className={styles.periodDates}>
                                {formatDate(assignment.start_date)} - {formatDate(assignment.end_date)}
                              </span>
                            </div>
                            {assignment.duration && (
                              <div className={styles.durationInfo}>
                                <span className={styles.durationLabel}>Duration:</span>
                                <span className={styles.durationValue}>{assignment.duration} days</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.noAssignments}>
                      <div className={styles.noAssignmentsIcon}>🏠</div>
                      <h3>No Caregiver Assigned</h3>
                      <p>You don't have any caregiver assignments for this date.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ElderDashboard;

