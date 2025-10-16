import React from 'react';
import styles from './OnlineMeetingInterface.module.css';

const OnlineMeetingInterface = ({ 
  appointment, 
  onJoinMeeting, 
  isJoining, 
  hasJoined, 
  meetingLink 
}) => {
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTimeRemaining = (dateTime) => {
    const now = new Date();
    const appointmentTime = new Date(dateTime);
    const timeDiff = appointmentTime.getTime() - now.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    if (minutesDiff > 15) {
      return {
        text: `Starts in ${Math.floor(minutesDiff / 60)}h ${minutesDiff % 60}m`,
        canJoin: false,
        status: 'waiting'
      };
    } else if (minutesDiff > 0) {
      return {
        text: `Starting in ${minutesDiff} minutes`,
        canJoin: true,
        status: 'ready'
      };
    } else if (minutesDiff > -60) {
      return {
        text: `Started ${Math.abs(minutesDiff)} minutes ago`,
        canJoin: true,
        status: 'active'
      };
    } else {
      return {
        text: 'Meeting ended',
        canJoin: false,
        status: 'ended'
      };
    }
  };

  const timeInfo = getTimeRemaining(appointment.date_time);

  return (
    <div className={styles.meetingInterface}>
      <div className={styles.meetingHeader}>
        <div className={styles.meetingType}>
          <span className={styles.typeIcon}>💻</span>
          <span className={styles.typeText}>Online Consultation</span>
        </div>
        <div className={styles.meetingStatus}>
          <span className={`${styles.statusIndicator} ${styles[timeInfo.status]}`}>
            {timeInfo.status === 'waiting' && '⏰'}
            {timeInfo.status === 'ready' && '🟢'}
            {timeInfo.status === 'active' && '🔴'}
            {timeInfo.status === 'ended' && '⏹️'}
          </span>
          <span className={styles.statusText}>{timeInfo.text}</span>
        </div>
      </div>

      <div className={styles.patientInfo}>
        <div className={styles.patientAvatar}>
          <span className={styles.avatarIcon}>👤</span>
        </div>
        <div className={styles.patientDetails}>
          <h3 className={styles.patientName}>{appointment.elder_name || appointment.patient_name}</h3>
          <p className={styles.appointmentTime}>
            {formatDate(appointment.date_time)} at {formatTime(appointment.date_time)}
          </p>
          {appointment.medical_conditions && (
            <p className={styles.medicalConditions}>
              <span className={styles.conditionsLabel}>Conditions:</span>
              {appointment.medical_conditions}
            </p>
          )}
        </div>
      </div>

      <div className={styles.meetingActions}>
        {!hasJoined && timeInfo.canJoin && (
          <button
            className={`${styles.joinButton} ${timeInfo.status === 'active' ? styles.urgent : ''}`}
            onClick={onJoinMeeting}
            disabled={isJoining}
          >
            {isJoining ? (
              <>
                <div className={styles.loadingSpinner}></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span className={styles.joinIcon}>🎥</span>
                <span>Join Meeting</span>
              </>
            )}
          </button>
        )}

        {hasJoined && meetingLink && (
          <div className={styles.meetingStarted}>
            <div className={styles.successIcon}>✅</div>
            <p className={styles.successMessage}>Meeting started successfully!</p>
            <button
              className={styles.rejoinButton}
              onClick={() => window.open(meetingLink, '_blank')}
            >
              <span className={styles.rejoinIcon}>🔄</span>
              Rejoin Meeting
            </button>
          </div>
        )}

        {!timeInfo.canJoin && timeInfo.status === 'waiting' && (
          <div className={styles.waitingMessage}>
            <div className={styles.waitingIcon}>⏰</div>
            <p>Meeting will be available 15 minutes before the scheduled time</p>
          </div>
        )}

        {!timeInfo.canJoin && timeInfo.status === 'ended' && (
          <div className={styles.endedMessage}>
            <div className={styles.endedIcon}>⏹️</div>
            <p>This meeting has ended</p>
          </div>
        )}
      </div>

      <div className={styles.meetingTips}>
        <h4 className={styles.tipsTitle}>💡 Meeting Tips</h4>
        <ul className={styles.tipsList}>
          <li>Ensure you have a stable internet connection</li>
          <li>Test your camera and microphone before starting</li>
          <li>Find a quiet, well-lit environment</li>
          <li>Have patient records and notes ready</li>
          <li>Be prepared to take detailed consultation notes</li>
        </ul>
      </div>
    </div>
  );
};

export default OnlineMeetingInterface;
