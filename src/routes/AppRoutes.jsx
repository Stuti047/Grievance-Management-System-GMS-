import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import StudentDashboard from '../pages/StudentDashboard';
import FacultyDashboard from '../pages/FacultyDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import ResponsibilityMappingPage from '../pages/ResponsibilityMappingPage';
import SubmitGrievance from '../pages/SubmitGrievance';
import TrackGrievance from '../pages/TrackGrievance';
import GrievanceDetails from '../pages/GrievanceDetails';
import ProfilePage from '../pages/ProfilePage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Role-Specific Dashboards */}
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
      
      <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
      <Route path="/faculty" element={<Navigate to="/faculty/dashboard" replace />} />
      
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/responsibility-mappings" element={<ResponsibilityMappingPage />} />
      <Route path="/admin/routing" element={<Navigate to="/admin/responsibility-mappings" replace />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Functional Grievance Pages */}
      <Route path="/submit" element={<SubmitGrievance />} />
      <Route path="/track" element={<TrackGrievance />} />
      <Route path="/grievance/:id" element={<GrievanceDetails />} />
      <Route path="/profile" element={<ProfilePage />} />

      {/* Fallback to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

