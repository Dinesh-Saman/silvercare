import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar';
import CaregiverLayout from '../../components/CaregiverLayout';
import { useAuth } from '../../context/AuthContext';
import { caregiverApi } from '../../services/caregiverApi';
import styles from "../../components/css/caregiver/profile.module.css";

const Caregiverprofile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    availability: '',
    certifications: '',
    fixed_line: '',
    district: ''
  });

  useEffect(() => {
    if (user && user.caregiver_id) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await caregiverApi.getCaregiverById(user.caregiver_id);
      if (response.success) {
        setProfileData(response.caregiver);
        setEditForm({
          name: response.caregiver.caregiver_name || '',
          email: response.caregiver.caregiver_email || '',
          phone: response.caregiver.caregiver_phone || '',
          availability: response.caregiver.availability || '',
          certifications: response.caregiver.certifications || '',
          fixed_line: response.caregiver.fixed_line || '',
          district: response.caregiver.district || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original data
    setEditForm({
      name: profileData.caregiver_name || '',
      email: profileData.caregiver_email || '',
      phone: profileData.caregiver_phone || '',
      availability: profileData.availability || '',
      certifications: profileData.certifications || '',
      fixed_line: profileData.fixed_line || '',
      district: profileData.district || ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      // In a real app, you'd have an update API endpoint
      // For now, we'll just update the local state
      setProfileData(prev => ({
        ...prev,
        caregiver_name: editForm.name,
        caregiver_email: editForm.email,
        caregiver_phone: editForm.phone,
        availability: editForm.availability,
        certifications: editForm.certifications,
        fixed_line: editForm.fixed_line,
        district: editForm.district
      }));
      setIsEditing(false);
      // You'd typically show a success message here
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <CaregiverLayout>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading profile...</p>
          </div>
        </CaregiverLayout>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <CaregiverLayout>
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={fetchProfileData} className={styles.retryButton}>
              Try Again
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
          <div className={styles.header}>
            <h1>My Profile</h1>
            <p>Manage your professional information and settings</p>
          </div>

          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.avatarSection}>
                <div className={styles.avatar}>
                  {profileData?.caregiver_name?.charAt(0)?.toUpperCase() || 'C'}
                </div>
                <div className={styles.userInfo}>
                  <h2>{profileData?.caregiver_name}</h2>
                  <p className={styles.role}>Professional Caregiver</p>
                  <div className={`${styles.statusBadge} ${styles[profileData?.availability]}`}>
                    {profileData?.availability}
                  </div>
                </div>
              </div>
              <div className={styles.actions}>
                {!isEditing ? (
                  <button onClick={handleEditClick} className={styles.editButton}>
                    ✏️ Edit Profile
                  </button>
                ) : (
                  <div className={styles.editActions}>
                    <button onClick={handleSaveProfile} className={styles.saveButton}>
                      ✓ Save
                    </button>
                    <button onClick={handleCancelEdit} className={styles.cancelButton}>
                      ✕ Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.profileContent}>
              <div className={styles.section}>
                <h3>Personal Information</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <label>Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleInputChange}
                        className={styles.input}
                      />
                    ) : (
                      <span>{profileData?.caregiver_name}</span>
                    )}
                  </div>
                  <div className={styles.infoItem}>
                    <label>Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleInputChange}
                        className={styles.input}
                      />
                    ) : (
                      <span>{profileData?.caregiver_email}</span>
                    )}
                  </div>
                  <div className={styles.infoItem}>
                    <label>Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleInputChange}
                        className={styles.input}
                      />
                    ) : (
                      <span>{profileData?.caregiver_phone}</span>
                    )}
                  </div>
                  <div className={styles.infoItem}>
                    <label>Fixed Line</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="fixed_line"
                        value={editForm.fixed_line}
                        onChange={handleInputChange}
                        className={styles.input}
                      />
                    ) : (
                      <span>{profileData?.fixed_line || 'Not provided'}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3>Professional Information</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <label>District</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="district"
                        value={editForm.district}
                        onChange={handleInputChange}
                        className={styles.input}
                      />
                    ) : (
                      <span>{profileData?.district}</span>
                    )}
                  </div>
                  <div className={styles.infoItem}>
                    <label>Availability Status</label>
                    {isEditing ? (
                      <select
                        name="availability"
                        value={editForm.availability}
                        onChange={handleInputChange}
                        className={styles.select}
                      >
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                    ) : (
                      <span className={`${styles.statusText} ${styles[profileData?.availability]}`}>
                        {profileData?.availability}
                      </span>
                    )}
                  </div>
                  <div className={styles.infoItem}>
                    <label>Member Since</label>
                    <span>{new Date(profileData?.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className={styles.certificationsSection}>
                  <label>Certifications & Qualifications</label>
                  {isEditing ? (
                    <textarea
                      name="certifications"
                      value={editForm.certifications}
                      onChange={handleInputChange}
                      className={styles.textarea}
                      rows={4}
                      placeholder="List your certifications, qualifications, and experience..."
                    />
                  ) : (
                    <div className={styles.certifications}>
                      {profileData?.certifications || 'No certifications listed'}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.section}>
                <h3>Account Actions</h3>
                <div className={styles.actionsGrid}>
                  <button 
                    onClick={() => navigate('/caregiver/dashboard')}
                    className={styles.actionButton}
                  >
                    📊 Go to Dashboard
                  </button>
                  <button 
                    onClick={() => navigate('/caregiver/care-requests')}
                    className={styles.actionButton}
                  >
                    📋 View Care Requests
                  </button>
                  <button 
                    onClick={handleLogout}
                    className={`${styles.actionButton} ${styles.logoutButton}`}
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CaregiverLayout>
    </>
  );
};

export default Caregiverprofile;
