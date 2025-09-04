import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/healthprofessional';

// API functions for counselor-family member chat
export const counselorFamilyMemberChatApi = {
  // Get family members that have appointments with the counselor
  getFamilyMembersWithAppointments: async (counselorId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${counselorId}/family-members-with-appointments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching family members for counselor:', error);
      throw error;
    }
  },

  // Get appointment history between counselor and family member
  getAppointmentHistoryWithFamilyMember: async (counselorId, familyMemberId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${counselorId}/family-member/${familyMemberId}/appointments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointment history:', error);
      throw error;
    }
  }
};
