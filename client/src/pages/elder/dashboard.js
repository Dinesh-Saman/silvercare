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
            <div className={styles.statsIcon}>📅</div>
            <div className={styles.statsContent}>
              <h3>Caregiver Visits</h3>
              <p className={styles.statsNumber}>
                {statsLoading ? "..." : statsData.assignedCaregivers}
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

      </div>
    </div>
  );
};

export default ElderDashboard;

