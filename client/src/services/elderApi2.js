import axios from 'axios';
const API_BASE = 'http://localhost:5000/api/elders';

export const getElderDetailsByEmail = (email) => {
  return axios.get(`${API_BASE}/elderDetails`, {
    params: { email }
  });
};

export const updateElderDetails = (elderId, elderData) => {
  return axios.put(`${API_BASE}/${elderId}`, elderData);
};

// Function to update elder profile with form data (for file uploads)
export const updateElderProfile = (elderId, formData) => {
  return axios.put(`${API_BASE}/${elderId}/profile`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Dashboard stats function
export const getElderDashboardStats = (elderId) => {
  return axios.get(`${API_BASE}/${elderId}/dashboard-stats`);
};

// Appointment-related functions
export const getUpcomingAppointments = (elderId, config = {}) => {
  return axios.get(`${API_BASE}/${elderId}/appointments/upcoming`, config);
};

export const getPastAppointments = (elderId, config = {}) => {
  return axios.get(`${API_BASE}/${elderId}/appointments/past`, config);
};

export const getAllAppointments = (elderId) => {
  return axios.get(`${API_BASE}/${elderId}/appointments`);
};

export const getAppointmentById = (elderId, appointmentId) => {
  return axios.get(`${API_BASE}/${elderId}/appointments/${appointmentId}`);
};

export const joinAppointment = (elderId, appointmentId) => {
  return axios.post(`${API_BASE}/${elderId}/appointments/${appointmentId}/join`);
};

// Session-related functions
export const getUpcomingSessions = (elderId, config = {}) => {
  return axios.get(`${API_BASE}/${elderId}/sessions/upcoming`, config);
};

export const getPastSessions = (elderId, config = {}) => {
  return axios.get(`${API_BASE}/${elderId}/sessions/past`, config);
};

export const getAllSessions = (elderId) => {
  return axios.get(`${API_BASE}/${elderId}/sessions`);
};

export const getSessionById = (elderId, sessionId) => {
  return axios.get(`${API_BASE}/${elderId}/sessions/${sessionId}`);
};

export const joinSession = (elderId, sessionId) => {
  return axios.post(`${API_BASE}/${elderId}/sessions/${sessionId}/join`);
};

// Care assignment functions
export const getCareAssignmentsByWeek = (elderId, startDate = null) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  
  return axios.get(`${API_BASE}/${elderId}/care-assignments/week`, { params });
};

export const getDayCareAssignments = (elderId, date) => {
  return axios.get(`${API_BASE}/${elderId}/care-assignments/day`, {
    params: { date }
  });
};

export const getCareAssignmentStats = (elderId) => {
  return axios.get(`${API_BASE}/${elderId}/care-assignments/stats`);
};
