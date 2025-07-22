import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/navbar';
import styles from "../../components/css/caregiver/elder.module.css";
import CaregiverLayout from '../../components/CaregiverLayout';
import caregiverApi from '../../services/caregiverApi2';
import { useAuth } from '../../context/AuthContext';

const ElderPage = () => {
  const params = useParams();
  const { elderId } = params;
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [elder, setElder] = useState(null);
  const [familyMember, setFamilyMember] = useState(null);
  const [carelogs, setCarelogs] = useState([]);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterMonthDropdown, setFilterMonthDropdown] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [newReport, setNewReport] = useState({
    notes: '',
    mood: 'good',
    health_status: '',
    medications_given: '',
    activities: '',
    concerns: ''
  });

  // Comprehensive debug logging
  console.log('=== ElderPage Debug Information ===');
  console.log('All URL params:', params);
  console.log('Extracted elderId:', elderId);
  console.log('Location object:', location);
  console.log('Current pathname:', location.pathname);
  console.log('Current search:', location.search);
  console.log('Current hash:', location.hash);
  console.log('Full URL:', window.location.href);
  console.log('User object:', user);
  console.log('================================');

  useEffect(() => {
    console.log('useEffect triggered with:', { user, elderId, caregiver_id: user?.caregiver_id });
    
    if (!user || !user.caregiver_id || !elderId) {
      console.log('Early return from useEffect - missing data:', { 
        hasUser: !!user, 
        hasCaregiverId: !!user?.caregiver_id, 
        hasElderId: !!elderId 
      });
      return;
    }
    
    console.log('Calling fetchElderData with elderId:', elderId);
    fetchElderData();
  }, [user, elderId]);

  const fetchElderData = async () => {
    try {
      setLoading(true);
      const caregiverId = user.caregiver_id;
      
      console.log('Fetching elder data for elderId:', elderId, 'caregiverId:', caregiverId);
      
      const [elderData, carelogsData] = await Promise.all([
        caregiverApi.getElderDetails(elderId),
        caregiverApi.getElderCarelogs(caregiverId, elderId)
      ]);
      
      console.log('Elder data received:', elderData);
      console.log('Carelogs data received:', carelogsData);
      
      setElder(elderData.elder);
      setFamilyMember(elderData.familyMember);
      setCarelogs(carelogsData.carelogs || []);
    } catch (error) {
      console.error('Error fetching elder data:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReport = async (e) => {
    e.preventDefault();
    try {
      await caregiverApi.addElderReport(user.caregiver_id, elderId, newReport);
      setShowReportModal(false);
      setNewReport({
        notes: '',
        mood: 'good',
        health_status: '',
        medications_given: '',
        activities: '',
        concerns: ''
      });
      fetchElderData(); // Refresh data
    } catch (error) {
      console.error('Error adding report:', error);
      alert('Failed to add report. Please try again.');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <CaregiverLayout>
          <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 60, height: 60, border: '6px solid #e2e8f0', borderTop: '6px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 24 }} />
            <p style={{ color: '#667eea', fontSize: 20, fontWeight: 500 }}>Loading elder details...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        </CaregiverLayout>
      </>
    );
  }

  if (!elder) {
    return (
      <>
        <Navbar />
        <CaregiverLayout>
          <div className={styles.errorContainer}>
            <h2>Elder not found</h2>
            <div style={{margin: '20px 0', padding: '20px', background: '#f7fafc', borderRadius: '8px'}}>
              <h3>Debug Information:</h3>
              <p><strong>Elder ID from URL:</strong> {elderId || 'undefined'}</p>
              <p><strong>User object:</strong> {user ? 'Present' : 'Missing'}</p>
              <p><strong>User caregiver_id:</strong> {user?.caregiver_id || 'undefined'}</p>
              <p><strong>Loading state:</strong> {loading ? 'true' : 'false'}</p>
            </div>
            <button onClick={() => navigate('/caregiver/dashboard')} className={styles.backButton}>
              Back to Dashboard
            </button>
          </div>
        </CaregiverLayout>
      </>
    );
  }

  // Helper: get months January-December (no year)
  const getMonthsList = () => {
    return [
      { label: 'January', value: '01' },
      { label: 'February', value: '02' },
      { label: 'March', value: '03' },
      { label: 'April', value: '04' },
      { label: 'May', value: '05' },
      { label: 'June', value: '06' },
      { label: 'July', value: '07' },
      { label: 'August', value: '08' },
      { label: 'September', value: '09' },
      { label: 'October', value: '10' },
      { label: 'November', value: '11' },
      { label: 'December', value: '12' },
    ];
  };

  // Use dropdown if selected, else use input value (month only)
  const effectiveMonth = filterMonthDropdown || filterMonth;
  const effectiveYear = filterYear;

  // Filter carelogs by month (all years) or by month+year, and date
  const filteredCarelogs = carelogs.filter(report => {
    const reportDate = new Date(report.date);
    let match = true;
    if (effectiveMonth) {
      // effectiveMonth is in format 'MM'
      const month = effectiveMonth.length === 2 ? effectiveMonth : effectiveMonth.slice(5, 7); // support input type="month" as well
      match = match && String(reportDate.getMonth() + 1).padStart(2, '0') === month;
      if (effectiveYear) {
        match = match && reportDate.getFullYear() === Number(effectiveYear);
      }
    }
    if (filterDate) {
      // filterDate is in format 'YYYY-MM-DD'
      const filter = new Date(filterDate);
      match = match && reportDate.toDateString() === filter.toDateString();
    }
    return match;
  });

  return (
    <>
      <Navbar />
      <CaregiverLayout>
        <div className={styles.elderPage}>
          <div className={styles.header}>
            <button onClick={() => navigate('/caregiver/dashboard')} className={styles.backButton}>
              ← Back to Dashboard
            </button>
            <h1>Elder Care Management</h1>
            <button 
              className={styles.addReportButton}
              onClick={() => setShowReportModal(true)}
            >
              📝 Add Daily Report
            </button>
          </div>

          <div className={styles.contentGrid}>
            {/* Elder Details Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>👴</span>
                <h2>Elder Information</h2>
              </div>
              <div className={styles.elderProfile}>
                <div className={styles.elderAvatar}>
                  {elder.profile_photo ? (
                    <img src={elder.profile_photo} alt={elder.name} />
                  ) : (
                    <span>{elder.name.split(' ').map(n => n[0]).join('')}</span>
                  )}
                </div>
                <div className={styles.elderInfo}>
                  <h3>{elder.name}</h3>
                  <p className={styles.inlineInfo}>
                    <span>{elder.age} years old</span>
                    <span>•</span>
                    <span>{elder.gender}</span>
                  </p>
                  <div className={styles.elderDetails}>
                    <div className={styles.detail}>
                      <span className={styles.label}>Contact:</span>
                      <span className={styles.value}>{elder.contact}</span>
                    </div>
                    <div className={styles.detail}>
                      <span className={styles.label}>Email:</span>
                      <span className={styles.value}>{elder.email || 'Not provided'}</span>
                    </div>
                    <div className={styles.detail}>
                      <span className={styles.label}>Address:</span>
                      <span className={styles.value}>{elder.address}</span>
                    </div>
                    <div className={styles.detail}>
                      <span className={styles.label}>District:</span>
                      <span className={styles.value}>{elder.district}</span>
                    </div>
                    <div className={styles.detail}>
                      <span className={styles.label}>NIC:</span>
                      <span className={styles.value}>{elder.nic}</span>
                    </div>
                    <div className={styles.detail}>
                      <span className={styles.label}>Medical Conditions:</span>
                      <span className={styles.value}>{elder.medical_conditions || 'None specified'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Family Contact Card */}
            {familyMember && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}>👨‍👩‍👧‍👦</span>
                  <h2>Family Contact</h2>
                </div>
                <div className={styles.familyInfo}>
                  <div className={styles.detail}>
                    <span className={styles.label}>Name:</span>
                    <span className={styles.value}>{familyMember.name}</span>
                  </div>
                  <div className={styles.detail}>
                    <span className={styles.label}>Phone:</span>
                    <span className={styles.value}>
                      <a href={`tel:${familyMember.phone}`}>{familyMember.phone}</a>
                    </span>
                  </div>
                  <div className={styles.detail}>
                    <span className={styles.label}>Email:</span>
                    <span className={styles.value}>
                      <a href={`mailto:${familyMember.email}`}>{familyMember.email}</a>
                    </span>
                  </div>
                  <div className={styles.detail}>
                    <span className={styles.label}>Fixed Line:</span>
                    <span className={styles.value}>
                      {familyMember.phone_fixed ? 
                        <a href={`tel:${familyMember.phone_fixed}`}>{familyMember.phone_fixed}</a> : 
                        'Not provided'
                      }
                    </span>
                  </div>
                  <div className={styles.detail}>
                    <span className={styles.label}>Address:</span>
                    <span className={styles.value}>{familyMember.address || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Daily Reports Section */}
          <div className={styles.reportsSection}>
            <div className={styles.sectionHeader}>
              <h2>Daily Care Reports</h2>
              <span className={styles.reportCount}>{filteredCarelogs.length} reports</span>
            </div>

            {/* Filter Controls */}
            <div className={styles.filterControls}>
              <div className={styles.filterGroup}>
                <label>Filter by Month:</label>
                <select
                  className={styles.filterSelect}
                  value={filterMonthDropdown}
                  onChange={e => {
                    setFilterMonthDropdown(e.target.value);
                    setFilterMonth(''); // clear manual input if dropdown used
                  }}
                >
                  <option value="">-- Select Month --</option>
                  {getMonthsList().map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              
              <div className={styles.filterGroup}>
                <label>Year (optional):</label>
                <input
                  type="number"
                  className={styles.filterInput}
                  placeholder="e.g. 2025"
                  min="1900"
                  max="2100"
                  value={filterYear === '1989' ? '' : filterYear}
                  autoComplete="off"
                  onChange={e => setFilterYear(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                />
              </div>
              <div className={styles.filterGroup}>
                <label>Filter by Date:</label>
                <input
                  type="date"
                  className={styles.filterInput}
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                />
              </div>
              <button
                type="button"
                className={styles.clearFilterBtn}
                onClick={() => { setFilterMonth(''); setFilterMonthDropdown(''); setFilterYear(''); setFilterDate(''); }}
              >
                Clear Filters
              </button>
            </div>

            <div className={styles.reportsList}>
              {filteredCarelogs.length === 0 ? (
                <div className={styles.noReports}>
                  <span style={{fontSize: '2.5rem', marginBottom: '12px'}}>📋</span>
                  <span style={{color: '#667eea', fontWeight: 600, fontSize: '1.2rem'}}>No Reports Yet</span>
                  <span style={{color: '#718096', fontSize: '1rem', marginTop: '8px'}}>Start documenting daily care by adding your first report.</span>
                </div>
              ) : (
                filteredCarelogs.map(report => (
                  <div key={report.carelog_id} className={styles.reportCard}>
                    <div className={styles.reportHeader}>
                      <span className={styles.reportDate}>
                        {new Date(report.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <span className={`${styles.moodBadge} ${styles[report.mood]}`}>
                        {report.mood === 'good' && '😊'} 
                        {report.mood === 'neutral' && '😐'} 
                        {report.mood === 'bad' && '😞'} 
                        {report.mood}
                      </span>
                    </div>
                    <div className={styles.reportContent}>
                      <div className={styles.reportField}>
                        <strong>General Notes:</strong>
                        <p>{report.notes}</p>
                      </div>
                      {report.health_status && (
                        <div className={styles.reportField}>
                          <strong>Health Status:</strong>
                          <p>{report.health_status}</p>
                        </div>
                      )}
                      {report.medications_given && (
                        <div className={styles.reportField}>
                          <strong>Medications Given:</strong>
                          <p>{report.medications_given}</p>
                        </div>
                      )}
                      {report.activities && (
                        <div className={styles.reportField}>
                          <strong>Activities:</strong>
                          <p>{report.activities}</p>
                        </div>
                      )}
                      {report.concerns && (
                        <div className={styles.reportField}>
                          <strong>Concerns:</strong>
                          <p>{report.concerns}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Report Modal */}
          {showReportModal && (
            <div className={styles.modalOverlay} onClick={() => setShowReportModal(false)}>
              <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h2>Add Daily Report for {elder.name}</h2>
                  <button 
                    className={styles.closeButton}
                    onClick={() => setShowReportModal(false)}
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={handleAddReport} className={styles.modalForm}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Elder's Mood</label>
                      <select 
                        value={newReport.mood}
                        onChange={(e) => setNewReport({...newReport, mood: e.target.value})}
                      >
                        <option value="good">😊 Good</option>
                        <option value="neutral">😐 Neutral</option>
                        <option value="bad">😞 Bad</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>General Care Notes *</label>
                    <textarea 
                      value={newReport.notes}
                      onChange={(e) => setNewReport({...newReport, notes: e.target.value})}
                      placeholder="Describe the daily care activities, observations, and general notes..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Health Status</label>
                    <textarea 
                      value={newReport.health_status}
                      onChange={(e) => setNewReport({...newReport, health_status: e.target.value})}
                      placeholder="Note any health observations, vital signs, appetite, sleep patterns..."
                      rows={2}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Medications Given</label>
                    <textarea 
                      value={newReport.medications_given}
                      onChange={(e) => setNewReport({...newReport, medications_given: e.target.value})}
                      placeholder="List medications administered, times, and any reactions..."
                      rows={2}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Activities & Exercise</label>
                    <textarea 
                      value={newReport.activities}
                      onChange={(e) => setNewReport({...newReport, activities: e.target.value})}
                      placeholder="Physical activities, exercises, social interactions, hobbies..."
                      rows={2}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Concerns or Issues</label>
                    <textarea 
                      value={newReport.concerns}
                      onChange={(e) => setNewReport({...newReport, concerns: e.target.value})}
                      placeholder="Any concerns, incidents, or issues that need family attention..."
                      rows={2}
                    />
                  </div>

                  <div className={styles.modalActions}>
                    <button 
                      type="button" 
                      onClick={() => setShowReportModal(false)}
                      className={styles.cancelButton}
                    >
                      Cancel
                    </button>
                    <button type="submit" className={styles.submitButton}>
                      Submit Report
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </CaregiverLayout>
    </>
  );
};

export default ElderPage;