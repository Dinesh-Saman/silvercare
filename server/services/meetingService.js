const crypto = require('crypto');
const pool = require('../db');

class MeetingService {
  /**
   * Generate a unique meeting room ID
   * @param {number} appointmentId - The appointment ID
   * @param {number} doctorId - The doctor ID  
   * @param {number} elderId - The elder ID
   * @returns {string} - Unique room ID
   */
  generateRoomId(appointmentId, doctorId, elderId) {
    // Create a truly unique room ID to avoid authentication issues
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const hash = crypto.createHash('sha256')
      .update(`${appointmentId}-${doctorId}-${elderId}-${timestamp}-${random}`)
      .digest('hex')
      .substring(0, 16);
    
    // Use a simpler format that's less likely to trigger Jitsi authentication
    return `sc-${doctorId}-${elderId}-${hash}`;
  }

  /**
   * Generate Jitsi Meet link for an appointment
   * @param {number} appointmentId - The appointment ID
   * @param {number} doctorId - The doctor ID
   * @param {number} elderId - The elder ID
   * @param {string} doctorName - The doctor's name
   * @param {string} elderName - The elder's name
   * @returns {object} - Meeting details
   */
  generateMeetingLink(appointmentId, doctorId, elderId, doctorName, elderName) {
    const roomId = this.generateRoomId(appointmentId, doctorId, elderId);
    
    // Jitsi Meet URL - using meet.jit.si (free service) with config to avoid auth
    const baseUrl = 'https://meet.jit.si';
    const meetingUrl = `${baseUrl}/${roomId}`;
    
    // Add configuration parameters to avoid authentication requirements
    const configParams = [
      'config.prejoinPageEnabled=false',
      'config.requireDisplayName=false', 
      'config.disableProfile=true',
      'config.startWithAudioMuted=false',
      'config.startWithVideoMuted=false'
    ].join('&');
    
    const meetingUrlWithConfig = `${meetingUrl}#${configParams}`;
    
    return {
      roomId,
      meetingUrl: meetingUrlWithConfig,
      joinUrl: meetingUrlWithConfig,
      platform: 'Jitsi Meet',
      doctorJoinUrl: `${meetingUrl}?userInfo.displayName=${encodeURIComponent(`Dr. ${doctorName}`)}&${configParams}`,
      elderJoinUrl: `${meetingUrl}?userInfo.displayName=${encodeURIComponent(elderName)}&${configParams}`,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Update appointment with meeting link
   * @param {number} appointmentId - The appointment ID
   * @param {string} meetingLink - The meeting URL
   * @returns {Promise} - Database update result
   */
  async updateAppointmentMeetingLink(appointmentId, meetingLink) {
    try {
      const result = await pool.query(
        'UPDATE appointment SET meeting_link = $1 WHERE appointment_id = $2 RETURNING *',
        [meetingLink, appointmentId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating appointment meeting link:', error);
      throw error;
    }
  }

  /**
   * Generate meeting links for ONLINE appointments starting within the next 15 minutes
   * @returns {Promise<Array>} - Array of updated appointments
   */
  async generateLinksForUpcomingAppointments() {
    try {
      // Find ONLINE appointments starting in the next 15 minutes that don't have meeting links
      const result = await pool.query(`
        SELECT 
          a.appointment_id,
          a.elder_id,
          a.doctor_id,
          a.date_time,
          a.appointment_type,
          a.meeting_link,
          e.name as elder_name,
          d.user_id as doctor_user_id,
          u.name as doctor_name
        FROM appointment a
        LEFT JOIN elder e ON a.elder_id = e.elder_id
        LEFT JOIN doctor d ON a.doctor_id = d.doctor_id
        LEFT JOIN "User" u ON d.user_id = u.user_id
        WHERE a.status = 'confirmed'
        AND a.appointment_type = 'online'
        AND a.date_time BETWEEN NOW() AND NOW() + INTERVAL '15 minutes'
        AND (a.meeting_link IS NULL OR a.meeting_link = '')
      `);

      const updatedAppointments = [];

      for (const appointment of result.rows) {
        try {
          // Generate meeting link
          const meetingDetails = this.generateMeetingLink(
            appointment.appointment_id,
            appointment.doctor_id,
            appointment.elder_id,
            appointment.doctor_name || 'Doctor',
            appointment.elder_name || 'Patient'
          );

          // Store the meeting URL in the database
          const updated = await this.updateAppointmentMeetingLink(
            appointment.appointment_id,
            meetingDetails.meetingUrl
          );

          updatedAppointments.push({
            ...updated,
            meetingDetails
          });

          console.log(`Generated meeting link for appointment ${appointment.appointment_id}: ${meetingDetails.meetingUrl}`);
        } catch (error) {
          console.error(`Error generating meeting link for appointment ${appointment.appointment_id}:`, error);
        }
      }

      return updatedAppointments;
    } catch (error) {
      console.error('Error generating meeting links for upcoming appointments:', error);
      throw error;
    }
  }

  /**
   * Get ONLINE appointments that should have join buttons available (within 15 minutes or ongoing)
   * @param {number} doctorId - The doctor ID
   * @returns {Promise<Array>} - Array of appointments with meeting links
   */
  async getJoinableAppointments(doctorId) {
    try {
      const result = await pool.query(`
        SELECT 
          a.appointment_id,
          a.elder_id,
          a.doctor_id,
          a.date_time,
          a.appointment_type,
          a.meeting_link,
          a.status,
          e.name as elder_name
        FROM appointment a
        LEFT JOIN elder e ON a.elder_id = e.elder_id
        WHERE a.doctor_id = $1
        AND a.status = 'confirmed'
        AND a.appointment_type = 'online'
        AND a.meeting_link IS NOT NULL
        AND a.meeting_link != ''
        AND a.date_time BETWEEN NOW() - INTERVAL '15 minutes' AND NOW() + INTERVAL '2 hours'
        ORDER BY a.date_time ASC
      `, [doctorId]);

      return result.rows;
    } catch (error) {
      console.error('Error fetching joinable appointments:', error);
      throw error;
    }
  }

  /**
   * Check if appointment is within join window (15 minutes before to 2 hours after)
   * @param {Date} appointmentTime - The appointment time
   * @returns {boolean} - Whether the appointment is joinable
   */
  isWithinJoinWindow(appointmentTime) {
    const now = new Date();
    const appointmentDate = new Date(appointmentTime);
    const fifteenMinutesBefore = new Date(appointmentDate.getTime() - 15 * 60 * 1000);
    const twoHoursAfter = new Date(appointmentDate.getTime() + 2 * 60 * 60 * 1000);

    return now >= fifteenMinutesBefore && now <= twoHoursAfter;
  }
}

module.exports = new MeetingService();
