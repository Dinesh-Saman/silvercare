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
  const [messages, setMessages] = useState([]);
  const [careRequests, setCareRequests] = useState([]);
  const [carelog, setCarelogCount] = useState([]);
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!user || !user.caregiver_id) return;

    const caregiverId = user.caregiver_id;
    setLoading(true);
    Promise.all([
      caregiverApi.fetchAssignedElders(caregiverId).then((data) => {
        // Only show elders with status 'approved' or 'completed' in recent elders
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
        const transformed = data
          .filter(request => request.status === 'pending')
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
          }));
        setCareRequests(transformed);
      })
    ]).then(() => {
      setMessages([
        { sender: "Dr. Michael Chen", content: "Please update Margaret's blood pressure readings.", timeAgo: "2 hours ago" },
        { sender: "Lisa Thompson (Family)", content: "Did Margaret take her evening medication?", timeAgo: "6 hours ago" }
      ]);
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
          <div className={styles.cardIcon}>💬</div>
          <div className={styles.cardContent}>
            <p className={styles.cardLabel}>Messages</p>
            <span className={styles.cardNumber}>{messages.length}</span>
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
                        if (diffDays > 0) {
                          return (
                            <span className={diffDays <= 7 ? styles.timeLeftRed : styles.timeLeftGreen}>
                              {diffDays} day{diffDays !== 1 ? 's' : ''} left
                            </span>
                          );
                        } else if (diffDays === 0) {
                          return <span className={styles.timeLeftRed}>Starts today</span>;
                        } else {
                          return <span className={styles.timeLeftRed}>Started</span>;
                        }
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
      
      <div className={styles.recentmessages}>
        <h2>Recent Messages</h2>
        <ul>
          {messages.map((msg, i) => (
            <li key={i}>
              <div className={styles.messageAvatar}>
                {msg.sender.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div className={styles.messageContent}>
                <div className={styles.messageSender}>{msg.sender}</div>
                <p className={styles.messageText}>{msg.content}</p>
              </div>
              <span className={styles.messageTime}>{msg.timeAgo}</span>
            </li>
          ))}
        </ul>
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
