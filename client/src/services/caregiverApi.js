import axios from 'axios';
const API_BASE = 'http://localhost:5000/api/caregivers';

export const caregiverApi = {
  // Get all caregivers
  getAllCaregivers: async () => {
    try {
      console.log('API: Fetching all caregivers');
      const response = await fetch(`${API_BASE}`);
      const data = await response.json();
      
      console.log('API: Caregivers response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch caregivers');
      }
      
      return data;
    } catch (error) {
      console.error('API: Error fetching caregivers:', error);
      throw error;
    }
  },

  // Get caregiver by ID
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

  // Get active caregiver count
  getActiveCaregiverCount: async () => {
    try {
      console.log('API: Fetching active caregiver count');
      const response = await fetch(`${API_BASE}/count/active`);
      const data = await response.json();
      
      console.log('API: Active caregiver count response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch active caregiver count');
      }
      
      return data;
    } catch (error) {
      console.error('API: Error fetching active caregiver count:', error);
      throw error;
    }
  },

  // Get caregiver statistics
  getCaregiverStats: async () => {
    try {
      console.log('API: Fetching caregiver statistics');
      const response = await fetch(`${API_BASE}/stats`);
      const data = await response.json();
      
      console.log('API: Caregiver stats response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch caregiver statistics');
      }
      
      return data;
    } catch (error) {
      console.error('API: Error fetching caregiver statistics:', error);
      throw error;
    }
  },

  // Create care request (book caregiver)
  createCareRequest: async (caregiverId, requestData) => {
    try {
      console.log('API: Creating care request:', caregiverId, requestData);
      const response = await fetch(`${API_BASE}/${caregiverId}/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      const data = await response.json();
      console.log('API: Care request response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create care request');
      }
      
      return data;
    } catch (error) {
      console.error('API: Error creating care request:', error);
      throw error;
    }
  },

  // Get care requests for family member
  getCareRequestsByFamily: async (familyMemberId) => {
    try {
      console.log('API: Fetching care requests for family member:', familyMemberId);
      const response = await fetch(`${API_BASE}/requests/family/${familyMemberId}`);
      const data = await response.json();
      
      console.log('API: Care requests response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch care requests');
      }
      
      return data;
    } catch (error) {
      console.error('API: Error fetching care requests:', error);
      throw error;
    }
  },

  // Search caregivers
  searchCaregivers: async (searchParams) => {
    try {
      const { query, district, certifications } = searchParams;
      const params = new URLSearchParams();
      
      if (query) params.append('query', query);
      if (district) params.append('district', district);
      if (certifications) params.append('certifications', certifications);
      
      console.log('API: Searching caregivers with params:', searchParams);
      const response = await fetch(`${API_BASE}/search?${params.toString()}`);
      const data = await response.json();
      
      console.log('API: Search caregivers response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to search caregivers');
      }
      
      return data;
    } catch (error) {
      console.error('API: Error searching caregivers:', error);
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

  // Get assigned elders for caregiver(role caregiver)
  /*fetchAssignedElders: async (caregiverId) => {
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
  },*/

  // NEW: Get caregivers by elder's district (for family member booking)
  getCaregiversByElderDistrict: async (elderId) => {
    try {
      console.log('API: Fetching caregivers by elder district:', elderId);
      const response = await fetch(`http://localhost:5000/api/elders/${elderId}/caregivers`);
      const data = await response.json();
      
      console.log('API: Caregivers by district response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch caregivers');
      }
      
      return data;
    } catch (error) {
      console.error('API: Error fetching caregivers by district:', error);
      throw error;
    }
  },

  // NEW: Get caregiver booking information
  getCaregiverBookingInfo: async (elderId, caregiverId) => {
    try {
      console.log('API: Fetching caregiver booking info:', elderId, caregiverId);
      const response = await fetch(`http://localhost:5000/api/elders/${elderId}/caregiver-booking/${caregiverId}`);
      const data = await response.json();
      
      console.log('API: Caregiver booking info response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch booking information');
      }
      
      return data;
    } catch (error) {
      console.error('API: Error fetching booking info:', error);
      throw error;
    }
  },

  // NEW: Get blocked dates for caregiver
  getBlockedDates: async (caregiverId, year, month) => {
    try {
      console.log('API: Fetching blocked dates for caregiver:', caregiverId, year, month);
      const response = await fetch(`${API_BASE}/${caregiverId}/blocked-dates?year=${year}&month=${month}`);
      const data = await response.json();
      
      console.log('API: Blocked dates response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch blocked dates');
      }
      
      return data;
    } catch (error) {
      console.error('API: Error fetching blocked dates:', error);
      throw error;
    }
  },

  // NEW: Create booking/care request with multiple dates
  createBooking: async (bookingData) => {
    try {
      console.log('API: Creating caregiver booking:', bookingData);
      const response = await fetch(`${API_BASE}/booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      const data = await response.json();
      console.log('API: Booking response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }
      
      return data;
    } catch (error) {
      console.error('API: Error creating booking:', error);
      throw error;
    }
  },

};

export default caregiverApi;

// Elder-specific care assignment functions
const ELDER_API_BASE = 'http://localhost:5000/api/elders';

// Get upcoming care assignments for an elder
export const getUpcomingCareAssignments = (elderId) => {
  return axios.get(`${ELDER_API_BASE}/${elderId}/care-assignments/upcoming`);
};

// Get care assignments by week
export const getCareAssignmentsByWeek = (elderId, startDate = null) => {
  const params = startDate ? { startDate } : {};
  return axios.get(`${ELDER_API_BASE}/${elderId}/care-assignments/week`, { params });
};

// Get care assignments for a specific day
export const getDayCareAssignments = (elderId, date) => {
  return axios.get(`${ELDER_API_BASE}/${elderId}/care-assignments/day`, {
    params: { date }
  });
};

// Get care assignments by month
export const getCareAssignmentsByMonth = (elderId, month) => {
  // Convert month date to start date of the month
  const monthDate = new Date(month);
  const year = monthDate.getFullYear();
  const monthNum = monthDate.getMonth();
  
  // First day of the month
  const startDate = new Date(year, monthNum, 1);
  // Last day of the month
  const endDate = new Date(year, monthNum + 1, 0);
  
  return axios.get(`${ELDER_API_BASE}/${elderId}/care-assignments/month`, {
    params: {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }
  });
};

// Get care assignment statistics
export const getCareAssignmentStats = (elderId) => {
  return axios.get(`${ELDER_API_BASE}/${elderId}/care-assignments/stats`);
};
