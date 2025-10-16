import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Join appointment as doctor
export const joinAppointment = async (doctorId, appointmentId) => {
  try {
    const response = await apiClient.post(`/doctor/${doctorId}/appointments/${appointmentId}/join`);
    return response.data;
  } catch (error) {
    console.error('Error joining appointment:', error);
    throw error;
  }
};

// Get doctor appointments with meeting info
export const getDoctorAppointments = async (doctorId) => {
  try {
    const response = await apiClient.get(`/doctor/${doctorId}/appointments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    throw error;
  }
};

// Get today's appointments with meeting info
export const getTodaysAppointments = async (doctorId) => {
  try {
    const response = await apiClient.get(`/doctor/${doctorId}/today`);
    return response.data;
  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    throw error;
  }
};

// Get upcoming appointments with meeting info
export const getUpcomingAppointments = async (doctorId) => {
  try {
    const response = await apiClient.get(`/doctor/${doctorId}/upcoming`);
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    throw error;
  }
};

export default {
  joinAppointment,
  getDoctorAppointments,
  getTodaysAppointments,
  getUpcomingAppointments
};
