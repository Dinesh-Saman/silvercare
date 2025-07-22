import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import caregiverApi from '../../services/caregiverApi2';
import Navbar from '../../components/navbar';
import styles from "../../components/css/caregiver/viewAllElders.module.css";
import CaregiverLayout from '../../components/CaregiverLayout';

const ViewAllElders = () => {
  const { currentUser } = useAuth();
  const [elders, setElders] = useState([]);
  const [filteredElders, setFilteredElders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchElders = async () => {
      try {
        setLoading(true);
        setError(null);
        const caregiverId = currentUser?.caregiver_id || currentUser?.id || currentUser?.user_id;
        if (!caregiverId) {
          setError('Caregiver ID not found.');
          setLoading(false);
          return;
        }
        const data = await caregiverApi.fetchAssignedElders(caregiverId);
        
        // Filter to only show confirmed and completed elders
        const filteredData = data.filter(elder => 
          elder.status && (
            elder.status.toLowerCase() === 'confirmed' || 
            elder.status.toLowerCase() === 'completed'
          )
        );
        
        setElders(filteredData);
        setFilteredElders(filteredData);
      } catch (err) {
        setError('Failed to fetch elders.');
      } finally {
        setLoading(false);
      }
    };
    fetchElders();
  }, [currentUser]);

  // Filter elders based on search term and status
  useEffect(() => {
    let filtered = elders;

    // Filter by search term (name or age)
    if (searchTerm && searchTerm.trim()) {
      filtered = filtered.filter(elder =>
        elder.name && elder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        elder.age && elder.age.toString().includes(searchTerm)
      );
    }

    // Filter by status
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(elder =>
        elder.status && elder.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredElders(filtered);
  }, [searchTerm, statusFilter, elders]);

  const handleElderClick = (elder) => {
    navigate(`/caregiver/elder/${elder.elder_id}`);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  const handleStatCardClick = (filterType) => {
    console.log('Stat card clicked:', filterType);
    setStatusFilter(filterType);
    // Clear search term when clicking stat cards for better user experience
    setSearchTerm('');
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return styles.statusConfirmed;
      case 'completed':
        return styles.statusCompleted;
      default:
        return styles.statusPending;
    }
  };

  const getUniqueStatuses = () => {
    const statuses = elders.map(elder => elder.status).filter(status => status); // Filter out null/undefined
    const uniqueStatuses = [...new Set(statuses)];
    // Only return confirmed and completed statuses since we filter for these
    return uniqueStatuses.filter(status => 
      status && (
        status.toLowerCase() === 'confirmed' || 
        status.toLowerCase() === 'completed'
      )
    );
  };

  const getStats = () => {
    const confirmedCount = elders.filter(e => e.status.toLowerCase() === 'confirmed').length;
    const completedCount = elders.filter(e => e.status.toLowerCase() === 'completed').length;
    
    return {
      total: elders.length, // Only confirmed and completed elders
      confirmed: confirmedCount, // Will show 0 if no confirmed elders
      completed: completedCount, // Will show 0 if no completed elders
    };
  };

  const handleBack = () => {
    navigate('/caregiver/dashboard');
  };

  const stats = getStats();

  if (error) {
    return (
      <>
        <Navbar />
        <CaregiverLayout>
          <div className={styles.error}>
            <p>{error}</p>
            <button className={styles.backButton} onClick={handleBack}>
              ← Back to Dashboard
            </button>
          </div>
        </CaregiverLayout>
      </>
    );
  }
  return (
    <>
      <Navbar />
      <CaregiverLayout>
        <div className={styles.container}>
            <button className={styles.backButton} onClick={handleBack}>
                ← Back to Dashboard
            </button>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.title}>
              Assigned Elders 
              {statusFilter === 'all' && ' (All Statuses)'}
              {statusFilter === 'confirmed' && ' (Confirmed Only)'}
              {statusFilter === 'completed' && ' (Completed Only)'}
            </h1>
          </div>

          {/* Filter Section */}
          <div className={styles.filterSection}>
            <input
              type="text"
              placeholder="Search by name or age..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                console.log('Dropdown changed to:', e.target.value);
                setStatusFilter(e.target.value);
              }}
              className={styles.filterSelect}
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
            </select>
            <button onClick={handleClearFilters} className={styles.clearButton}>
              Clear Filters
            </button>
          </div>

          {/* Statistics Bar */}
          <div className={styles.statsBar}>
            <div 
              className={`${styles.statCard} ${statusFilter === 'all' ? styles.statCardActive : ''}`}
              onClick={() => handleStatCardClick('all')}
              style={{ cursor: 'pointer' }}
            >
              <p className={styles.statNumber}>{stats.total}</p>
              <p className={styles.statLabel}>Total Elders</p>
            </div>
            <div 
              className={`${styles.statCard} ${statusFilter === 'confirmed' ? styles.statCardActive : ''}`}
              onClick={() => handleStatCardClick('confirmed')}
              style={{ cursor: 'pointer' }}
            >
              <p className={styles.statNumber}>{stats.confirmed}</p>
              <p className={styles.statLabel}>Confirmed</p>
            </div>
            <div 
              className={`${styles.statCard} ${statusFilter === 'completed' ? styles.statCardActive : ''}`}
              onClick={() => handleStatCardClick('completed')}
              style={{ cursor: 'pointer' }}
            >
              <p className={styles.statNumber}>{stats.completed}</p>
              <p className={styles.statLabel}>Completed</p>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className={styles.loadingMessage}>
              <div className={styles.loadingSpinner}></div>
              Loading elders...
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className={styles.errorMessage}>
              ❌ {error}
            </div>
          )}

          {/* No Data State */}
          {!loading && !error && filteredElders.length === 0 && elders.length === 0 && (
            <div className={styles.noDataMessage}>
              📋 No confirmed or completed elders assigned yet.
            </div>
          )}

          {/* No Results State */}
          {!loading && !error && filteredElders.length === 0 && elders.length > 0 && (
            <div className={styles.noDataMessage}>
              🔍 No elders match your search criteria.
            </div>
          )}

          {/* Elders Grid */}
          {!loading && !error && filteredElders.length > 0 && (
            <div className={styles.eldersGrid}>
              {filteredElders.map((elder) => (
                <div key={elder.elder_id} className={styles.elderCard}>
                  <div className={styles.elderHeader}>
                    <h3 className={styles.elderName}>{elder.name}</h3>
                    <span className={`${styles.statusBadge} ${getStatusClass(elder.status)}`}>
                      {elder.status}
                    </span>
                  </div>

                  <div className={styles.elderDetails}>
                    <div className={styles.elderDetail}>
                      <span className={styles.detailIcon}>👤</span>
                      <span>Age: {elder.age} years</span>
                    </div>
                    <div className={styles.elderDetail}>
                      <span className={styles.detailIcon}>⏱️</span>
                      <span>Duration: {elder.duration}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleElderClick(elder)}
                    className={styles.viewButton}
                  >
                    View Elder Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CaregiverLayout>
    </>
  );
};

export default ViewAllElders;
