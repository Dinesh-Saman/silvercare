const { v4: uuidv4 } = require('uuid');
const pool = require('../db');

class MeetingService {
  // Generate a global meeting link for an appointment
  static generateMeetingLink(appointmentId, doctorId, elderId) {
    const meetingId = uuidv4();
    const roomName = `silvercare-${meetingId}`;
    
    return {
      meetingId,
      roomName,
      meetingLink: `https://meet.jit.si/${roomName}`,
      doctorUrl: `https://meet.jit.si/${roomName}?userInfo.displayName=Doctor&userInfo.email=doctor@silvercare.com`,
      patientUrl: `https://meet.jit.si/${roomName}?userInfo.displayName=Patient&userInfo.email=patient@silvercare.com`
    };
  }

  // Create or update meeting link for an appointment
  static async ensureMeetingLink(appointmentId) {
    try {
      // Get appointment details
      const appointmentResult = await pool.query(
        'SELECT * FROM appointment WHERE appointment_id = $1',
        [appointmentId]
      );

      if (appointmentResult.rows.length === 0) {
        throw new Error('Appointment not found');
      }

      const appointment = appointmentResult.rows[0];

      // Only create meeting link for online appointments
      if (appointment.appointment_type !== 'online') {
        return appointment;
      }

      // If already has a meeting link, return as is
      if (appointment.meeting_link) {
        return appointment;
      }

      // Generate new meeting link
      const meetingData = this.generateMeetingLink(
        appointment.appointment_id,
        appointment.doctor_id,
        appointment.elder_id
      );

      // Update appointment with meeting link
      const updateResult = await pool.query(
        `UPDATE appointment 
         SET meeting_link = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE appointment_id = $2 
         RETURNING *`,
        [meetingData.meetingLink, appointmentId]
      );

      console.log(`✅ Generated meeting link for appointment ${appointmentId}: ${meetingData.meetingLink}`);
      
      return updateResult.rows[0];

    } catch (error) {
      console.error('Error ensuring meeting link:', error);
      throw error;
    }
  }

  // Generate meeting links for multiple confirmed online appointments
  static async generateLinksForConfirmedAppointments() {
    try {
      // Find confirmed online appointments without meeting links
      const result = await pool.query(`
        SELECT appointment_id, doctor_id, elder_id, appointment_type, meeting_link
        FROM appointment 
        WHERE status = 'confirmed' 
        AND appointment_type = 'online' 
        AND (meeting_link IS NULL OR meeting_link = '')
      `);

      console.log(`📞 Found ${result.rows.length} confirmed online appointments without meeting links`);

      const updatedAppointments = [];

      for (const appointment of result.rows) {
        try {
          const updated = await this.ensureMeetingLink(appointment.appointment_id);
          updatedAppointments.push(updated);
        } catch (error) {
          console.error(`Failed to generate meeting link for appointment ${appointment.appointment_id}:`, error);
        }
      }

      console.log(`✅ Generated meeting links for ${updatedAppointments.length} appointments`);
      return updatedAppointments;

    } catch (error) {
      console.error('Error generating links for confirmed appointments:', error);
      throw error;
    }
  }

  // Get meeting information for an appointment
  static async getMeetingInfo(appointmentId) {
    try {
      const result = await pool.query(`
        SELECT 
          a.appointment_id,
          a.meeting_link,
          a.appointment_type,
          a.status,
          a.date_time,
          d.user_id as doctor_user_id,
          e.user_id as elder_user_id,
          du.name as doctor_name,
          du.email as doctor_email,
          eu.name as elder_name,
          eu.email as elder_email
        FROM appointment a
        LEFT JOIN doctor d ON a.doctor_id = d.doctor_id
        LEFT JOIN elder e ON a.elder_id = e.elder_id
        LEFT JOIN "User" du ON d.user_id = du.user_id
        LEFT JOIN "User" eu ON e.user_id = eu.user_id
        WHERE a.appointment_id = $1
      `, [appointmentId]);

      if (result.rows.length === 0) {
        throw new Error('Appointment not found');
      }

      const appointment = result.rows[0];

      if (appointment.appointment_type !== 'online' || appointment.status !== 'confirmed') {
        throw new Error('Meeting not available for this appointment');
      }

      if (!appointment.meeting_link) {
        throw new Error('No meeting link available');
      }

      // Parse the meeting link to get room name
      const url = new URL(appointment.meeting_link);
      const roomName = url.pathname.substring(1); // Remove leading slash

      return {
        meetingId: roomName,
        roomName,
        meetingLink: appointment.meeting_link,
        doctorUrl: `${appointment.meeting_link}?userInfo.displayName=Dr.${appointment.doctor_name}&userInfo.email=${appointment.doctor_email}`,
        patientUrl: `${appointment.meeting_link}?userInfo.displayName=${appointment.elder_name}&userInfo.email=${appointment.elder_email}`,
        appointment: {
          id: appointment.appointment_id,
          dateTime: appointment.date_time,
          status: appointment.status,
          type: appointment.appointment_type
        },
        participants: {
          doctor: {
            name: appointment.doctor_name,
            email: appointment.doctor_email
          },
          patient: {
            name: appointment.elder_name,
            email: appointment.elder_email
          }
        }
      };

    } catch (error) {
      console.error('Error getting meeting info:', error);
      throw error;
    }
  }
}

module.exports = MeetingService;
