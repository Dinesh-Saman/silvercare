import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserPage from "./pages/UserPage";
import { FamilyMemberReg } from "./pages/familemember/signup";
import { FamilyMemberReg2 } from "./pages/familemember/signup-step2";
import ElderSignup from "./pages/familemember/elder-signup";
import FamilyMemberDashboard from "./pages/familemember/dashboard";
import FamilyMemberElders from "./pages/familemember/elders";
import ElderDetails from "./pages/familemember/elder-details";
import CaregiverDetails from "./pages/familemember/caregiver-details";
import FamilyMemberLayout from "./components/FamilyMemberLayout";
import { CaregiverReg } from "./pages/caregiver/signup";
import { CaregiverRegStep2 } from "./pages/caregiver/signup-step2";
import Profile from "./pages/caregiver/profile";
import CaregiverDashboard from "./pages/caregiver/dashboard";
import CareRequestDetails from "./pages/caregiver/care-request-details";
import CareRequests from "./pages/caregiver/care-requests";
import Carelogs from './pages/caregiver/carelog';
import Elder from './pages/caregiver/elder';
import ViewAllElders from './pages/caregiver/viewAllElders';
import AdminDashboard from "./pages/admin/dashboard";
import { DoctorReg } from "./pages/doctor/signup";
import { MentalHealthProfessionalReg } from "./pages/healthproffesional/signup";
import { HealthProfessionalRegStep2 } from "./pages/healthproffesional/signup-step2";
import { HealthProfessionalRegStep3 } from "./pages/healthproffesional/signup-step3";
import HealthProfessionalDashboard from "./pages/healthproffesional/dashboard";
import { DoctorRegStep2 } from "./pages/doctor/signup-step2";

// Import new appointment components
import PhysicalAppointment from './pages/familemember/physical-appointment';
import OnlineAppointment from './pages/familemember/online-appointment';
import Appointments from './pages/familemember/appointments';
import CancelAppointment from "./pages/familemember/cancel-appointment";
import AppointmentHistory from "./pages/familemember/appointment-history";
import BookingSummary from './pages/familemember/booking-summary';
import Payment from './pages/familemember/payment';
import PaymentSuccess from './pages/familemember/payment-success';

import AllAppointments from "./pages/elder/appointments";
import AppointmentDetails from "./pages/elder/appointment-details";
import AllSessions from "./pages/elder/sessions";
import SessionDetails from "./pages/elder/session-details";
import ElderCaregivers from "./pages/elder/caregivers";
import ElderEvents from "./pages/elder/events";

import DoctorDashboard from './pages/doctor/dashboard';
import DoctorProfile from './pages/doctor/profile';
import ElderDashboard from './pages/elder/dashboard';
import { Login } from './pages/login';
import { Roles } from './pages/roles';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import ElderDoctors component
import ElderDoctors from './pages/familemember/elder-doctors';
import CaregiverProfile from './pages/familemember/profile';
import FamilyMemberProfile from './pages/familemember/profile';
import HealthProfessionalProfile from './pages/healthproffesional/profile';
import ElderProfile from './pages/elder/profile';

// Import admin related
import AdminUsers from './pages/admin/users';

// Optional: Create an Unauthorized component
const Unauthorized = () => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    <h1>403 - Unauthorized</h1>
    <p>You don't have permission to access this page.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Roles />} />
            <Route path="/login" element={<Login />} />
            <Route path="/users" element={<UserPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Family Member routes */}
            <Route path="/family-member/register" element={<FamilyMemberReg />} />
            <Route path="/family-member/register/step2" element={<FamilyMemberReg2 />} />
            
            <Route path="/family-member/dashboard" element={
              <ProtectedRoute allowedRoles={['family_member']}>
                <FamilyMemberDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/family-member/elders" element={
              <ProtectedRoute allowedRoles={['family_member']}>
                <FamilyMemberElders />
              </ProtectedRoute>
            } />
            
            <Route path="/family-member/elder/:elderId" element={
              <ProtectedRoute allowedRoles={['family_member']}>
                <ElderDetails />
              </ProtectedRoute>
            } />
            
            <Route path="/family-member/elder/:elderId/doctors" element={
              <ProtectedRoute allowedRoles={['family_member']}>
                <ElderDoctors />
              </ProtectedRoute>
            } />
            
            <Route path="/family-member/elder/:elderId/physical-appointment/:doctorId" element={
              <ProtectedRoute allowedRoles={['family_member']}>
                <PhysicalAppointment />
              </ProtectedRoute>
            } />
            
            <Route path="/family-member/elder/:elderId/online-appointment/:doctorId" element={
              <ProtectedRoute allowedRoles={['family_member']}>
                <OnlineAppointment />
              </ProtectedRoute>
            } />
            
            <Route path="/family-member/elder/:elderId/booking-summary/:doctorId" element={
              <ProtectedRoute allowedRoles={['family_member']}>
                <BookingSummary />
              </ProtectedRoute>
            } />
            
            <Route path="/family-member/payment" element={
              <ProtectedRoute allowedRoles={['family_member']}>
                <Payment />
              </ProtectedRoute>
            } />
            
            <Route path="/family-member/payment/success" element={
              <ProtectedRoute allowedRoles={['family_member']}>
                <PaymentSuccess />
              </ProtectedRoute>
            } />
            
            <Route path="/family-member/appointments" element={
              <ProtectedRoute allowedRoles={['family_member']}>
                <Appointments />
              </ProtectedRoute>
            } />
            
            <Route path="/family-member/appointments/history" element={
              <ProtectedRoute allowedRoles={['family_member']}>
                <AppointmentHistory />
              </ProtectedRoute>
            } />
            
            <Route path="/family-member/appointment/:appointmentId/cancel" element={
              <ProtectedRoute allowedRoles={['family_member']}>
                <CancelAppointment />
              </ProtectedRoute>
            } />
            
            <Route path="/family-member/caregiver/:caregiverId" element={
              <ProtectedRoute allowedRoles={['family_member']}>
                <CaregiverDetails />
              </ProtectedRoute>
            } />
            
            <Route path="/family-member/elder/signup" element={
              <ProtectedRoute allowedRoles={['family_member']}>
                <ElderSignup />
              </ProtectedRoute>
            } />
            
            <Route path="/family-member/profile" element={
              <ProtectedRoute allowedRoles={['family_member']}>
                <FamilyMemberProfile />
              </ProtectedRoute>
            } />

            {/* Elder routes */}
            <Route path="/elder/dashboard" element={
              <ProtectedRoute allowedRoles={['elder']}>
                <ElderDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/elder/appointments" element={
              <ProtectedRoute allowedRoles={['elder']}>
                <AllAppointments />
              </ProtectedRoute>
            } />
            
            <Route path="/elder/appointment/:appointmentId" element={
              <ProtectedRoute allowedRoles={['elder']}>
                <AppointmentDetails />
              </ProtectedRoute>
            } />
            
            <Route path="/elder/sessions" element={
              <ProtectedRoute allowedRoles={['elder']}>
                <AllSessions />
              </ProtectedRoute>
            } />
            
            <Route path="/elder/session/:sessionId" element={
              <ProtectedRoute allowedRoles={['elder']}>
                <SessionDetails />
              </ProtectedRoute>
            } />
            
            <Route path="/elder/caregivers" element={
              <ProtectedRoute allowedRoles={['elder']}>
                <ElderCaregivers />
              </ProtectedRoute>
            } />
            
            <Route path="/elder/events" element={
              <ProtectedRoute allowedRoles={['elder']}>
                <ElderEvents />
              </ProtectedRoute>
            } />
            
            <Route path="/elder/profile" element={
              <ProtectedRoute allowedRoles={['elder']}>
                <ElderProfile />
              </ProtectedRoute>
            } />

            {/* Caregiver routes */}
            <Route path="/caregiver/register" element={<CaregiverReg />} />
            <Route path="/caregiver/register/step2" element={<CaregiverRegStep2 />} />
            
            <Route path="/caregiver/dashboard" element={
              <ProtectedRoute allowedRoles={['caregiver']}>
                <CaregiverDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/caregiver/care-requests" element={
              <ProtectedRoute allowedRoles={["caregiver"]}>
                <CareRequests />
              </ProtectedRoute>
            } />

            <Route path="/caregiver/care-request/:requestId" element={
              <ProtectedRoute allowedRoles={["caregiver"]}>
                <CareRequestDetails />
              </ProtectedRoute>
            } />

            <Route path="/caregiver/profile" element={
              <ProtectedRoute allowedRoles={["caregiver"]}>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="/caregiver/carelog" element={
              <ProtectedRoute allowedRoles={["caregiver"]}>
                <Carelogs />
              </ProtectedRoute>
            } />

            <Route path="/caregiver/elder" element={
              <ProtectedRoute allowedRoles={["caregiver"]}>
                <Elder />
              </ProtectedRoute>
            } />

            <Route path="/caregiver/viewAllElders" element={
              <ProtectedRoute allowedRoles={["caregiver"]}>
                <ViewAllElders />
              </ProtectedRoute>
            } />

            {/* Doctor routes */}
            <Route path="/doctor/register" element={<DoctorReg />} />
            <Route path="/doctor/register/step2" element={<DoctorRegStep2 />} />
            
            <Route path="/doctor/dashboard" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/doctor/profile" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorProfile />
              </ProtectedRoute>
            } />

            {/* Health Professional routes */}
            <Route path="/health-professional/register" element={<MentalHealthProfessionalReg />} />
            <Route path="/health-professional/register/step2" element={<HealthProfessionalRegStep2 />} />
            <Route path="/health-professional/register/step3" element={<HealthProfessionalRegStep3 />} />
            
            <Route path="/health-professional/dashboard" element={
              <ProtectedRoute allowedRoles={['health_professional']}>
                <HealthProfessionalDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/health-professional/profile" element={
              <ProtectedRoute allowedRoles={['health_professional']}>
                <HealthProfessionalProfile />
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
