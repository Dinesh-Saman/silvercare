import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';

const JitsiMeetingRoom = () => {
  const { meetingId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [meetingInfo, setMeetingInfo] = useState(null);
  
  const jitsiContainerRef = useRef(null);
  const jitsiApi = useRef(null);

  // Get URL parameters
  const doctorId = searchParams.get('doctor');
  const patientId = searchParams.get('patient');
  const userRole = searchParams.get('role');
  const appointmentId = searchParams.get('appointment');

  // Determine current user info
  const getCurrentUser = () => {
    if (userRole === 'patient') {
      return {
        type: 'patient',
        id: patientId || 'patient',
        name: `Patient ${patientId || 'User'}`,
        displayName: 'Patient'
      };
    } else if (userRole === 'doctor') {
      return {
        type: 'doctor', 
        id: doctorId || 'doctor',
        name: `Dr. ${doctorId || 'Doctor'}`,
        displayName: 'Doctor'
      };
    }
    return {
      type: 'participant', 
      id: 'user',
      name: 'Participant',
      displayName: 'Participant'
    };
  };

  const currentUser = getCurrentUser();

  useEffect(() => {
    loadJitsiScript();
    return () => {
      if (jitsiApi.current) {
        jitsiApi.current.dispose();
      }
    };
  }, []);

  const loadJitsiScript = () => {
    // Check if Jitsi script is already loaded
    if (window.JitsiMeetExternalAPI) {
      initializeJitsi();
      return;
    }

    // Load Jitsi script
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => {
      initializeJitsi();
    };
    script.onerror = () => {
      setError('Failed to load Jitsi Meet. Please check your internet connection.');
    };
    document.head.appendChild(script);
  };

  const initializeJitsi = () => {
    if (!window.JitsiMeetExternalAPI) {
      setError('Jitsi Meet API not available');
      return;
    }

    // Generate unique room name based on meeting ID and current time
    const roomName = `silvercare-${meetingId}-${appointmentId || Date.now()}`;
    
    // Set meeting info
    setMeetingInfo({
      roomName,
      meetingId,
      publicUrl: `https://meet.jit.si/${roomName}`
    });

    const domain = 'meet.jit.si';
    const options = {
      roomName: roomName,
      width: '100%',
      height: '600px',
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: `${currentUser.displayName} ${currentUser.id}`,
        email: userRole === 'doctor' ? `doctor${doctorId}@silvercare.com` : `patient${patientId}@silvercare.com`
      },
      configOverwrite: {
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        enableClosePage: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        toolbarButtons: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'embedmeeting',
          'fullscreen', 'fodeviceselection', 'hangup', 'profile', 'chat',
          'recording', 'livestreaming', 'etherpad', 'sharedvideo', 'settings',
          'raisehand', 'videoquality', 'filmstrip', 'invite', 'feedback',
          'stats', 'shortcuts', 'tileview', 'videobackgroundblur', 'download',
          'help', 'mute-everyone', 'security'
        ]
      },
      interfaceConfigOverwrite: {
        BRAND_WATERMARK_LINK: '',
        SHOW_BRAND_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_WELCOME_PAGE_LOGO_URL: '',
        SHOW_POWERED_BY: false,
        DISPLAY_WELCOME_PAGE_CONTENT: false,
        APP_NAME: 'SilverCare Medical Consultation',
        NATIVE_APP_NAME: 'SilverCare',
        PROVIDER_NAME: 'SilverCare Healthcare',
        LANG_DETECTION: true,
        CONNECTION_INDICATOR_AUTO_HIDE_ENABLED: true,
        CONNECTION_INDICATOR_AUTO_HIDE_TIMEOUT: 5000,
        MAXIMUM_ZOOMING_COEFFICIENT: 1.3,
        FILM_STRIP_MAX_HEIGHT: 120,
        ENABLE_FEEDBACK_ANIMATION: false,
        DISABLE_FOCUS_INDICATOR: false,
        DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
        DISABLE_TRANSCRIPTION_SUBTITLES: false,
        DISABLE_RINGING: false,
        AUDIO_LEVEL_PRIMARY_COLOR: "rgba(255,255,255,0.4)",
        AUDIO_LEVEL_SECONDARY_COLOR: "rgba(255,255,255,0.2)",
        POLICY_LOGO: null,
        LOCAL_THUMBNAIL_RATIO: 16 / 9,
        REMOTE_THUMBNAIL_RATIO: 1,
        LIVE_STREAMING_HELP_LINK: 'https://jitsi.org/live',
        MOBILE_APP_PROMO: false,
        TOOLBAR_TIMEOUT: 4000,
        INITIAL_TOOLBAR_TIMEOUT: 20000,
        TOOLBAR_ALWAYS_VISIBLE: false,
        DEFAULT_BACKGROUND: '#040404',
        DISABLE_VIDEO_BACKGROUND: false,
        OPTIMAL_BROWSERS: [ 'chrome', 'chromium', 'firefox', 'nwjs', 'electron', 'safari' ],
        UNSUPPORTED_BROWSERS: [],
        MOBILE_DOWNLOAD_LINK_ANDROID: 'https://play.google.com/store/apps/details?id=org.jitsi.meet',
        MOBILE_DOWNLOAD_LINK_F_DROID: 'https://f-droid.org/en/packages/org.jitsi.meet/',
        MOBILE_DOWNLOAD_LINK_IOS: 'https://itunes.apple.com/us/app/jitsi-meet/id1165103905'
      }
    };

    try {
      jitsiApi.current = new window.JitsiMeetExternalAPI(domain, options);
      
      // Event listeners
      jitsiApi.current.addEventListener('ready', () => {
        console.log('Jitsi Meet is ready');
        setIsLoaded(true);
      });

      jitsiApi.current.addEventListener('participantJoined', (participant) => {
        console.log('Participant joined:', participant);
      });

      jitsiApi.current.addEventListener('participantLeft', (participant) => {
        console.log('Participant left:', participant);
      });

      jitsiApi.current.addEventListener('videoConferenceJoined', (participant) => {
        console.log('Local participant joined:', participant);
      });

      jitsiApi.current.addEventListener('videoConferenceLeft', () => {
        console.log('Local participant left');
        navigate('/');
      });

    } catch (error) {
      console.error('Error initializing Jitsi:', error);
      setError('Failed to initialize video meeting. Please refresh the page.');
    }
  };

  const copyMeetingLink = () => {
    if (meetingInfo) {
      navigator.clipboard.writeText(meetingInfo.publicUrl).then(() => {
        alert('Meeting link copied to clipboard!');
      });
    }
  };

  const shareMeetingLink = () => {
    if (meetingInfo && navigator.share) {
      navigator.share({
        title: 'SilverCare Medical Consultation',
        text: 'Join the medical consultation',
        url: meetingInfo.publicUrl
      });
    } else if (meetingInfo) {
      copyMeetingLink();
    }
  };

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <h2 style={{ color: '#d32f2f', marginBottom: '20px' }}>❌ Meeting Error</h2>
          <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#1976d2',
        color: 'white',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>🏥 SilverCare Medical Consultation</h1>
          <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
            Joined as: {currentUser.type === 'doctor' ? '👨‍⚕️' : '🧑‍🦳'} {currentUser.displayName}
          </p>
        </div>
        <div>
          {meetingInfo && (
            <button
              onClick={shareMeetingLink}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '8px 16px',
                borderRadius: '5px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              📋 Share Link
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            style={{
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🚪 Leave
          </button>
        </div>
      </div>

      {/* Meeting Info */}
      {meetingInfo && (
        <div style={{
          backgroundColor: '#e3f2fd',
          padding: '15px 20px',
          borderBottom: '1px solid #ddd'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <strong>📞 Meeting ID:</strong> {meetingInfo.meetingId}
            </div>
            <div>
              <strong>🔗 Public Link:</strong> 
              <a 
                href={meetingInfo.publicUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#1976d2', marginLeft: '5px' }}
              >
                {meetingInfo.publicUrl}
              </a>
            </div>
            <button
              onClick={copyMeetingLink}
              style={{
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              📋 Copy Link
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {!isLoaded && !error && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '400px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #1976d2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '20px', color: '#666' }}>Loading secure video meeting...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Jitsi Meeting Container */}
      <div 
        ref={jitsiContainerRef}
        style={{
          width: '100%',
          height: isLoaded ? '600px' : '0px',
          overflow: 'hidden'
        }}
      />

      {/* Instructions */}
      {isLoaded && (
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h3>📋 Meeting Instructions</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <div>
              <strong>🎥 Camera & Audio:</strong><br />
              Use the toolbar buttons to control your camera and microphone
            </div>
            <div>
              <strong>💬 Chat:</strong><br />
              Click the chat icon to send messages to all participants
            </div>
            <div>
              <strong>📱 Screen Sharing:</strong><br />
              Use the screen share button to show documents or presentations
            </div>
            <div>
              <strong>🔗 Invite Others:</strong><br />
              Share the public meeting link with anyone who needs to join
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JitsiMeetingRoom;
