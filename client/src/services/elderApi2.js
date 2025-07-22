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

// Dashboard stats function
export const getElderDashboardStats = (elderId) => {
  return axios.get(`${API_BASE}/${elderId}/dashboard-stats`);
};

// Appointment-related functions
export const getUpcomingAppointments = (elderId) => {
  return axios.get(`${API_BASE}/${elderId}/appointments/upcoming`);
};

export const getPastAppointments = (elderId) => {
  return axios.get(`${API_BASE}/${elderId}/appointments/past`);
};

export const getAllAppointments = (elderId) => {
  return axios.get(`${API_BASE}/${elderId}/appointments`);
};

export const getAppointmentById = (elderId, appointmentId) => {
  return axios.get(`${API_BASE}/${elderId}/appointments/${appointmentId}`);
};

<<<<<<< Updated upstream
export const cancelAppointment = (elderId, appointmentId) => {
  return axios.put(`${API_BASE}/${elderId}/appointments/${appointmentId}/cancel`);
};

export const rescheduleAppointment = (elderId, appointmentId, newDateTime) => {
  return axios.put(`${API_BASE}/${elderId}/appointments/${appointmentId}/reschedule`, {
    newDateTime
  });
=======
export const joinAppointment = (elderId, appointmentId) => {
  return axios.post(`${API_BASE}/${elderId}/appointments/${appointmentId}/join`);
>>>>>>> Stashed changes
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
  const params = startDate ? { startDate } : {};
  return axios.get(`http://localhost:5000/api/care-assignments/${elderId}/week`, { params });
};

export const getDayCareAssignments = (elderId, date) => {
  return axios.get(`http://localhost:5000/api/care-assignments/${elderId}/day`, {
    params: { date }
  });
};

export const getCareAssignmentStats = (elderId) => {
  return axios.get(`http://localhost:5000/api/care-assignments/${elderId}/stats`);
};
