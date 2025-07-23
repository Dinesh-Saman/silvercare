const meetingService = require('../services/meetingService');

class MeetingScheduler {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
  }

  /**
   * Start the meeting scheduler
   * Runs every 5 minutes to check for appointments that need meeting links
   */
  start() {
    if (this.isRunning) {
      console.log('Meeting scheduler is already running');
      return;
    }

    console.log('Starting meeting scheduler...');
    this.isRunning = true;

    // Run immediately on start
    this.processUpcomingAppointments();

    // Then run every 5 minutes
    this.intervalId = setInterval(() => {
      this.processUpcomingAppointments();
    }, 5 * 60 * 1000); // 5 minutes

    console.log('Meeting scheduler started - checking every 5 minutes');
  }

  /**
   * Stop the meeting scheduler
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Meeting scheduler stopped');
  }

  /**
   * Process upcoming appointments and generate meeting links
   */
  async processUpcomingAppointments() {
    try {
      console.log('Checking for appointments that need meeting links...');
      
      const updatedAppointments = await meetingService.generateLinksForUpcomingAppointments();
      
      if (updatedAppointments.length > 0) {
        console.log(`Generated meeting links for ${updatedAppointments.length} appointments:`);
        updatedAppointments.forEach(appointment => {
          console.log(`- Appointment ID: ${appointment.appointment_id}, Meeting: ${appointment.meeting_link}`);
        });
      } else {
        console.log('No appointments found that need meeting links');
      }
    } catch (error) {
      console.error('Error processing upcoming appointments:', error);
    }
  }

  /**
   * Manually trigger meeting link generation (for testing)
   */
  async triggerNow() {
    console.log('Manually triggering meeting link generation...');
    await this.processUpcomingAppointments();
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalId: this.intervalId !== null
    };
  }
}

module.exports = new MeetingScheduler();
