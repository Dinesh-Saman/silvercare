import React, { useState, useEffect } from 'react';
import Navbar from '../../components/navbar';
import { useAuth } from '../../context/AuthContext';
import { getFamilyMemberDetails, updateFamilyMemberDetails } from '../../services/familyMemberApi';
import styles from '../../components/css/familymember/profile.module.css';
import FamilyMemberLayout from '../../components/FamilyMemberLayout';

const FamilyMemberProfile = () => {
  const { currentUser, logout } = useAuth();
  const [familyMemberData, setFamilyMemberData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    phone_fixed: ''
  });

  // Fetch family member details on component mount
  useEffect(() => {
    const fetchFamilyMemberDetails = async () => {
      if (!currentUser?.user_id) return;
      
      try {
        setIsLoading(true);
        const response = await getFamilyMemberDetails(currentUser.user_id);
        
        if (response.success) {
          setFamilyMemberData(response.familyMember);
          setFormData({
            name: response.familyMember.name || '',
            email: response.familyMember.email || '',
            phone: response.familyMember.phone || '',
            phone_fixed: response.familyMember.phone_fixed || ''
          });
        }
      } catch (err) {
        console.error('Error fetching family member details:', err);
        setError('Failed to load profile details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFamilyMemberDetails();
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!currentUser?.user_id) return;
    
    try {
      setIsSaving(true);
      setError('');
      setSuccessMessage('');
      
      const response = await updateFamilyMemberDetails(currentUser.user_id, formData);
      
      if (response.success) {
        setFamilyMemberData(response.familyMember);
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (familyMemberData) {
      setFormData({
        name: familyMemberData.name || '',
        email: familyMemberData.email || '',
        phone: familyMemberData.phone || '',
        phone_fixed: familyMemberData.phone_fixed || ''
      });
    }
    setIsEditing(false);
    setError('');
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <Navbar />
        <div className={styles.contentContainer}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Navbar />
       <FamilyMemberLayout>
      
      <div className={styles.contentContainer}>
        {/* Header Section - Following Elder Profile Structure */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerInfo}>
              <h1>Family Member Profile</h1>
              <p>Manage your profile information and account settings</p>
            </div>

          </div>
        </div>

        {/* Profile Card Section - Following Elder Profile Structure */}
        <div className={styles.profileCard}>
          <div className={styles.profileImageSection}>
            <div className={styles.imageContainer}>
              <div className={styles.profilePlaceholder}>
                {familyMemberData?.name ? familyMemberData.name.charAt(0).toUpperCase() : 'F'}
                <div className={styles.statusIndicator}></div>
              </div>
            </div>
 
          </div>

          <div className={styles.profileInfo}>
            <div className={styles.profileName}>
              <h2>{familyMemberData?.name || 'Family Member'}</h2>
              <span className={styles.roleTag}>Family Member</span>
            </div>

            <div className={styles.profileMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Email</span>
                <span className={styles.metaValue}>{familyMemberData?.email || 'Not provided'}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Phone</span>
                <span className={styles.metaValue}>{familyMemberData?.phone || 'Not provided'}</span>
              </div>

              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Member Since</span>
                <span className={styles.metaValue}>
                  {familyMemberData?.created_at ? 
                    new Date(familyMemberData.created_at).toLocaleDateString() : 
                    'Not available'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Information Sections - Following Elder Profile Structure */}
        <div className={styles.infoSections}>
          {/* Personal Information Section */}
          <div className={styles.infoSection}>
            <div className={styles.sectionHeader}>
              <h3>👤 Personal Information</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className={styles.editBtn}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {error && (
              <div className={styles.errorMessage}>
                ⚠️ {error}
              </div>
            )}

            {successMessage && (
              <div className={styles.successMessage}>
                ✅ {successMessage}
              </div>
            )}

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={styles.editInput}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <span>{familyMemberData?.name || 'Not provided'}</span>
                )}
              </div>

              <div className={styles.infoItem}>
                <label>Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={styles.editInput}
                    placeholder="Enter your email address"
                  />
                ) : (
                  <span>{familyMemberData?.email || 'Not provided'}</span>
                )}
              </div>

              <div className={styles.infoItem}>
                <label>Mobile Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={styles.editInput}
                    placeholder="Enter your mobile phone"
                  />
                ) : (
                  <span>{familyMemberData?.phone || 'Not provided'}</span>
                )}
              </div>

              <div className={styles.infoItem}>
                <label>Fixed Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone_fixed"
                    value={formData.phone_fixed}
                    onChange={handleInputChange}
                    className={styles.editInput}
                    placeholder="Enter your fixed phone"
                  />
                ) : (
                  <span>{familyMemberData?.phone_fixed || 'Not provided'}</span>
                )}
              </div>

  

 
            </div>

            {isEditing && (
              <div className={styles.actionButtons}>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={styles.saveBtn}
                >
                  {isSaving ? (
                    <>
                      <div className={styles.buttonSpinner}></div>
                      Saving...
                    </>
                  ) : (
                    '💾 Save Changes'
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className={styles.cancelBtn}
                >
                  ❌ Cancel
                </button>
              </div>
            )}
          </div>



         
        </div>
        
      </div>
      </FamilyMemberLayout>
    </div>
  );
};

export default FamilyMemberProfile;
