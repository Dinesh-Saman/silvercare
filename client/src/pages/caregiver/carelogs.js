// carelogs.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar';
import styles from "../../components/css/caregiver/carelogs.module.css";
import CaregiverLayout from '../../components/CaregiverLayout';
import caregiverApi from '../../services/caregiverApi';
import { useAuth } from '../../context/AuthContext';

const Carelogs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [carelogs, setCarelogs] = useState([]);
  const [elders, setElders] = useState([]);
  const [selectedElder, setSelectedElder] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCarelog, setNewCarelog] = useState({
    elder_id: '',
    notes: '',
    mood: 'good'
  });

  useEffect(() => {
    if (!user || !user.caregiver_id) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const caregiverId = user.caregiver_id;
      
      const [carelogsData, eldersData] = await Promise.all([
        caregiverApi.getCarelogs(caregiverId), // Pass caregiverId parameter
        caregiverApi.fetchAssignedElders(caregiverId, newCarelog)
      ]);
      
      setCarelogs(carelogsData.carelogs || []); // Extract carelogs array from response
      setElders(eldersData.filter(elder => elder.status === 'approved' || elder.status === 'completed'));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCarelog = async (e) => {
    e.preventDefault();
    try {
      await caregiverApi.addCarelog(user.caregiver_id, newCarelog); // Pass caregiverId parameter
      setShowAddModal(false);
      setNewCarelog({ elder_id: '', notes: '', mood: 'good' });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error adding carelog:', error);
      alert('Failed to add carelog. Please try again.');
    }
  };

  const filteredCarelogs = selectedElder === 'all' 
    ? carelogs 
    : carelogs.filter(log => log.elder_id === parseInt(selectedElder));

  const groupedCarelogs = filteredCarelogs.reduce((groups, log) => {
    const elderName = log.elder_name;
    if (!groups[elderName]) {
      groups[elderName] = [];
    }
    groups[elderName].push(log);
    return groups;
  }, {});

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
            <button 
              className={styles.addButton}
              onClick={() => setShowAddModal(true)}
            >
              <span role="img" aria-label="Add">➕</span> Add Carelog
            </button>
          </div>

          <div className={styles.filters}>
            <select 
              value={selectedElder} 
              onChange={(e) => setSelectedElder(e.target.value)}
              className={styles.elderFilter}
            >
              <option value="all">All Elders</option>
              {elders.map(elder => (
                <option key={elder.elder_id} value={elder.elder_id}>
                  {elder.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.carelogsContainer}>
            {Object.keys(groupedCarelogs).length === 0 ? (
              <div className={styles.noCarelogs}>
                <span style={{fontSize: '2.5rem', marginBottom: '12px'}}>📝</span>
                <span style={{color: '#667eea', fontWeight: 600, fontSize: '1.2rem'}}>No Care Logs</span>
                <span style={{color: '#718096', fontSize: '1rem', marginTop: '8px'}}>Start documenting care activities by adding your first carelog.</span>
              </div>
            ) : (
              Object.entries(groupedCarelogs).map(([elderName, logs]) => (
                <div key={elderName} className={styles.elderSection}>
                  <div className={styles.elderHeader}>
                    <span className={styles.elderAvatar}>
                      {elderName.split(' ').map(n => n[0]).join('')}
                    </span>
                    <div className={styles.elderInfo}>
                      <h3>{elderName}</h3>
                      <span className={styles.logCount}>{logs.length} log{logs.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  
                  <div className={styles.logsList}>
                    {logs.map(log => (
                      <div key={log.carelog_id} className={styles.logCard}>
                        <div className={styles.logHeader}>
                          <span className={styles.logDate}>
                            {new Date(log.date_logged).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className={`${styles.moodBadge} ${styles[log.mood]}`}>
                            {log.mood === 'good' && '😊'} 
                            {log.mood === 'neutral' && '😐'} 
                            {log.mood === 'bad' && '😞'} 
                            {log.mood}
                          </span>
                        </div>
                        <div className={styles.logNotes}>
                          {log.notes}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Carelog Modal */}
          {showAddModal && (
            <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
              <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h2>Add New Carelog</h2>
                  <button 
                    className={styles.closeButton}
                    onClick={() => setShowAddModal(false)}
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={handleAddCarelog} className={styles.modalForm}>
                  <div className={styles.formGroup}>
                    <label>Elder</label>
                    <select 
                      value={newCarelog.elder_id}
                      onChange={(e) => setNewCarelog({...newCarelog, elder_id: e.target.value})}
                      required
                    >
                      <option value="">Select Elder</option>
                      {elders.map(elder => (
                        <option key={elder.elder_id} value={elder.elder_id}>
                          {elder.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Mood</label>
                    <select 
                      value={newCarelog.mood}
                      onChange={(e) => setNewCarelog({...newCarelog, mood: e.target.value})}
                    >
                      <option value="good">😊 Good</option>
                      <option value="neutral">😐 Neutral</option>
                      <option value="bad">😞 Bad</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Notes</label>
                    <textarea 
                      value={newCarelog.notes}
                      onChange={(e) => setNewCarelog({...newCarelog, notes: e.target.value})}
                      placeholder="Describe the care activities, observations, or any important notes..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className={styles.modalActions}>
                    <button 
                      type="button" 
                      onClick={() => setShowAddModal(false)}
                      className={styles.cancelButton}
                    >
                      Cancel
                    </button>
                    <button type="submit" className={styles.submitButton}>
                      Add Carelog
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

export default Carelogs;
