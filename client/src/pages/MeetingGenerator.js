import React, { useState } from 'react';
import axios from 'axios';

const MeetingGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [meetingData, setMeetingData] = useState(null);
  const [error, setError] = useState(null);

  const generateMeeting = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post('http://localhost:5000/api/meetings/quick-meeting');
      
      if (response.data.success) {
        setMeetingData(response.data.meeting);
      } else {
        setError('Failed to generate meeting');
      }
    } catch (error) {
      console.error('Error generating meeting:', error);
      setError('Failed to create meeting. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#1976d2',
        color: 'white',
        padding: '20px',
        borderRadius: '10px 10px 0 0',
        textAlign: 'center'
      }}>
        <h1>🏥 SilverCare Meeting Generator</h1>
        <p>Generate secure, public meeting links for doctor-patient consultations</p>
      </div>

      <div style={{
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderTop: 'none',
        padding: '30px',
        borderRadius: '0 0 10px 10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        
        {!meetingData ? (
          <div style={{ textAlign: 'center' }}>
            <h2>Generate New Meeting</h2>
            <p>Create a unique meeting room that works on any device, anywhere in the world.</p>
            
            <div style={{
              backgroundColor: '#f5f5f5',
              padding: '20px',
              borderRadius: '5px',
              marginBottom: '20px',
              textAlign: 'left'
            }}>
              <h3>✨ Features:</h3>
              <ul>
                <li>🌍 <strong>Public Access:</strong> No login required</li>
                <li>🔗 <strong>Unique Links:</strong> Each meeting gets a unique URL</li>
                <li>📱 <strong>Cross-Platform:</strong> Works on any device with a browser</li>
                <li>🔒 <strong>Secure:</strong> End-to-end encrypted video calls</li>
                <li>⚡ <strong>Instant:</strong> Join immediately via link</li>
                <li>💬 <strong>Full Featured:</strong> Chat, screen share, recording</li>
              </ul>
            </div>

            <button
              onClick={generateMeeting}
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? '#ccc' : '#4caf50',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                fontSize: '18px',
                borderRadius: '5px',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? '⏳ Generating...' : '🚀 Generate Meeting'}
            </button>

            {error && (
              <div style={{
                backgroundColor: '#ffebee',
                color: '#c62828',
                padding: '15px',
                borderRadius: '5px',
                marginTop: '20px'
              }}>
                ❌ {error}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2>✅ Meeting Generated Successfully!</h2>
            
            <div style={{
              backgroundColor: '#e8f5e8',
              padding: '20px',
              borderRadius: '5px',
              marginBottom: '20px'
            }}>
              <div style={{ marginBottom: '15px' }}>
                <strong>📞 Meeting ID:</strong> {meetingData.meetingId}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <strong>📅 Created:</strong> {new Date(meetingData.createdAt).toLocaleString()}
              </div>
            </div>

            {/* Public Universal Link */}
            <div style={{
              backgroundColor: '#fff3e0',
              padding: '20px',
              borderRadius: '5px',
              marginBottom: '20px',
              border: '2px solid #ff9800'
            }}>
              <h3>🌍 Universal Public Link (Recommended)</h3>
              <p>This link works for anyone, anywhere - no app needed!</p>
              <div style={{
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <input
                  type="text"
                  value={meetingData.publicUrl}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '3px'
                  }}
                />
                <button
                  onClick={() => copyToClipboard(meetingData.publicUrl)}
                  style={{
                    backgroundColor: '#ff9800',
                    color: 'white',
                    border: 'none',
                    padding: '10px 15px',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  📋 Copy
                </button>
                <a
                  href={meetingData.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#4caf50',
                    color: 'white',
                    textDecoration: 'none',
                    padding: '10px 15px',
                    borderRadius: '3px'
                  }}
                >
                  🚀 Join Now
                </a>
              </div>
            </div>

            {/* Doctor Link */}
            <div style={{
              backgroundColor: '#e8f5e8',
              padding: '20px',
              borderRadius: '5px',
              marginBottom: '15px'
            }}>
              <h3>👨‍⚕️ Doctor Link</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="text"
                  value={meetingData.doctorDirectUrl}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '3px'
                  }}
                />
                <button
                  onClick={() => copyToClipboard(meetingData.doctorDirectUrl)}
                  style={{
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    padding: '10px 15px',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  📋 Copy
                </button>
              </div>
            </div>

            {/* Patient Link */}
            <div style={{
              backgroundColor: '#e3f2fd',
              padding: '20px',
              borderRadius: '5px',
              marginBottom: '20px'
            }}>
              <h3>🧑‍🦳 Patient Link</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="text"
                  value={meetingData.patientDirectUrl}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '3px'
                  }}
                />
                <button
                  onClick={() => copyToClipboard(meetingData.patientDirectUrl)}
                  style={{
                    backgroundColor: '#2196f3',
                    color: 'white',
                    border: 'none',
                    padding: '10px 15px',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  📋 Copy
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div style={{
              backgroundColor: '#f5f5f5',
              padding: '20px',
              borderRadius: '5px',
              marginBottom: '20px'
            }}>
              <h3>📋 Instructions</h3>
              <ol>
                <li><strong>Universal Link:</strong> Share the public link with anyone - works on any device</li>
                <li><strong>Role-Specific Links:</strong> Use doctor/patient links to join with pre-set names</li>
                <li><strong>No Installation:</strong> Everything works in the web browser</li>
                <li><strong>Global Access:</strong> Links work from anywhere in the world</li>
                <li><strong>Security:</strong> Meetings are encrypted and temporary</li>
              </ol>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setMeetingData(null)}
                style={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                🔄 Generate Another Meeting
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingGenerator;
