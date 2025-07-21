// dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar';
import styles from "../../components/css/caregiver/dashboard.module.css";
import CaregiverLayout from '../../components/CaregiverLayout';
import caregiverApi from '../../services/caregiverApi';
import { useAuth } from '../../context/AuthContext';


const CaregiverDashboard = () => {
  const { user } = useAuth(); // <-- pulls from logged-in context
  const navigate = useNavigate();
  const [elders, setElders] = useState([]);
  const [careRequests, setCareRequests] = useState([]);
  const [carelog, setCarelogCount] = useState([]);
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  // Upcoming shifts fetched from backend
  const [upcomingShifts, setUpcomingShifts] = useState([]);

  // Helper to show time left in days/hours/minutes
  const getTimeLeft = (startDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const diffMs = start - now;
    if (diffMs <= 0) return 'Started';
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    let result = '';
    if (diffDays > 0) result += `${diffDays} day${diffDays > 1 ? 's' : ''} `;
    if (diffHours > 0) result += `${diffHours} hour${diffHours > 1 ? 's' : ''} `;
    if (diffMinutes > 0 && diffDays === 0) result += `${diffMinutes} min${diffMinutes > 1 ? 's' : ''}`;
    return result.trim();
  };


  useEffect(() => {
    if (!user || !user.caregiver_id) return;
    const caregiverId = user.caregiver_id;
    setLoading(true);
    Promise.all([
      caregiverApi.fetchAssignedElders(caregiverId).then((data) => {
        const transformed = data.map((elder) => ({
          name: elder.name,
          age: elder.age,
          duration: elder.duration || "N/A",
          status: elder.status,
          family_id: elder.family_id,
        }));
        setElders(transformed);
      }),
      caregiverApi.getAssignedFamiliesCount(caregiverId).then((data) => {
        const count = Number(data.count);
        if (!isNaN(count)) {
          const dummyFamilies = Array.from({ length: count }, (_, i) => ({
            elder: `Family ${i + 1}`
          }));
          setFamilies(dummyFamilies);
        } else {
          setFamilies([]);
        }
      }),
      caregiverApi.getcarelogsCount(caregiverId).then((data) => {
        const count = Number(data.count);
        if (!isNaN(count)) {
          setCarelogCount(count);
        } else {
          setCarelogCount(0);
        }
      }).catch(error => {
        setCarelogCount(0);
      }),
      caregiverApi.fetchCareRequests(caregiverId).then((data) => {
        // Get all family IDs from carerequest table for this caregiver, status approved or completed
        const allFamilyIds = Array.isArray(data)
          ? data.filter(request => request.status === 'approved' || request.status === 'completed')
              .map(request => request.family_id)
              .filter(Boolean)
          : [];
        // Get unique family IDs
        const uniqueFamilyIdsFromRequests = Array.from(new Set(allFamilyIds));
        setFamilies(uniqueFamilyIdsFromRequests);

        // Keep your existing careRequests logic
        const transformed = Array.isArray(data)
          ? data.filter(request => request.status === 'pending')
            .map((request) => ({
              requestId: request.request_id,
              elderName: request.elder_name,
              elderAge: request.elder_age,
              elderAddress: request.elder_address,
              elderContact: request.elder_contact,
              medicalConditions: request.medical_conditions,
              familyMemberName: request.family_member_name,
              familyMemberPhone: request.family_member_phone,
              familyMemberEmail: request.family_member_email,
              startDate: request.start_date,
              endDate: request.end_date,
              status: request.status,
              duration: request.duration,
              requestDate: request.request_date
            }))
          : [];
        setCareRequests(transformed);
      }),
      caregiverApi.fetchUpcomingShifts(caregiverId).then((data) => {
        setUpcomingShifts(data);
        console.log('Upcoming shifts:', data);
      })
      
    ]).then(() => {
      setLoading(false);
    });
  }, []);

  // Loading spinner
  if (loading) {
    return (
      <>
        <Navbar />
        <CaregiverLayout>
          <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 60, height: 60, border: '6px solid #e2e8f0', borderTop: '6px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 24 }} />
            <p style={{ color: '#667eea', fontSize: 20, fontWeight: 500 }}>Loading dashboard...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        </CaregiverLayout>
      </>
    );
  }

  // Filter elders with status 'approved' or 'completed'
  const filteredElders = elders.filter(e => e.status === 'approved' || e.status === 'completed');
  // Get unique family IDs from filtered elders
  const uniqueFamilyIds = Array.from(new Set(filteredElders.map(e => e.family_id))).filter(Boolean);

  // Filtered upcoming shifts for summary card
  const filteredUpcomingShifts = upcomingShifts.filter(shift => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(shift.date);
    start.setHours(0, 0, 0, 0);
    return shift.status === 'approved' && start >= today;
  });

  const dashboardContent = (
    <div className={styles.dashboard}>
      <div className={styles.summarycards}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>👥</div>
          <div className={styles.cardContent}>
            <p className={styles.cardLabel}>Total Elders</p>
            <span className={styles.cardNumber}>{filteredElders.length}</span>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>👨‍👩‍👧‍👦</div>
          <div className={styles.cardContent}>
            <p className={styles.cardLabel}>Total Families</p>
            <span className={styles.cardNumber}>{families.length}</span>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>📝</div> 
          <div className={styles.cardContent}>
            <p className={styles.cardLabel}>Total Carelogs</p> 
            <span className={styles.cardNumber}>{carelog}</span> 
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>📅</div>
          <div className={styles.cardContent}>
            <p className={styles.cardLabel}>Upcoming Shifts</p>
            <span className={styles.cardNumber}>{filteredUpcomingShifts.length}</span>
          </div>
        </div>
      </div>

      <div className={styles.dashboardgrid}>
        <section className={styles.carerequest}>
          <h2>Care Requests</h2>
          <div className={styles.careRequestsList}>
            {careRequests.length === 0 ? (
              <div className={styles.noCareRequests}>No care requests available.</div>
            ) : (
              careRequests.map((request, i) => (
                <div className={styles.careRequestCard} key={i}>
                  <div className={styles.careRequestHeader}>
                    <div className={styles.requestInfo}>
                      <h3 className={styles.elderName}>{request.elderName}</h3>
                    </div>
                    <div className={`${styles.statusBadge} ${styles[request.status]}`}>
                      {request.status}
                    </div>
                  </div>
                  <div className={styles.careRequestDetails}>
                    <div className={styles.requestDetail}>
                      <span className={styles.label}>Elder Age:</span>
                      <span className={styles.value}>{request.elderAge} years</span>
                    </div>
                    <div className={styles.requestDetail}>
                      <span className={styles.label}>Duration:</span>
                      <span className={styles.value}>
                        {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className={styles.requestDetail}>
                      <span className={styles.label}>Location:</span>
                      <span className={styles.value}>{request.elderAddress}</span>
                    </div>
                    <div className={styles.requestDetail}>
                      <span className={styles.label}>Family Contact:</span>
                      <span className={styles.value}>{request.familyMemberName}</span>
                    </div>
                  </div>
                  <div className={styles.requestDetail}>
                    <span className={styles.label}>Time Left:</span>
                    {(() => {
                      const now = new Date();
                      const start = new Date(request.startDate);
                      const diffMs = start - now;
                      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                      let colorClass = diffDays > 2 ? styles.timeLeftGreen : styles.timeLeftRed;
                      if (diffMs <= 0) colorClass = styles.timeLeftRed;
                      return (
                        <span className={colorClass}>
                          {getTimeLeft(request.startDate)}
                        </span>
                      );
                    })()}
                  </div>
                  <div className={styles.careRequestActions}>
                    <button 
                      className={styles.viewMoreButton}
                      onClick={() => navigate(`/caregiver/care-request/${request.requestId}`)}
                    >
                      View More Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
        
        <section className={styles.upcomingShifts}>
          <h2>Upcoming Shifts</h2>
          <div className={styles.shiftsList}>
            {upcomingShifts.length === 0 ? (
              <div className={styles.noShifts}>No upcoming shifts scheduled.</div>
            ) : (
              upcomingShifts
                .filter(shift => {
                  // Only show status 'approved' and start date >= today
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const start = new Date(shift.date);
                  start.setHours(0, 0, 0, 0);
                  
                  console.log('Filtering shift:', {
                    requestId: shift.requestId,
                    status: shift.status,
                    startDate: shift.date,
                    startDateFormatted: start,
                    today: today,
                    statusMatch: shift.status === 'approved',
                    dateMatch: start >= today,
                    finalResult: shift.status === 'approved' && start >= today
                  });
                  
                  return shift.status === 'approved' && start >= today;
                })
                .map((shift, i) => (
                  <div className={styles.shiftCard} key={i}>
                    <div className={styles.shiftHeader}>
                      <span className={styles.shiftDate}>{new Date(shift.date).toLocaleDateString()}</span>
                      <span className={styles.shiftTime}>{shift.duration || ''}</span>
                    </div>
                    {/* Optionally show elder name */}
                    {shift.elderName && (
                      <div className={styles.shiftDetails}>
                        <span className={styles.label}>Elder:</span>
                        <span className={styles.value}>{shift.elderName}</span>
                      </div>
                    )}
                    <div className={styles.shiftDetails}>
                      <span className={styles.label}>Location:</span>
                      <span className={styles.value}>{shift.address}</span>
                    </div>
                    {/* Time Left indicator below, green if >2 days, red if <=2 days */}
                    <div className={styles.shiftDetails} style={{ marginTop: 8 }}>
                      <span className={styles.label}>Time Left:</span>
                      {(() => {
                        const now = new Date();
                        const start = new Date(shift.date);
                        const diffMs = start - now;
                        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                        let colorClass = diffDays > 2 ? styles.timeLeftGreen : styles.timeLeftRed;
                        if (diffMs <= 0) colorClass = styles.timeLeftRed;
                        return (
                          <span className={colorClass}>
                            {getTimeLeft(shift.date)}
                          </span>
                        );
                      })()}
                    </div>
                    <div className={styles.careRequestActions}>
                      <button 
                        className={styles.viewMoreButton}
                        onClick={() => navigate(`/caregiver/care-request/${shift.requestId}`)}
                      >
                        View More Details
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </section>

        <section className={styles.performanceStats}>
          <h2>Performance Stats</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Completed Shifts</span>
              <span className={styles.statValue}>{user?.completedShifts || 0}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Care Requests Fulfilled</span>
              <span className={styles.statValue}>{user?.fulfilledRequests || 0}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Average Rating</span>
              <span className={styles.statValue}>{user?.averageRating ? user.averageRating.toFixed(1) : 'N/A'}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total Hours Worked</span>
              <span className={styles.statValue}>{user?.totalHours || 0}</span>
            </div>
          </div>
        </section>

        <section className={styles.quickLinks}>
          <h2>Quick Links / Actions</h2>
          <div className={styles.linksGrid}>
            <button className={styles.quickLinkBtn} onClick={() => navigate('/caregiver/request-time-off')}>
              🕒 Request Time Off
            </button>
            <button className={styles.quickLinkBtn} onClick={() => navigate('/caregiver/update-profile')}>
              👤 Update Profile
            </button>
            <button className={styles.quickLinkBtn} onClick={() => navigate('/caregiver/schedule')}>
              📅 View Schedule
            </button>
            <button className={styles.quickLinkBtn} onClick={() => navigate('/caregiver/carelogs')}>
              📝 View Carelogs
            </button>
          </div>
        </section>
      </div>

      <div className={styles.recentelders}>
        <h2>Recent Elders</h2>
        <div className={styles.elderlist}>
          {elders.filter(e => e.status === 'approved' || e.status === 'completed').length === 0 ? (
            <p className={styles.noElders}>No elders assigned yet.</p>
          ) : (
            elders.filter(e => e.status === 'approved' || e.status === 'completed').map((elder, i) => (
              <div className={styles.eldercard} key={i}>
                <div className={styles.elderHeader}>
                  <div className={styles.elderAvatar}>
                    {elder.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className={styles.elderInfo}>
                    <h4>{elder.name}</h4>
                    <div className={styles.elderAge}>{elder.age} years old</div>
                  </div>
                </div>
                <div className={styles.elderDetails}>
                  <div className={styles.elderDetail}>
                    <span className={styles.label}>Duration :</span>
                    <span className={styles.value}>{elder.duration}</span>
                  </div>
                  <div className={styles.elderDetail}>
                    <span className={styles.label}>Status :</span>
                      <span className={`${styles.value} ${
                        elder.status === 'completed' ? styles.completedStatus :
                        elder.status === 'approved' ? styles.approvedStatus : ''
                      }`}>
                        {elder.status}
                      </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <CaregiverLayout>
        {dashboardContent}
      </CaregiverLayout>
    </>
  );
};

export default CaregiverDashboard;
