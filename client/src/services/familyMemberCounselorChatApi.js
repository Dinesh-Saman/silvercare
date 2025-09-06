import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const familyMemberCounselorChatApi = {
  // Get counselors that have appointments with family member
  getCounselorsWithAppointments: async (user_id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/family-member/${user_id}/counselors-with-appointments`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching counselors for family member:', error);
      throw error;
    }
  },

  // Get appointment history between family member and counselor
  getAppointmentHistoryWithCounselor: async (user_id, counselor_id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/family-member/${user_id}/counselor/${counselor_id}/appointments`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching appointment history:', error);
      throw error;
    }
  }
};
