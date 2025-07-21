import axios from 'axios';
const API_BASE = 'http://localhost:5000/api/caregivers';

export const caregiverApi = {

  // Get assigned elders for caregiver(role caregiver)
  fetchAssignedElders: async (caregiverId) => {
    try {
      const response = await axios.get(`${API_BASE}/${caregiverId}/assigned-elders`);
      return response.data;
    } catch (error) {
      console.error('API: Error fetching assigned elders:', error);
      return [];
    }
  },

  // Get number of assigned families for caregiver(role caregiver)
  getAssignedFamiliesCount: async (caregiverId) => {
    try {
      const response = await axios.get(`${API_BASE}/${caregiverId}/assigned-families`);
      return response.data;
    } catch (error) {
      console.error('API: Error fetching assigned families count:', error);
      return { count: 0 };
    }
  },

  // Get number of carelogs(role caregiver)
  getcarelogsCount: async (caregiverId) => {
    try {
      const response = await axios.get(`${API_BASE}/${caregiverId}/carelogs-count`);
      return response.data;
    } catch (error) {
      console.error('API: Error fetching carelogs count:', error);
      return { count: 0 };
    }
  },

  // Get caregiver schedules(role caregiver)
  fetchSchedules: async (caregiverId) => {
    try {
      const response = await axios.get(`${API_BASE}/${caregiverId}/caregiver-schedules`);
      return response.data;
    } catch (error) {
      console.error('API: Error fetching schedules:', error);
      return [];
    }
  },

  // Get care requests for caregiver(role caregiver)
  fetchCareRequests: async (caregiverId) => {
    try {
      const response = await axios.get(`${API_BASE}/${caregiverId}/care-requests`);
      return response.data;
    } catch (error) {
      console.error('API: Error fetching care requests:', error);
      return [];
    }
  },

  // Get upcoming shifts for caregiver(role caregiver)
  fetchUpcomingShifts: async (caregiverId) => {
    try {
      const response = await axios.get(`${API_BASE}/${caregiverId}/upcoming-shifts`);
      return response.data;
    } catch (error) {
      console.error('API: Error fetching upcoming shifts:', error);
      return [];
    }
  },

  // Get care request details by ID(role caregiver)
  getCareRequestDetails: async (requestId) => {
    try {
      console.log('API: Fetching care request details for ID:', requestId);
      const response = await fetch(`${API_BASE}/requests/${requestId}`);
      const data = await response.json();
      
      console.log('API: Care request details response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch care request details');
      }
      
      return data;
    } catch (error) {
      console.error('API: Error fetching care request details:', error);
      throw error;
    }
  },

  // Update care request status
  updateCareRequestStatus: async (requestId, status) => {
    try {
      console.log('API: Updating care request status:', requestId, status);
      const response = await fetch(`${API_BASE}/requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      const data = await response.json();
      console.log('API: Update status response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update care request status');
      }
      
      return data;
    } catch (error) {
      console.error('API: Error updating care request status:', error);
      throw error;
    }
  },

  // Get caregiver by ID(role caregiver)
  getCaregiverById: async (caregiverId) => {
    try {
      console.log('API: Fetching caregiver by ID:', caregiverId);
      const response = await fetch(`${API_BASE}/${caregiverId}`);
      const data = await response.json();
      
      console.log('API: Caregiver details response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch caregiver details');
      }
      
      return data;
    } catch (error) {
      console.error('API: Error fetching caregiver details:', error);
      throw error;
    }
  },

  // Update caregiver profile(role caregiver)
  updateCaregiverProfile: async (caregiverId, profileData) => {
    try {
      console.log('API: Updating caregiver profile:', caregiverId, profileData);
      const response = await fetch(`${API_BASE}/${caregiverId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      const data = await response.json();
      console.log('API: Update profile response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }
      
      return data;
    } catch (error) {
      console.error('API: Error updating profile:', error);
      throw error;
    }
  },

  // Update caregiver password(role caregiver)
  updateCaregiverPassword: async (caregiverId, passwordData) => {
    try {
      console.log('API: Updating caregiver password:', caregiverId);
      const response = await fetch(`${API_BASE}/${caregiverId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      });
      
      const data = await response.json();
      console.log('API: Update password response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password');
      }
      
      return data;
    } catch (error) {
      console.error('API: Error updating password:', error);
      throw error;
    }
  },

};

export default caregiverApi;
