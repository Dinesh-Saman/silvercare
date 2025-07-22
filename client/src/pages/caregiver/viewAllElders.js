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
        setElders(data);
        setFilteredElders(data);
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
    if (searchTerm) {
      filtered = filtered.filter(elder =>
        elder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        elder.age.toString().includes(searchTerm)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(elder =>
        elder.status.toLowerCase() === statusFilter.toLowerCase()
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

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return styles.statusApproved;
      case 'pending':
        return styles.statusPending;
      case 'completed':
        return styles.statusCompleted;
      case 'ongoing':
        return styles.statusOngoing;
      default:
        return styles.statusPending;
    }
  };

  const getUniqueStatuses = () => {
    const statuses = elders.map(elder => elder.status);
    return [...new Set(statuses)];
  };

  const getStats = () => {
    return {
      total: elders.length,
      approved: elders.filter(e => e.status.toLowerCase() === 'approved').length,
      ongoing: elders.filter(e => e.status.toLowerCase() === 'ongoing').length,
      completed: elders.filter(e => e.status.toLowerCase() === 'completed').length,
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
            <h1 className={styles.title}>Assigned Elders</h1>
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
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Statuses</option>
              {getUniqueStatuses().map(status => (
                <option key={status} value={status.toLowerCase()}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <button onClick={handleClearFilters} className={styles.clearButton}>
              Clear Filters
            </button>
          </div>

          {/* Statistics Bar */}
          <div className={styles.statsBar}>
            <div className={styles.statCard}>
              <p className={styles.statNumber}>{stats.total}</p>
              <p className={styles.statLabel}>Total Elders</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statNumber}>{stats.approved}</p>
              <p className={styles.statLabel}>Approved</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statNumber}>{stats.ongoing}</p>
              <p className={styles.statLabel}>Ongoing</p>
            </div>
            <div className={styles.statCard}>
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
              📋 No elders assigned yet.
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
                    <div className={styles.elderDetail}>
                      <span className={styles.detailIcon}>📋</span>
                      <span>Status: {elder.status}</span>
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
