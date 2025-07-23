import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get family member details by user ID
export const getFamilyMemberDetails = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE}/family-member/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching family member details:', error);
    throw error;
  }
};

// Update family member details
export const updateFamilyMemberDetails = async (userId, updateData) => {
  try {
    const response = await axios.put(`${API_BASE}/family-member/${userId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating family member details:', error);
    throw error;
  }
};
