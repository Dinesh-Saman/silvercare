const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const doctormessageApi = {
  // Get doctors who have confirmed/completed appointments with family member's elders
  getDoctorsWithAppointments: async (familyMemberId) => {
    try {
      console.log('API: Fetching doctors with appointments for family member:', familyMemberId);
      
      const response = await fetch(`${API_BASE}/family-member/${familyMemberId}/doctors-with-appointments`);
      const data = await response.json();
      
      console.log('API: Doctors with appointments response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch doctors with appointments');
      }
      
      return data;
    } catch (error) {
      console.error('API: Error fetching doctors with appointments:', error);
      throw error;
    }
  },

  // Get appointment history between family member and specific doctor
  getAppointmentHistoryWithDoctor: async (familyMemberId, doctorId) => {
    try {
      console.log('API: Fetching appointment history for family member:', familyMemberId, 'and doctor:', doctorId);
      
      const response = await fetch(`${API_BASE}/family-member/${familyMemberId}/doctor/${doctorId}/appointments`);
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