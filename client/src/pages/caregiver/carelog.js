import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar';
import styles from "../../components/css/caregiver/carelogs.module.css";

import CaregiverLayout from '../../components/CaregiverLayout';
import caregiverApi from '../../services/caregiverApi2';
import { useAuth } from '../../context/AuthContext';
import DailyCareReportModal from '../../components/DailyCareReportModal.js';

const Carelogs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [carelogs, setCarelogs] = useState([]);
  const [elders, setElders] = useState([]);
  const [selectedElder, setSelectedElder] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('all');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedCarelog, setSelectedCarelog] = useState(null);

  useEffect(() => {
    if (!user || !user.caregiver_id) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const caregiverId = user.caregiver_id;
      const [carelogsData, eldersData] = await Promise.all([
        caregiverApi.getCarelogs(caregiverId),
        caregiverApi.fetchAssignedElders(caregiverId)
      ]);
      setCarelogs(carelogsData.carelogs || []);
      setElders(eldersData.filter(elder => elder.status === 'approved' || elder.status === 'completed'));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Filtering logic ---
  const filteredCarelogs = selectedElder === 'all'
    ? carelogs
    : carelogs.filter(log => log.elder_id === parseInt(selectedElder));

  // Get all unique dates for the selected elder
  const uniqueDates = Array.from(new Set(filteredCarelogs.map(log => log.date_logged))).sort((a, b) => new Date(a) - new Date(b));

  const dateFilteredCarelogs = selectedDate === 'all'
    ? filteredCarelogs
    : filteredCarelogs.filter(log => log.date_logged === selectedDate);

  // --- Date box grid like dashboard daily report section ---
  // Group by date for grid display
  const groupedByDate = {};
  dateFilteredCarelogs.forEach(log => {
    const date = log.date_logged;
    if (!groupedByDate[date]) groupedByDate[date] = [];
    groupedByDate[date].push(log);
  });

  if (loading) {
    return (
      <>
        <Navbar />
        <CaregiverLayout>
          <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 60, height: 60, border: '6px solid #e2e8f0', borderTop: '6px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 24 }} />
            <p style={{ color: '#667eea', fontSize: 20, fontWeight: 500 }}>Loading carelogs...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        </CaregiverLayout>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <CaregiverLayout>
        <div className={styles.carelogsPage}>
          <div className={styles.header}>
            <h1 style={{display: 'flex', alignItems: 'center', gap: 10}}>
              <span role="img" aria-label="Carelogs">📝</span> Care Logs
            </h1>
          </div>
          <div className={styles.filters}>
            <select
              value={selectedElder}
              onChange={e => {
                setSelectedElder(e.target.value);
                setSelectedDate('all');
              }}
              className={styles.elderFilter}
            >
              <option value="all">All Elders</option>
              {elders.map(elder => (
                <option key={elder.elder_id} value={elder.elder_id}>{elder.name}</option>
              ))}
            </select>
            <select
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className={styles.elderFilter}
              style={{minWidth: 160}}
              disabled={uniqueDates.length === 0}
            >
              <option value="all">All Dates</option>
              {uniqueDates.map(date => (
                <option key={date} value={date}>{new Date(date).toLocaleDateString()}</option>
              ))}
            </select>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '16px', margin: '20px 0'}}>
            {uniqueDates.length === 0 ? (
              <div className={styles.noCarelogs} style={{gridColumn: 'span 7'}}>
                <span style={{fontSize: '2.5rem', marginBottom: '12px'}}>📝</span>
                <span style={{color: '#667eea', fontWeight: 600, fontSize: '1.2rem'}}>No Care Logs</span>
                <span style={{color: '#718096', fontSize: '1rem', marginTop: '8px'}}>No carelogs found for the selected filters.</span>
              </div>
            ) : (
              uniqueDates
                .filter(date => selectedDate === 'all' || date === selectedDate)
                .map(date => {
                  const logs = groupedByDate[date] || [];
                  const dayDate = new Date(date);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  dayDate.setHours(0, 0, 0, 0);
                  const isPast = dayDate < today;
                  const isToday = dayDate.getTime() === today.getTime();
                  return (
                    <div
                      key={date}
                      className={styles.reportDayBox}
                      onClick={() => {
                        setSelectedCarelog({
                          ...logs[0],
                          isReadOnly: isPast
                        });
                        setShowReportModal(true);
                      }}
                      style={{
                        background: isToday ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' : '#ffffff',
                        border: isToday ? '3px solid #10b981' : '2px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '20px 16px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        minHeight: '140px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        position: 'relative',
                        boxShadow: isToday ? '0 4px 16px rgba(16, 185, 129, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      {isToday && (
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          fontSize: '10px',
                          fontWeight: 600,
                          padding: '4px 8px',
                          borderRadius: '12px'
                        }}>
                          TODAY
                        </div>
                      )}
                      <div style={{fontSize: '14px', fontWeight: 600, color: '#4a5568', marginBottom: '8px', textTransform: 'uppercase'}}>
                        {dayDate.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div style={{fontSize: '28px', fontWeight: 700, color: isToday ? '#065f46' : '#2d3748', marginBottom: '12px'}}>
                        {dayDate.getDate()}
                      </div>
                      <div style={{fontSize: '12px', color: '#718096', marginBottom: '12px', fontWeight: 500, lineHeight: '1.3'}}>
                        {logs[0]?.elder_name}
                      </div>
                      <div style={{fontSize: '11px', fontWeight: 600, color: '#065f46', backgroundColor: '#d1fae5', padding: '6px 12px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px', border: '1px solid #10b981', display: 'flex', alignItems: 'center', gap: '4px'}}>
                        Uploaded
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
        {/* Popup Modal for Carelog (read-only for past dates) */}
        <DailyCareReportModal
          isOpen={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setSelectedCarelog(null);
          }}
          elderName={selectedCarelog?.elder_name}
          reportDate={selectedCarelog?.date_logged}
          existingReport={selectedCarelog}
          isReadOnly={selectedCarelog?.isReadOnly || false}
          isCarelogMode={true}
        />
      </CaregiverLayout>
    </>
  );
};

export default Carelogs;
