import axios from 'axios';
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';


export const createFeedback = async (data) => {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};

export const getFeedbacks = async () => {
  console.log('Fetching dashboard data from:', `${API_BASE}/feedback`);
  const response = await fetch(API_BASE);
  return response;
};

export const getFeedbackByDoctor = async (doctor_id) => {
  try {
    const response = await axios(`${API_BASE}/doctor/${doctor_id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching feedback by doctor:', error);
    throw error;
  }
};

export const getFeedbacksByPatient = async (patient_id) => {
  const response = await fetch(`${API_BASE}/patient/${patient_id}`);
  return response.json();
};

export const updateFeedback = async (feedback_id, data) => {
  const response = await fetch(`${API_BASE}/${feedback_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};

export const deleteFeedback = async (feedback_id) => {
  const response = await fetch(`${API_BASE}/${feedback_id}`, {
    method: 'DELETE'
  });
  return response.json();
};