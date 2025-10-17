// Image utility functions for SilverCare application

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

/**
 * Converts a database image path to a proper URL that can be served by the backend
 * @param {string} imagePath - The image path from database (e.g., "uploads\profiles\empty.png")
 * @returns {string|null} - The full URL or null if no path provided
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Convert backslashes to forward slashes for web URLs
  const normalizedPath = imagePath.replace(/\\/g, '/');
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = normalizedPath.startsWith('/') ? normalizedPath.slice(1) : normalizedPath;
  
  // Return full URL
  return `${API_BASE}/${cleanPath}`;
};

/**
 * Gets a default avatar URL based on user type and gender
 * @param {string} userType - The type of user (elder, doctor, caregiver, family_member)
 * @param {string} gender - The gender (male, female, other)
 * @returns {string} - Default avatar URL
 */
export const getDefaultAvatar = (userType = 'elder', gender = 'male') => {
  const genderNum = gender.toLowerCase() === 'female' ? Math.floor(Math.random() * 50) + 50 : Math.floor(Math.random() * 50);
  
  switch (userType.toLowerCase()) {
    case 'doctor':
    case 'healthcare_professional':
    case 'healthprofessional':
      return `https://randomuser.me/api/portraits/${gender.toLowerCase() === 'female' ? 'women' : 'men'}/${genderNum}.jpg`;
    case 'elder':
      // Use older-looking portraits for elders
      const elderNum = Math.floor(Math.random() * 20) + 30;
      return `https://randomuser.me/api/portraits/${gender.toLowerCase() === 'female' ? 'women' : 'men'}/${elderNum}.jpg`;
    case 'caregiver':
    case 'family_member':
    default:
      return `https://randomuser.me/api/portraits/${gender.toLowerCase() === 'female' ? 'women' : 'men'}/${genderNum}.jpg`;
  }
};

/**
 * Handles image loading errors by setting a default avatar
 * @param {Event} event - The error event
 * @param {string} userType - The type of user for appropriate default
 * @param {string} gender - The gender for appropriate default
 */
export const handleImageError = (event, userType = 'elder', gender = 'male') => {
  event.target.src = getDefaultAvatar(userType, gender);
};

/**
 * Gets a complete image source with fallback
 * @param {string} imagePath - The image path from database
 * @param {string} userType - The type of user for fallback
 * @param {string} gender - The gender for fallback
 * @returns {string} - The image URL or fallback URL
 */
export const getImageSrc = (imagePath, userType = 'elder', gender = 'male') => {
  const imageUrl = getImageUrl(imagePath);
  return imageUrl || getDefaultAvatar(userType, gender);
};