const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const elderChatApi = {
  // Get elders who belong to the family member for chat
  getEldersForChat: async (familyMemberId) => {
    try {
      console.log('API: Fetching elders for chat for family member:', familyMemberId);
      
      const response = await fetch(`${API_BASE}/elders/family-member/${familyMemberId}`);
      const data = await response.json();
      
      console.log('API: Elders for chat response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch elders for chat');
      }
      
      return data;
    } catch (error) {
      console.error('API: Error fetching elders for chat:', error);
      throw error;
    }
  }
};
