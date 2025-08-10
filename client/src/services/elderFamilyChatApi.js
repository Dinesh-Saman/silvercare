const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const elderFamilyChatApi = {
  // Get family members for chat (elder perspective)
  getFamilyMembersForChat: async (elderId) => {
    try {
      console.log('API: Fetching family members for chat for elder:', elderId);
      
      const response = await fetch(`${API_BASE}/elders/${elderId}/family-members-for-chat`);
      const data = await response.json();
      
      console.log('API: Family members for chat response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch family members for chat');
      }
      
      return data;
    } catch (error) {
      console.error('API: Error fetching family members for chat:', error);
      throw error;
    }
  }
};
