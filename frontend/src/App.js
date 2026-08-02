// Root component: sets up routing, auth provider, and role-protected routes
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/admin/AdminLogin';
import PlacementHistory from './pages/PlacementHistory';

import StudentDashboard from './pages/student/StudentDashboard';
import Levels from './pages/student/Levels';
import Quiz from './pages/student/Quiz';
import Leaderboard from './pages/student/Leaderboard';
import Jobs from './pages/student/Jobs';
import ResumeUpload from './pages/student/ResumeUpload';

import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import PostJob from './pages/recruiter/PostJob';
import Applicants from './pages/recruiter/Applicants';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageLevels from './pages/admin/ManageLevels';
import ManageJobs from './pages/admin/ManageJobs';
import PlacedStudents from './pages/admin/PlacedStudents';

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="center mt-3"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
};

const AppRoutes = () => (
  <BrowserRouter>
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Shared (students & admin only -- removed from recruiter view) */}
        <Route path="/placements" element={
          <ProtectedRoute allowedRoles={['student', 'admin']}><PlacementHistory /></ProtectedRoute>
        } />

        {/* Student */}
        <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/levels" element={<ProtectedRoute allowedRoles={['student']}><Levels /></ProtectedRoute>} />
        <Route path="/student/levels/:levelKey" element={<ProtectedRoute allowedRoles={['student']}><Quiz /></ProtectedRoute>} />
        <Route path="/student/leaderboard" element={<ProtectedRoute allowedRoles={['student']}><Leaderboard /></ProtectedRoute>} />
        <Route path="/student/jobs" element={<ProtectedRoute allowedRoles={['student']}><Jobs /></ProtectedRoute>} />
        <Route path="/student/resume" element={<ProtectedRoute allowedRoles={['student']}><ResumeUpload /></ProtectedRoute>} />

        {/* Recruiter */}
        <Route path="/recruiter" element={<ProtectedRoute allowedRoles={['recruiter']}><RecruiterDashboard /></ProtectedRoute>} />
        <Route path="/recruiter/post-job" element={<ProtectedRoute allowedRoles={['recruiter']}><PostJob /></ProtectedRoute>} />
        <Route path="/recruiter/jobs/:jobId/applicants" element={<ProtectedRoute allowedRoles={['recruiter']}><Applicants /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers mode="students" /></ProtectedRoute>} />
        <Route path="/admin/recruiters" element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers mode="recruiters" /></ProtectedRoute>} />
        <Route path="/admin/levels" element={<ProtectedRoute allowedRoles={['admin']}><ManageLevels /></ProtectedRoute>} />
        <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={['admin']}><ManageJobs /></ProtectedRoute>} />
        <Route path="/admin/placed" element={<ProtectedRoute allowedRoles={['admin']}><PlacedStudents /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  </BrowserRouter>
);

const App = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

export default App;
