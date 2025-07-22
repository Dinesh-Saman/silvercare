// dashboard.js
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar';
import styles from "../../components/css/caregiver/dashboard.module.css";
import CaregiverLayout from '../../components/CaregiverLayout';
import caregiverApi from '../../services/caregiverApi2';
import { useAuth } from '../../context/AuthContext';

// Daily Report Form Component
const DailyReportForm = ({ onSubmit, elderName, existingReport }) => {
  const [formData, setFormData] = useState({
    notes: existingReport?.notes || '',
    mood: existingReport?.mood || '',
    health_status: existingReport?.health_status || '',
    medications_given: existingReport?.medications_given || '',
    activities: existingReport?.activities || '',
    concerns: existingReport?.concerns || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
      <div>
        <label style={{display: 'block', marginBottom: '8px', fontWeight: 600, color: '#4a5568'}}>
          General Notes:
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          required
          rows={3}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            resize: 'vertical'
          }}
          placeholder="Describe the elder's overall condition and activities today..."
        />
      </div>

      <div>
        <label style={{display: 'block', marginBottom: '8px', fontWeight: 600, color: '#4a5568'}}>
          Mood:
        </label>
        <select
          name="mood"
          value={formData.mood}
          onChange={handleChange}
          required
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        >
          <option value="">Select mood...</option>
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
          <option value="anxious">Anxious</option>
          <option value="confused">Confused</option>
        </select>
      </div>

      <div>
        <label style={{display: 'block', marginBottom: '8px', fontWeight: 600, color: '#4a5568'}}>
          Health Status:
        </label>
        <textarea
          name="health_status"
          value={formData.health_status}
          onChange={handleChange}
          rows={2}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            resize: 'vertical'
          }}
          placeholder="Any health concerns, symptoms, or improvements..."
        />
      </div>

      <div>
        <label style={{display: 'block', marginBottom: '8px', fontWeight: 600, color: '#4a5568'}}>
          Medications Given:
        </label>
        <textarea
          name="medications_given"
          value={formData.medications_given}
          onChange={handleChange}
          rows={2}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            resize: 'vertical'
          }}
          placeholder="List medications administered today..."
        />
      </div>

      <div>
        <label style={{display: 'block', marginBottom: '8px', fontWeight: 600, color: '#4a5568'}}>
          Activities:
        </label>
        <textarea
          name="activities"
          value={formData.activities}
          onChange={handleChange}
          rows={2}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            resize: 'vertical'
          }}
          placeholder="Activities performed, exercises, social interactions..."
        />
      </div>

      <div>
        <label style={{display: 'block', marginBottom: '8px', fontWeight: 600, color: '#4a5568'}}>
          Concerns:
        </label>
        <textarea
          name="concerns"
          value={formData.concerns}
          onChange={handleChange}
          rows={2}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            resize: 'vertical'
          }}
          placeholder="Any concerns or issues that need attention..."
        />
      </div>

      <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px'}}>
        <button
          type="button"
          onClick={() => {}}
          style={{
            padding: '12px 24px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            backgroundColor: 'white',
            color: '#4a5568',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: '#667eea',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Submit Report
        </button>
      </div>
    </form>
  );
};


const CaregiverDashboard = () => {
  const { user } = useAuth(); // <-- pulls from logged-in context
  const navigate = useNavigate();
  const [elders, setElders] = useState([]);
  const [careRequests, setCareRequests] = useState([]);
  const [carelog, setCarelogCount] = useState([]);
  const [completedShifts, setCompletedShifts] = useState(0);
  const [totalHoursWorked, setTotalHoursWorked] = useState(0);
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  // Upcoming shifts fetched from backend
  const [upcomingShifts, setUpcomingShifts] = useState([]);
  // Week-by-week filtering for confirmed shifts
  const [currentWeek, setCurrentWeek] = useState(0); // 0 = this week, 1 = next week, etc.
  const [weeklyShifts, setWeeklyShifts] = useState([]);
  const [loadingWeeklyShifts, setLoadingWeeklyShifts] = useState(false);
  
  // Daily care reports state
  const [currentReportWeek, setCurrentReportWeek] = useState(0);
  const [weeklyReports, setWeeklyReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportDay, setSelectedReportDay] = useState(null);

  // Helper to show time left in days/hours/minutes
  const getTimeLeft = (startDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const diffMs = start - now;
    
    // Get today's date without time for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDateOnly = new Date(start);
    startDateOnly.setHours(0, 0, 0, 0);
    
    // If start date equals today, show "Started"
    if (startDateOnly.getTime() === today.getTime()) {
      return 'Started';
    }
    
    // If start date is before today (overdue), show hours/minutes overdue
    if (startDateOnly < today) {
      const overdueDiffMs = Math.abs(diffMs);
      const overdueHours = Math.floor(overdueDiffMs / (1000 * 60 * 60));
      const overdueMinutes = Math.floor((overdueDiffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      let overdueResult = '';
      if (overdueHours > 0) overdueResult += `${overdueHours} hour${overdueHours !== 1 ? 's' : ''} `;
      if (overdueMinutes > 0) overdueResult += `${overdueMinutes} min${overdueMinutes !== 1 ? 's' : ''}`;
      
      return ` ${overdueResult.trim()}`;
    }
    
    // Future date - show normal countdown
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    let result = '';
    
    // Always show days (even if 0) when there are hours remaining
    if (diffDays > 0 || diffHours > 0) {
      result += `${diffDays} day${diffDays !== 1 ? 's' : ''} `;
    }
    
    // Show hours if there are any, or if days is 0 and we have time left
    if (diffHours > 0 || (diffDays === 0 && diffMs > 0)) {
      result += `${diffHours} hour${diffHours !== 1 ? 's' : ''} `;
    }
    
    // Only show minutes if less than 1 day and no hours
    if (diffDays === 0 && diffHours === 0 && diffMinutes > 0) {
      result += `${diffMinutes} min${diffMinutes !== 1 ? 's' : ''}`;
    }
    
    return result.trim() || '0 mins';
  };

  // Function to refresh all dashboard data
  const refreshDashboard = async () => {
    if (!user || !user.caregiver_id) return;
    
    setLoading(true);
    const caregiverId = user.caregiver_id;
    
    try {
      console.log('Refreshing dashboard data...');
      
      const results = await Promise.all([
        caregiverApi.fetchCareRequests(caregiverId),
        caregiverApi.fetchUpcomingShifts(caregiverId)
      ]);
      
      const [careRequestsData, upcomingShiftsData] = results;
      
      // Update care requests - this will get the latest status updates
      if (Array.isArray(careRequestsData)) {
        const pendingRequests = careRequestsData
          .filter(request => request.status === 'pending')
          .map((request) => ({
            requestId: request.request_id,
            elderName: request.elder_name,
            elderAge: request.elder_age,
            elderAddress: request.elder_address,
            elderContact: request.elder_contact,
            medicalConditions: request.medical_conditions,
            familyMemberName: request.family_member_name,
            familyMemberPhone: request.family_member_phone,
            familyMemberEmail: request.family_member_email,
            startDate: request.start_date,
            endDate: request.end_date,
            status: request.status,
            duration: request.duration,
            requestDate: request.request_date
          }));
        setCareRequests(pendingRequests);
        
        // Update completion stats
        const completedCount = careRequestsData.filter(request => request.status === 'completed').length;
        setCompletedShifts(completedCount);
      }
      
      // Update upcoming shifts
      setUpcomingShifts(upcomingShiftsData);
      
      // Refresh current week shifts
      await fetchWeeklyShifts(currentWeek);
      
      console.log('Dashboard refreshed successfully - expired requests updated');
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!user || !user.caregiver_id) return;
    const caregiverId = user.caregiver_id;
    setLoading(true);
    Promise.all([
      caregiverApi.fetchAssignedElders(caregiverId).then((data) => {
        console.log('Raw elder data from API:', data);
        const transformed = data.map((elder) => ({
          elder_id: elder.elder_id, // Add this missing field!
          name: elder.name,
          age: elder.age,
          duration: elder.duration || "N/A",
          status: elder.status,
          family_id: elder.family_id,
        }));
        console.log('Transformed elder data:', transformed);
        setElders(transformed);
      }),
      caregiverApi.getAssignedFamiliesCount(caregiverId).then((data) => {
        const count = Number(data.count);
        if (!isNaN(count)) {
          const dummyFamilies = Array.from({ length: count }, (_, i) => ({
            elder: `Family ${i + 1}`
          }));
          setFamilies(dummyFamilies);
        } else {
          setFamilies([]);
        }
      }),
      caregiverApi.getcarelogsCount(caregiverId).then((data) => {
        const count = Number(data.count);
        if (!isNaN(count)) {
          setCarelogCount(count);
        } else {
          setCarelogCount(0);
        }
      }).catch(error => {
        setCarelogCount(0);
      }),
      caregiverApi.fetchCareRequests(caregiverId).then((data) => {
        // Get all family IDs from carerequest table for this caregiver, status approved or completed
        const allFamilyIds = Array.isArray(data)
          ? data.filter(request => request.status === 'confirmed' || request.status === 'completed')
              .map(request => request.family_id)
              .filter(Boolean)
          : [];
        // Get unique family IDs
        const uniqueFamilyIdsFromRequests = Array.from(new Set(allFamilyIds));
        setFamilies(uniqueFamilyIdsFromRequests);

        // Count completed shifts
        const completedCount = Array.isArray(data)
          ? data.filter(request => request.status === 'completed').length
          : 0;
        setCompletedShifts(completedCount);

        // Calculate total hours worked
        let totalHours = 0;
        if (Array.isArray(data)) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          data.forEach(request => {
            if (request.status === 'completed') {
              // duration is in days, multiply by 24
              const days = Number(request.duration);
              if (!isNaN(days)) {
                totalHours += days * 24;
                console.log(`Completed request ${request.request_id}: days=${days}, hours=${days * 24}`);
              } else if (request.start_date && request.end_date) {
                // fallback: calculate days from dates
                const start = new Date(request.start_date);
                const end = new Date(request.end_date);
                const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
                totalHours += diffDays * 24;
                console.log(`Completed request ${request.request_id}: days=${diffDays}, hours=${diffDays * 24} (from dates)`);
              }
            } else if (request.status === 'confirmed') {
              // calculate hours from start_date to day before today (inclusive)
              if (request.start_date) {
                const start = new Date(request.start_date);
                start.setHours(0, 0, 0, 0);
                let end = new Date(today);
                end.setDate(end.getDate() - 1); // day before today
                end.setHours(0, 0, 0, 0);
                if (end >= start) {
                  // Calculate days inclusive
                  const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
                  const diffHours = diffDays * 24;
                  totalHours += diffHours > 0 ? diffHours : 0;
                  console.log(`Confirmed request ${request.request_id}: days=${diffDays}, hours=${diffHours}`);
                }
              }
            }
          });
        }
        setTotalHoursWorked(totalHours);

        // Keep your existing careRequests logic
        const transformed = Array.isArray(data)
          ? data.filter(request => request.status === 'pending')
            .map((request) => ({
              requestId: request.request_id,
              elderName: request.elder_name,
              elderAge: request.elder_age,
              elderAddress: request.elder_address,
              elderContact: request.elder_contact,
              medicalConditions: request.medical_conditions,
              familyMemberName: request.family_member_name,
              familyMemberPhone: request.family_member_phone,
              familyMemberEmail: request.family_member_email,
              startDate: request.start_date,
              endDate: request.end_date,
              status: request.status,
              duration: request.duration,
              requestDate: request.request_date
            }))
          : [];
        setCareRequests(transformed);
      }),
      caregiverApi.fetchUpcomingShifts(caregiverId).then((data) => {
        setUpcomingShifts(data);
        console.log('Upcoming shifts raw data:', data);
        console.log('First shift details:', data[0]);
      })
      
    ]).then(() => {
      setLoading(false);
    });
  }, []);

  // Helper function to calculate week range
  const getWeekRange = (weekOffset = 0) => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + 1 + weekOffset * 7); // Monday
    start.setHours(0,0,0,0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Sunday
    end.setHours(23,59,59,999);
    return { start, end };
  };

  // Function to fetch shifts for a specific week
  const fetchWeeklyShifts = async (weekOffset) => {
    if (!user || !user.caregiver_id) return;
    
    console.log(`Fetching shifts for week offset: ${weekOffset}`);
    setLoadingWeeklyShifts(true);
    const { start, end } = getWeekRange(weekOffset);
    
    console.log(`Week range: ${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`);
    
    try {
      const data = await caregiverApi.fetchUpcomingShifts(
        user.caregiver_id,
        start.toISOString().split('T')[0], // Format as YYYY-MM-DD
        end.toISOString().split('T')[0]
      );
      console.log(`Week ${weekOffset} shifts data:`, data);
      setWeeklyShifts(data);
    } catch (error) {
      console.error('Error fetching weekly shifts:', error);
      setWeeklyShifts([]);
    } finally {
      setLoadingWeeklyShifts(false);
    }
  };

  // Function to fetch daily reports for a specific week
  const fetchWeeklyReports = async (weekOffset) => {
    if (!user || !user.caregiver_id) return;
    
    console.log(`Fetching daily reports for week offset: ${weekOffset}`);
    setLoadingReports(true);
    const { start, end } = getWeekRange(weekOffset);
    
    try {
      const data = await caregiverApi.fetchWeeklyReports(
        user.caregiver_id,
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0]
      );
      console.log(`Week ${weekOffset} reports data:`, data);
      setWeeklyReports(data);
    } catch (error) {
      console.error('Error fetching weekly reports:', error);
      setWeeklyReports([]);
    } finally {
      setLoadingReports(false);
    }
  };

  // Handle daily report submission
  const handleReportSubmit = async (reportData) => {
    try {
      await caregiverApi.submitDailyReport(user.caregiver_id, selectedReportDay.elder_id, {
        ...reportData,
        date: selectedReportDay.date
      });
      
      // Show success message
      alert('Report submitted successfully!');
      
      // Close modal and refresh reports
      setShowReportModal(false);
      setSelectedReportDay(null);
      fetchWeeklyReports(currentReportWeek);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    }
  };

  // Handle opening report modal
  const handleReportBoxClick = (dayData) => {
    setSelectedReportDay(dayData);
    setShowReportModal(true);
  };

  // Fetch shifts when currentWeek changes
  useEffect(() => {
    console.log('currentWeek changed to:', currentWeek);
    fetchWeeklyShifts(currentWeek);
  }, [currentWeek, user]);

  // Fetch daily reports when currentReportWeek changes
  useEffect(() => {
    console.log('currentReportWeek changed to:', currentReportWeek);
    fetchWeeklyReports(currentReportWeek);
  }, [currentReportWeek, user]);


  // --- Week-by-week filtering for confirmed shifts ---

  // Only show confirmed shifts from the general upcoming shifts for summary card
  const confirmedShifts = useMemo(() =>
    upcomingShifts.filter(s => s.status && s.status.toLowerCase() === 'confirmed'),
    [upcomingShifts]
  );

  const { start: weekStart, end: weekEnd } = getWeekRange(currentWeek);

  // Format dates with month names (no year)
  const formatDateWithMonth = (date) => {
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Generate week label with improved formatting
  const getWeekLabel = (weekOffset) => {
    if (weekOffset === 0) return "This Week";
    if (weekOffset === 1) return "Next Week";
    if (weekOffset === -1) return "Last Week";
    return null; // No label for other weeks
  };

  const weekLabel = getWeekLabel(currentWeek);
  const dateRange = `${formatDateWithMonth(weekStart)} - ${formatDateWithMonth(weekEnd)}`;
  
  // Format the display: show brackets only for This Week, Next Week, Last Week
  const weekRangeLabel = weekLabel ? `${dateRange} (${weekLabel})` : dateRange;
  
  // Allow going back in weeks (don't restrict to future only)
  const isPrevWeekDisabled = false; // Allow navigation to past weeks
  
  // Remove week limit - allow unlimited navigation
  const isNextWeekDisabled = false;

  // Filter elders with status 'approved' or 'completed'
  const filteredElders = elders.filter(e => e.status === 'confirmed' || e.status === 'completed');
  // Get unique family IDs from filtered elders
  //const uniqueFamilyIds = Array.from(new Set(filteredElders.map(e => e.family_id))).filter(Boolean);

  // For summary card: count of upcoming confirmed shifts in all future weeks
  const filteredUpcomingShifts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return confirmedShifts.filter(shift => {
      const start = new Date(shift.startDate || shift.start_date);
      start.setHours(0, 0, 0, 0);
      return start >= today;
    });
  }, [confirmedShifts]);

  const dashboardContent = (
    <div className={styles.dashboard}>
      <div className={styles.summarycards}>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <span role="img" aria-label="Elders">👥</span>
          </div>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Elders</span>
            <span className={styles.cardNumber}>{filteredElders.length}</span>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)'}}>
            <span role="img" aria-label="Families">👨‍👩‍👧‍👦</span>
          </div>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Families</span>
            <span className={styles.cardNumber}>{families.length}</span>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{background: 'linear-gradient(135deg, #ffb347 0%, #ffcc33 100%)'}}>
            <span role="img" aria-label="Carelogs">📝</span>
          </div>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Carelogs</span>
            <span className={styles.cardNumber}>{carelog}</span>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <span role="img" aria-label="Upcoming">📅</span>
          </div>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Upcoming Shifts</span>
            <span className={styles.cardNumber}>{filteredUpcomingShifts.length}</span>
          </div>
        </div>
      </div>

      <div className={styles.dashboardgrid}>

        <section className={styles.performanceStats}>
          <h2 style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <span role="img" aria-label="Performance">🏆</span> Performance Stats
          </h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.cardIcon} style={{background: 'linear-gradient(135deg, #38a169 0%, #43cea2 100%)', marginBottom: 10}}>
                <span role="img" aria-label="Completed">✅</span>
              </div>
              <span className={styles.statLabel}>Completed Shifts</span>
              <span className={styles.statValue}>{completedShifts}</span>
            </div>
            <div className={styles.statCard}>
              <div className={styles.cardIcon} style={{background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)', marginBottom: 10}}>
                <span role="img" aria-label="Hours">⏱️</span>
              </div>
              <span className={styles.statLabel}>Total Hours Worked</span>
              <span className={styles.statValue}>{totalHoursWorked}</span>
            </div>
          </div>
        </section>

        <section className={styles.carerequest}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px'}}>
            <h2 style={{display: 'flex', alignItems: 'center', gap: 8, margin: 0}}>
              <span role="img" aria-label="Care Requests">📝</span> Care Requests
            </h2>
          </div>
          <div className={styles.careRequestsList}>
            {careRequests.length === 0 ? (
              <div className={styles.noCareRequests} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', background: 'linear-gradient(135deg, #f8fafc 0%, #eef2fa 100%)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(102,126,234,0.08)'}}>
                <span style={{fontSize: '2.5rem', marginBottom: '12px'}}>📝</span>
                <span style={{color: '#667eea', fontWeight: 600, fontSize: '1.2rem'}}>No Care Requests</span>
                <span style={{color: '#718096', fontSize: '1rem', marginTop: '8px'}}>You're all caught up! New care requests will appear here.</span>
              </div>
            ) : (
              careRequests.slice(0, 3).map((request, i) => (
                <div className={styles.careRequestCard} key={i}>
                  <div className={styles.careRequestHeader}>
                    <div className={styles.requestInfo}>
                      <h3 className={styles.elderName}>{request.elderName}</h3>
                    </div>
                    <div className={`${styles.statusBadge} ${styles[request.status]}`}>
                      {request.status}
                    </div>
                  </div>
                  <div className={styles.careRequestDetails}>
                    <div className={styles.requestDetail}>
                      <span className={styles.label}>Elder Age:</span>
                      <span className={styles.value}>{request.elderAge} years</span>
                    </div>
                    <div className={styles.requestDetail}>
                      <span className={styles.label}>Duration:</span>
                      <span className={styles.value}>
                        {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className={styles.requestDetail}>
                      <span className={styles.label}>Location:</span>
                      <span className={styles.value}>{request.elderAddress}</span>
                    </div>
                    <div className={styles.requestDetail}>
                      <span className={styles.label}>Family Contact:</span>
                      <span className={styles.value}>{request.familyMemberName}</span>
                    </div>
                  </div>
                  <div className={styles.requestDetail}>
                    <span className={styles.label}>Time Left:</span>
                    {(() => {
                      const now = new Date();
                      const start = new Date(request.startDate);
                      
                      // Get today's date without time for comparison
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const startDateOnly = new Date(start);
                      startDateOnly.setHours(0, 0, 0, 0);
                      
                      let colorClass;
                      if (startDateOnly < today) {
                        // Overdue - red color
                        colorClass = styles.timeLeftRed;
                      } else if (startDateOnly.getTime() === today.getTime()) {
                        // Started today - normal color
                        colorClass = '';
                      } else {
                        // Future date - green or red based on days
                        const diffMs = start - now;
                        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                        colorClass = diffDays <= 2 ? styles.timeLeftRed : styles.timeLeftGreen;
                      }

                      return (
                        <span className={colorClass}>
                          {getTimeLeft(request.startDate)}
                        </span>
                      );
                    })()}
                  </div>
                  <div className={styles.careRequestActions}>
                    <button 
                      className={styles.viewMoreButton}
                      onClick={() => navigate(`/caregiver/care-request/${request.requestId}`)}
                    >
                      View More Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
            <div className={styles.viewMoreContainer}>
              <button 
                className={styles.viewMoreBtn}
                onClick={() => navigate('/caregiver/care-requests')}
              >
                <span>View All Requests</span>
                <span>→</span>
              </button>
            </div>
        </section>
        
        <section className={styles.upcomingShifts}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 8, borderBottom: '2px solid #e0e6ed', flexWrap: 'nowrap', overflow: 'hidden'}}>
            <h2 style={{display: 'flex', alignItems: 'center', gap: 8, margin: 0, fontSize: '20px', color: '#2b4c7e', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 1, minWidth: 0}}>
              <span role="img" aria-label="Upcoming Shifts">📅</span> Upcoming Shifts
            </h2>
            <div className={styles.weekNavRow} style={{display: 'flex', alignItems: 'center', gap: 3, marginBottom: 0, flexShrink: 0}}>
              <button
                className={styles.weekNavBtn}
                onClick={() => {
                  setCurrentWeek(currentWeek - 1);
                }}
                disabled={isPrevWeekDisabled}
                style={{fontSize: '18px', padding: '6px 8px'}}
              >
                ← Prev Week
              </button>
              <span className={styles.weekNavLabel} style={{margin: '0 4px', fontSize: '18px', whiteSpace: 'nowrap', textAlign: 'center'}}>
                {weekRangeLabel}
              </span>
              <button
                className={styles.weekNavBtn}
                onClick={() => {
                  setCurrentWeek(currentWeek + 1);
                }}
                disabled={isNextWeekDisabled}
                style={{fontSize: '18px', padding: '6px 8px'}}
              >
                Next Week→
              </button>
            </div>
          </div>
          <div className={styles.shiftsList}>
            {loadingWeeklyShifts ? (
              <div style={{display: 'flex', justifyContent: 'center', padding: '20px'}}>
                <span>Loading shifts...</span>
              </div>
            ) : weeklyShifts.length === 0 ? (
              <div className={styles.noShifts} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', background: 'linear-gradient(135deg, #f8fafc 0%, #eef2fa 100%)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(102,126,234,0.08)'}}>
                <span style={{fontSize: '2.5rem', marginBottom: '12px'}}>📅</span>
                <span style={{color: '#718096', fontSize: '1rem', marginTop: '8px'}}>You have no confirmed shifts scheduled for this week.</span>
              </div>
            ) : (
              weeklyShifts.map((shift, i) => {
                const start = new Date(shift.start_date);
                const now = new Date();
                
                // Get today's date without time for comparison
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const startDateOnly = new Date(start);
                startDateOnly.setHours(0, 0, 0, 0);
                
                let colorClass;
                if (startDateOnly < today) {
                  // Overdue - red color
                  colorClass = styles.timeLeftRed;
                } else if (startDateOnly.getTime() === today.getTime()) {
                  // Started today - normal color
                  colorClass = '';
                } else {
                  // Future date - green or red based on days
                  const diffMs = start - now;
                  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                  colorClass = diffDays <= 2 ? styles.timeLeftRed : styles.timeLeftGreen;
                }

                
                return (
                  <div className={styles.shiftCard} key={i}>
                    <div className={styles.shiftHeader}>
                      <span className={styles.shiftDate}>
                        {start.toLocaleDateString()} - {shift.end_date ? new Date(shift.end_date).toLocaleDateString() : 'TBD'}
                      </span>
                      <span className={styles.shiftTime}>{shift.duration} days</span>
                    </div>
                    <div className={styles.shiftDetails}>
                      <span className={styles.label}>Location:</span>
                      <span className={styles.value}>{shift.location}</span>
                    </div>
                    <div className={styles.shiftDetails}>
                      <span className={styles.label}>Elder:</span>
                      <span className={styles.value}>{shift.elderName}</span>
                    </div>
                    <div className={styles.shiftDetails}>
                      <span className={styles.label}>Time Left:</span>
                      <span className={colorClass}>
                        {getTimeLeft(shift.start_date)}
                      </span>
                    </div>
                    <div className={styles.careRequestActions}>
                      <button 
                        className={styles.viewMoreButton}
                        onClick={() => navigate(`/caregiver/care-request/${shift.request_id}`)}
                      >
                        View More Details
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
            <div className={styles.viewMoreContainer}>
              <button 
                className={styles.viewMoreBtn}
                onClick={() => navigate('/caregiver/care-requests')}
              >
                <span>View All Shifts</span>
                <span>→</span>
              </button>
            </div>
        </section>

        

      </div>

      <section className={styles.dailyCareReports}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 8, borderBottom: '2px solid #e0e6ed', flexWrap: 'nowrap', overflow: 'hidden'}}>
          <h2 style={{display: 'flex', alignItems: 'center', gap: 8, margin: 0, fontSize: '20px', color: '#2b4c7e', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 1, minWidth: 0}}>
            <span role="img" aria-label="Daily Care Reports">📝</span> Daily Care Reports
          </h2>
          <div className={styles.weekNavRow} style={{display: 'flex', alignItems: 'center', gap: 3, marginBottom: 0, flexShrink: 0}}>
            <button
              className={styles.weekNavBtn}
              onClick={() => setCurrentReportWeek(prev => prev - 1)}
              style={{fontSize: '18px', padding: '6px 8px'}}
            >
              ← Prev Week
            </button>
            <span className={styles.weekNavLabel} style={{margin: '0 4px', fontSize: '18px', whiteSpace: 'nowrap', textAlign: 'center'}}>
              {(() => {
                const { start: reportStart, end: reportEnd } = getWeekRange(currentReportWeek);
                const formatDateWithMonth = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const getWeekLabel = (weekOffset) => {
                  if (weekOffset === 0) return 'This Week';
                  if (weekOffset === 1) return 'Next Week';
                  if (weekOffset === -1) return 'Last Week';
                  return null;
                };
                const weekLabel = getWeekLabel(currentReportWeek);
                const dateRange = `${formatDateWithMonth(reportStart)} - ${formatDateWithMonth(reportEnd)}`;
                return weekLabel ? `${dateRange} (${weekLabel})` : dateRange;
              })()}
            </span>
            <button
              className={styles.weekNavBtn}
              onClick={() => setCurrentReportWeek(prev => prev + 1)}
              style={{fontSize: '18px', padding: '6px 8px'}}
            >
              Next Week→
            </button>
          </div>
        </div>
        <div className={styles.reportsList}>
          {loadingReports ? (
            <div style={{display: 'flex', justifyContent: 'center', padding: '20px'}}>
              <span>Loading reports...</span>
            </div>
          ) : (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '16px', margin: '20px 0'}}>
              {weeklyReports.map((dayReport, i) => {
                const dayDate = new Date(dayReport.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                dayDate.setHours(0, 0, 0, 0);
                const isToday = dayDate.getTime() === today.getTime();
                
                return (
                  <div 
                    key={i}
                    className={styles.reportDayBox}
                    onClick={() => dayReport.elder_id ? handleReportBoxClick(dayReport) : null}
                    style={{
                      background: isToday ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' : '#ffffff',
                      border: isToday ? '3px solid #10b981' : '2px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '20px 16px',
                      cursor: dayReport.elder_id ? 'pointer' : 'default',
                      transition: 'all 0.3s ease',
                      minHeight: '140px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      position: 'relative',
                      boxShadow: isToday ? '0 4px 16px rgba(16, 185, 129, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.05)',
                      opacity: dayReport.elder_id ? 1 : 0.6
                    }}
                  >
                    {isToday && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '4px 8px',
                        borderRadius: '12px'
                      }}>
                        TODAY
                      </div>
                    )}
                    
                    <div style={{
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: '#4a5568', 
                      marginBottom: '8px',
                      textTransform: 'uppercase'
                    }}>
                      {dayDate.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    
                    <div style={{
                      fontSize: '28px', 
                      fontWeight: 700, 
                      color: isToday ? '#065f46' : '#2d3748',
                      marginBottom: '12px'
                    }}>
                      {dayDate.getDate()}
                    </div>
                    
                    <div style={{
                      fontSize: '12px', 
                      color: '#718096', 
                      marginBottom: '12px',
                      fontWeight: 500,
                      lineHeight: '1.3'
                    }}>
                      {dayReport.elder_name === 'No Assignment' ? (
                        <span style={{color: '#a0aec0', fontStyle: 'italic'}}>No caregiver</span>
                      ) : (
                        dayReport.elder_name
                      )}
                    </div>
                    
                    {dayReport.elder_id && (
                      <div style={{
                        fontSize: '10px', 
                        fontWeight: 600, 
                        color: dayReport.hasReport ? '#065f46' : '#dc2626',
                        backgroundColor: dayReport.hasReport ? '#d1fae5' : '#fee2e2',
                        padding: '4px 8px',
                        borderRadius: '8px'
                      }}>
                        {dayReport.hasReport ? '✓ Reported' : '✗ Not Reported'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className={styles.quickLinks} style={{borderRadius: '18px', boxShadow: '0 4px 16px rgba(102,126,234,0.10)', margin: '32px 0', padding: '32px 24px'}}>                      <h2 style={{display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.35rem', color: '#2b4c7e', fontWeight: 700, marginBottom: 18}}>
          <span role="img" aria-label="Quick Links" style={{fontSize: '2rem'}}>🚀</span> Quick Actions
        </h2>
        <div className={styles.linksGrid} style={{gap: '28px'}}>
          <button className={styles.quickLinkBtn} style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', fontSize: '1.1rem', fontWeight: 600, padding: '18px 0', borderRadius: '12px', boxShadow: '0 2px 12px rgba(102,126,234,0.12)', display: 'flex', alignItems: 'center', gap: '12px'}} onClick={() => navigate('/caregiver/profile')}>
            <span style={{fontSize: '1.5rem'}}>👤</span> Update Profile
          </button>
          <button className={styles.quickLinkBtn} style={{background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)', color: '#fff', fontSize: '1.1rem', fontWeight: 600, padding: '18px 0', borderRadius: '12px', boxShadow: '0 2px 12px rgba(67,206,162,0.12)', display: 'flex', alignItems: 'center', gap: '12px'}} onClick={() => navigate('/caregiver/care-requests')}>
            <span style={{fontSize: '1.5rem'}}>📅</span> View Requests
          </button>
          <button className={styles.quickLinkBtn} style={{background: 'linear-gradient(135deg, #ffb347 0%, #ffcc33 100%)', color: '#2d3748', fontSize: '1.1rem', fontWeight: 600, padding: '18px 0', borderRadius: '12px', boxShadow: '0 2px 12px rgba(255,179,71,0.12)', display: 'flex', alignItems: 'center', gap: '12px'}} onClick={() => navigate('/caregiver/carelog')}>
            <span style={{fontSize: '1.5rem'}}>📝</span> View Carelogs
          </button>
        </div>
      </section>
    </div>
  );

  return (
    <>
      <Navbar />
      <CaregiverLayout>
        {dashboardContent}
      </CaregiverLayout>
      
      {/* Daily Report Modal */}
      {showReportModal && selectedReportDay && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
              <h2 style={{margin: 0, color: '#2d3748'}}>
                Daily Care Report - {selectedReportDay.elder_name}
              </h2>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setSelectedReportDay(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{marginBottom: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px'}}>
              <strong>Date:</strong> {new Date(selectedReportDay.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>

            <DailyReportForm 
              onSubmit={handleReportSubmit}
              elderName={selectedReportDay.elder_name}
              existingReport={selectedReportDay.existingReport}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default CaregiverDashboard;
