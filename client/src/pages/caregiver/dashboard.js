// dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar';
import styles from "../../components/css/caregiver/dashboard.module.css";
import CaregiverLayout from '../../components/CaregiverLayout';
import caregiverApi from '../../services/caregiverApi2';
import { useAuth } from '../../context/AuthContext';


const CaregiverDashboard = () => {
  const { user } = useAuth(); // <-- pulls from logged-in context
  const navigate = useNavigate();
  const [elders, setElders] = useState([]);
  const [careRequests, setCareRequests] = useState([]);
  const [carelog, setCarelogCount] = useState([]);
  const [completedShifts, setCompletedShifts] = useState(0);
  const [totalHoursWorked, setTotalHoursWorked] = useState(0);
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

        // Count completed shifts
        const completedCount = Array.isArray(data)
          ? data.filter(request => request.status === 'completed').length
          : 0;
        setCompletedShifts(completedCount);

        // Calculate total hours worked
        let totalHours = 0;
        if (Array.isArray(data)) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          data.forEach(request => {
            if (request.status === 'completed') {
              // duration is in days, multiply by 24
              const days = Number(request.duration);
              if (!isNaN(days)) {
                totalHours += days * 24;
                console.log(`Completed request ${request.request_id}: days=${days}, hours=${days * 24}`);
              } else if (request.start_date && request.end_date) {
                // fallback: calculate days from dates
                const start = new Date(request.start_date);
                const end = new Date(request.end_date);
                const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
                totalHours += diffDays * 24;
                console.log(`Completed request ${request.request_id}: days=${diffDays}, hours=${diffDays * 24} (from dates)`);
              }
            } else if (request.status === 'approved') {
              // calculate hours from start_date to day before today (inclusive)
              if (request.start_date) {
                const start = new Date(request.start_date);
                start.setHours(0, 0, 0, 0);
                let end = new Date(today);
                end.setDate(end.getDate() - 1); // day before today
                end.setHours(0, 0, 0, 0);
                if (end >= start) {
                  // Calculate days inclusive
                  const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
                  const diffHours = diffDays * 24;
                  totalHours += diffHours > 0 ? diffHours : 0;
                  console.log(`Approved request ${request.request_id}: days=${diffDays}, hours=${diffHours}`);
                }
              }
            }
          });
        }
        setTotalHoursWorked(totalHours);

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
        console.log('Upcoming shifts raw data:', data);
        console.log('First shift details:', data[0]);
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
  // Backend already filters for approved shifts, just check date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  console.log('Today date for filtering:', today);
  console.log('All upcoming shifts before filtering:', upcomingShifts);
  
  const filteredUpcomingShifts = upcomingShifts.filter(shift => {
    const start = new Date(shift.date || shift.start_date);
    start.setHours(0, 0, 0, 0);
    console.log('Shift details:', shift);
    console.log('Shift date:', shift.date || shift.start_date);
    console.log('Parsed start date:', start);
    console.log('Date comparison (start >= today):', start >= today);
    const passes = start >= today;
    console.log('Overall filter result:', passes);
    return passes;
  });
  
  console.log('Filtered upcoming shifts:', filteredUpcomingShifts);

  const dashboardContent = (
    <div className={styles.dashboard}>
      <div className={styles.summarycards}>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <span role="img" aria-label="Elders">👥</span>
          </div>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Elders</span>
            <span className={styles.cardNumber}>{filteredElders.length}</span>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)'}}>
            <span role="img" aria-label="Families">👨‍👩‍👧‍👦</span>
          </div>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Families</span>
            <span className={styles.cardNumber}>{families.length}</span>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{background: 'linear-gradient(135deg, #ffb347 0%, #ffcc33 100%)'}}>
            <span role="img" aria-label="Carelogs">📝</span>
          </div>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Carelogs</span>
            <span className={styles.cardNumber}>{carelog}</span>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <span role="img" aria-label="Upcoming">📅</span>
          </div>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Upcoming Shifts</span>
            <span className={styles.cardNumber}>{filteredUpcomingShifts.length}</span>
          </div>
        </div>
      </div>

      <div className={styles.dashboardgrid}>
        <section className={styles.carerequest}>
          <h2 style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <span role="img" aria-label="Care Requests">📝</span> Care Requests
          </h2>
          <div className={styles.careRequestsList}>
            {careRequests.length === 0 ? (
              <div className={styles.noCareRequests} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', background: 'linear-gradient(135deg, #f8fafc 0%, #eef2fa 100%)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(102,126,234,0.08)'}}>
                <span style={{fontSize: '2.5rem', marginBottom: '12px'}}>📝</span>
                <span style={{color: '#667eea', fontWeight: 600, fontSize: '1.2rem'}}>No Care Requests</span>
                <span style={{color: '#718096', fontSize: '1rem', marginTop: '8px'}}>You're all caught up! New care requests will appear here.</span>
              </div>
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
          <h2 style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <span role="img" aria-label="Upcoming Shifts">📅</span> Upcoming Shifts
          </h2>
          <div className={styles.shiftsList}>
            {filteredUpcomingShifts.length === 0 ? (
              <div className={styles.noShifts} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', background: 'linear-gradient(135deg, #f8fafc 0%, #eef2fa 100%)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(102,126,234,0.08)'}}>
                <span style={{fontSize: '2.5rem', marginBottom: '12px'}}>📅</span>
                <span style={{color: '#718096', fontSize: '1rem', marginTop: '8px'}}>You have no upcoming shifts scheduled. Enjoy your free time!</span>
              </div>
            ) : (
              filteredUpcomingShifts.map((shift, i) => {
                const start = new Date(shift.date || shift.start_date);
                const now = new Date();
                const diffMs = start - now;
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                let colorClass = diffDays > 2 ? styles.timeLeftGreen : styles.timeLeftRed;
                if (diffMs <= 0) colorClass = styles.timeLeftRed;
                return (
                  <div className={styles.shiftCard} key={i}>
                    <div className={styles.shiftHeader}>
                      <span className={styles.shiftDate}>
                        {start.toLocaleDateString()} - {shift.end_date ? new Date(shift.end_date).toLocaleDateString() : 'TBD'}
                      </span>
                      <span className={styles.shiftTime}>{shift.duration}</span>
                    </div>
                    <div className={styles.shiftDetails}>
                      <span className={styles.label}>Location:</span>
                      <span className={styles.value}>{shift.location || shift.address}</span>
                    </div>
                    <div className={styles.shiftDetails}>
                      <span className={styles.label}>Elder:</span>
                      <span className={styles.value}>{shift.elderName || 'N/A'}</span>
                    </div>
                    <div className={styles.shiftDetails}>
                      <span className={styles.label}>Time Left:</span>
                      <span className={colorClass}>
                        {diffMs > 0
                          ? `${diffDays} day${diffDays !== 1 ? 's' : ''} ${diffHours} hour${diffHours !== 1 ? 's' : ''}`
                          : 'Started'}
                      </span>
                    </div>
                    <div className={styles.careRequestActions}>
                      <button 
                        className={styles.viewMoreButton}
                        onClick={() => navigate(`/caregiver/care-request/${shift.request_id}`)}
                      >
                        View More Details
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className={styles.performanceStats}>
          <h2 style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <span role="img" aria-label="Performance">🏆</span> Performance Stats
          </h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.cardIcon} style={{background: 'linear-gradient(135deg, #38a169 0%, #43cea2 100%)', marginBottom: 10}}>
                <span role="img" aria-label="Completed">✅</span>
              </div>
              <span className={styles.statLabel}>Completed Shifts</span>
              <span className={styles.statValue}>{completedShifts}</span>
            </div>
            <div className={styles.statCard}>
              <div className={styles.cardIcon} style={{background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)', marginBottom: 10}}>
                <span role="img" aria-label="Hours">⏱️</span>
              </div>
              <span className={styles.statLabel}>Total Hours Worked</span>
              <span className={styles.statValue}>{totalHoursWorked}</span>
            </div>
          </div>
        </section>

      </div>

      <div className={styles.recentelders}>
        <h2 style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <span role="img" aria-label="Recent Elders">👴</span> Recent Elders
        </h2>
        <div className={styles.elderlist}>
          {elders.filter(e => e.status === 'approved' || e.status === 'completed').length === 0 ? (
            <div className={styles.noElders} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', background: 'linear-gradient(135deg, #f8fafc 0%, #eef2fa 100%)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(102,126,234,0.08)'}}>
              <span style={{fontSize: '2.5rem', marginBottom: '12px'}}>👴</span>
              <span style={{color: '#667eea', fontWeight: 600, fontSize: '1.2rem'}}>No Elders Assigned</span>
              <span style={{color: '#718096', fontSize: '1rem', marginTop: '8px'}}>You haven't been assigned any elders yet. Stay tuned for updates!</span>
            </div>
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

      <section className={styles.quickLinks} style={{borderRadius: '18px', boxShadow: '0 4px 16px rgba(102,126,234,0.10)', margin: '32px 0', padding: '32px 24px'}}>                      <h2 style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.35rem', color: '#2b4c7e', fontWeight: 700, marginBottom: 18}}>
          <span role="img" aria-label="Quick Links" style={{fontSize: '2rem'}}>🚀</span> Quick Actions
        </h2>
        <div className={styles.linksGrid} style={{gap: '28px'}}>
          <button className={styles.quickLinkBtn} style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', fontSize: '1.1rem', fontWeight: 600, padding: '18px 0', borderRadius: '12px', boxShadow: '0 2px 12px rgba(102,126,234,0.12)', display: 'flex', alignItems: 'center', gap: '12px'}} onClick={() => navigate('/caregiver/profile')}>
            <span style={{fontSize: '1.5rem'}}>👤</span> Update Profile
          </button>
          <button className={styles.quickLinkBtn} style={{background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)', color: '#fff', fontSize: '1.1rem', fontWeight: 600, padding: '18px 0', borderRadius: '12px', boxShadow: '0 2px 12px rgba(67,206,162,0.12)', display: 'flex', alignItems: 'center', gap: '12px'}} onClick={() => navigate('/caregiver/care-requests')}>
            <span style={{fontSize: '1.5rem'}}>📅</span> View Requests
          </button>
          <button className={styles.quickLinkBtn} style={{background: 'linear-gradient(135deg, #ffb347 0%, #ffcc33 100%)', color: '#2d3748', fontSize: '1.1rem', fontWeight: 600, padding: '18px 0', borderRadius: '12px', boxShadow: '0 2px 12px rgba(255,179,71,0.12)', display: 'flex', alignItems: 'center', gap: '12px'}} onClick={() => navigate('/caregiver/carelog')}>
            <span style={{fontSize: '1.5rem'}}>📝</span> View Carelogs
          </button>
        </div>
      </section>
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
