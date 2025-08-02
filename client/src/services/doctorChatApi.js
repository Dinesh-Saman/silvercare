const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const doctorChatApi = {
  // Get family members who have confirmed/completed appointments with this doctor
  getFamilyMembersWithAppointments: async (doctorId) => {
    try {
      console.log('API: Fetching family members with appointments for doctor:', doctorId);
      
      const response = await fetch(`${API_BASE}/doctor/${doctorId}/family-members-with-appointments`);
      const data = await response.json();
      
      console.log('API: Family members with appointments response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch family members with appointments');
      }
      
      return data;
    } catch (error) {
      console.error('API: Error fetching family members with appointments:', error);
      throw error;
    }
  },

  // Get appointment history between doctor and specific family member
  getAppointmentHistoryWithFamilyMember: async (doctorId, familyMemberId) => {
    try {
      console.log('API: Fetching appointment history for doctor:', doctorId, 'and family member:', familyMemberId);
      
      const response = await fetch(`${API_BASE}/doctor/${doctorId}/family-member/${familyMemberId}/appointments`);
      const data = await response.json();
      
      console.log('API: Appointment history response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch appointment history');
      }
      
      return data;
    } catch (error) {
      console.error('API: Error fetching appointment history:', error);
      throw error;
    }
  }
};
