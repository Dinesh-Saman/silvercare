process.env.TZ = 'Asia/Colombo';

console.log('Server timezone set to:', process.env.TZ);
console.log('Current server time:', new Date().toString());
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json()); // Important: for parsing JSON body

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
<<<<<<< Updated upstream

=======
const paymentRoutes = require('./routes/paymentRoutes');
const healthprofessionalRoutes = require('./routes/healthprofessionalRoutes');
const careAssignmentRoutes = require('./routes/careAssignmentRoutes');
<<<<<<< Updated upstream
<<<<<<< Updated upstream
const availabilityRoutes = require('./routes/availabilityRoutes');
>>>>>>> Stashed changes
=======
const meetingRoutes = require('./routes/meetingRoutes');
>>>>>>> Stashed changes
=======
const meetingRoutes = require('./routes/meetingRoutes');
>>>>>>> Stashed changes

app.use('/api/users', userRoutes); // Mount the full route
app.use('/api/register', registerRoutes);
app.use('/api/auth', authRoutes); // Add this line
app.use('/api/elders', elderRoutes);
app.use('/api/doctor', doctorRoutes); // Indipa Added this line
app.use('/api/admin', adminRoutes); // Add this line by Nimal
app.use('/api/caregivers', caregiverRoutes);
app.use('/api/appointments', appointmentRoutes); // Add this line
<<<<<<< Updated upstream

=======
app.use('/api/payment', paymentRoutes);
app.use('/api/healthprofessional', healthprofessionalRoutes);
app.use('/api/care-assignments', careAssignmentRoutes);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
app.use('/api/availability', availabilityRoutes);
>>>>>>> Stashed changes
=======
=======
>>>>>>> Stashed changes
app.use('/api/meetings', meetingRoutes);

// Start meeting scheduler
const meetingScheduler = require('./jobs/meetingScheduler');
meetingScheduler.start();
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Meeting scheduler initialized');
});
