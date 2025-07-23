import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/navbar';
import HealthProfessionalSidebar from '../../components/HealthProfessionalSidebar';
import styles from '../../components/css/doctor/profile.module.css';

const initialProfile = {
  name: 'Jane Doe',
  email: 'janedoe@silvercare.com',
  phone: '0712345678',
  alternative_number: '0771234567',
  specialization: 'Mental Health',
  license_number: 'HP-98765',
  current_institution: 'SilverCare Clinic',
  years_experience: 4,
  status: 'approved',
  district: 'Colombo',
  created_at: '2022-01-15T10:00:00Z',
};

const getStatusBadge = (status) => {
  const statusConfig = {
    'approved': { color: '#27ae60', bg: '#d5f4e6', text: 'Approved' },
    'pending': { color: '#f39c12', bg: '#fef9e7', text: 'Pending' },
    'rejected': { color: '#e74c3c', bg: '#fdf2f2', text: 'Rejected' }
  };
  const config = statusConfig[status] || statusConfig['pending'];
  return (
    <span 
      className={styles.statusBadge}
      style={{ 
        color: config.color, 
        backgroundColor: config.bg,
        border: `1px solid ${config.color}30`
      }}
    >
      {config.text}
    </span>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

const HealthProfessionalProfile = () => {
  const { currentUser } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    ...initialProfile,
    name: currentUser?.name || initialProfile.name,
    email: currentUser?.email || initialProfile.email,
  });
  const [editForm, setEditForm] = useState(profile);
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setProfile(editForm);
    setIsEditing(false);
    setSuccessMessage('Profile updated successfully!');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  return (
    <div className={styles.profileContainer}>
      <HealthProfessionalSidebar onToggleCollapse={setSidebarCollapsed} />
      <div className={`${styles.mainContent} ${sidebarCollapsed ? styles.mainContentCollapsed : ''}`}>
        <Navbar />
        <div className={styles.profileHeader}>
          <div className={styles.headerContent}>
            <div className={styles.avatarSection}>
              <div className={styles.avatar}>
                <span className={styles.avatarIcon}>🧑‍⚕️</span>
              </div>
              <div className={styles.avatarInfo}>
                <h1 className={styles.doctorName}>{profile.name}</h1>
                <p className={styles.specialization}>{profile.specialization}</p>
                <p className={styles.institution}>{profile.current_institution}</p>
                {getStatusBadge(profile.status)}
              </div>
            </div>
            <div className={styles.headerActions}>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className={styles.editBtn}
                >
                  ✏️ Edit Profile
                </button>
              ) : (
                <div className={styles.editActions}>
                  <button 
                    onClick={handleSave}
                    className={styles.saveBtn}
                  >
                    💾 Save Changes
                  </button>
                  <button 
                    onClick={handleCancel}
                    className={styles.cancelBtn}
                  >
                    ❌ Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {successMessage && (
          <div className={styles.successMessage}>
            <span className={styles.successIcon}>✅</span>
            {successMessage}
          </div>
        )}
        <div className={styles.profileContent}>
          <div className={styles.profileSection}>
            <h2 className={styles.sectionTitle}>👤 Personal Information</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.infoValue}>{profile.name}</span>
                )}
              </div>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.infoValue}>{profile.email}</span>
                )}
              </div>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleInputChange}
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.infoValue}>{profile.phone}</span>
                )}
              </div>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Alternative Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="alternative_number"
                    value={editForm.alternative_number}
                    onChange={handleInputChange}
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.infoValue}>{profile.alternative_number}</span>
                )}
              </div>
            </div>
          </div>
          <div className={styles.profileSection}>
            <h2 className={styles.sectionTitle}>🩺 Professional Information</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Specialization</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="specialization"
                    value={editForm.specialization}
                    onChange={handleInputChange}
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.infoValue}>{profile.specialization}</span>
                )}
              </div>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>License Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="license_number"
                    value={editForm.license_number}
                    onChange={handleInputChange}
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.infoValue}>{profile.license_number}</span>
                )}
              </div>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Current Institution</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="current_institution"
                    value={editForm.current_institution}
                    onChange={handleInputChange}
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.infoValue}>{profile.current_institution}</span>
                )}
              </div>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Years of Experience</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="years_experience"
                    value={editForm.years_experience}
                    onChange={handleInputChange}
                    className={styles.editInput}
                    min="0"
                  />
                ) : (
                  <span className={styles.infoValue}>{profile.years_experience} years</span>
                )}
              </div>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>District</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="district"
                    value={editForm.district}
                    onChange={handleInputChange}
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.infoValue}>{profile.district}</span>
                )}
              </div>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Account Status</label>
                {getStatusBadge(profile.status)}
              </div>
            </div>
          </div>
          <div className={styles.profileSection}>
            <h2 className={styles.sectionTitle}>🔐 Account Information</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Registration Date</label>
                <span className={styles.infoValue}>{formatDate(profile.created_at)}</span>
              </div>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Account Type</label>
                <span className={styles.infoValue}>Health Professional</span>
              </div>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>User ID</label>
                <span className={styles.infoValue}>{currentUser?.user_id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthProfessionalProfile;
