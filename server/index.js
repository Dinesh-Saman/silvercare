process.env.TZ = 'Asia/Colombo';

console.log('Server timezone set to:', process.env.TZ);
console.log('Current server time:', new Date().toString());
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json()); // Important: for parsing JSON body

// Serve static files from uploads directory - ADD THIS LINE
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Load user routes
const userRoutes = require('./routes/userRoutes');

app.use('/api/users', userRoutes); // Mount the full route

const registerRoutes = require('./routes/registerRoutes');
const authRoutes = require('./routes/authRoutes'); // Add this line
const elderRoutes = require('./routes/elderRoutes'); // Add this line
const doctorRoutes = require('./routes/doctorRoutes'); // Indipa Added this line
const adminRoutes = require('./routes/adminRoutes'); // Add this line by Nimal
const caregiverRoutes = require('./routes/caregiverRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes'); // Add this line
const paymentRoutes = require('./routes/paymentRoutes');
const healthprofessionalRoutes = require('./routes/healthprofessionalRoutes');
const careAssignmentRoutes = require('./routes/careAssignmentRoutes');
const familyMemberRoutes = require('./routes/familyMemberRoutes');
const messagesRoutes = require('./routes/messagesRoutes');
const meetingRoutes = require('./routes/meetingRoutes'); // Add meeting routes


app.use('/api/users', userRoutes); // Mount the full route
app.use('/api/register', registerRoutes);
app.use('/api/auth', authRoutes); // Add this line
app.use('/api/elders', elderRoutes);
app.use('/api/doctor', doctorRoutes); // Indipa Added this line
app.use('/api/admin', adminRoutes); // Add this line by Nimal
app.use('/api/caregivers', caregiverRoutes);
app.use('/api/appointments', appointmentRoutes); // Add this line
app.use('/api/payment', paymentRoutes);
app.use('/api/healthprofessional', healthprofessionalRoutes);
app.use('/api/care-assignments', careAssignmentRoutes);
app.use('/api/family-member', familyMemberRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/meetings', meetingRoutes); // Add meeting endpoints;

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
