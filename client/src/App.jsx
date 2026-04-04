import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Schedule from './pages/Attendance/Schedule';
import Grades from './pages/Grades/Grades';
import Attendance from './pages/Attendance/Attendance';
import Assignments from './pages/Assignments/Assignments';
import Messages from './pages/Messages/Messages';
import Profile from './pages/Profile/Profile';

import Students from './pages/Students/Students';
import Teachers from './pages/Teachers/Teachers';
import Classes from './pages/Classes/Classes';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import Events from './pages/Events/Events';

import MyClasses from './pages/MyClasses/MyClasses';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar role={user.role} />
      <main style={{ flex: 1, height: '100vh', overflowY: 'auto', padding: '30px', backgroundColor: 'var(--bg-color)' }}>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Students />
            </ProtectedRoute>
          } />
          <Route path="/admin/teachers" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Teachers />
            </ProtectedRoute>
          } />
          <Route path="/admin/classes" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Classes />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="/admin/events" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Events />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Settings />
            </ProtectedRoute>
          } />

          <Route path="/teacher/dashboard" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          <Route path="/teacher/classes" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <MyClasses />
            </ProtectedRoute>
          } />
          <Route path="/teacher/attendance" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Attendance />
            </ProtectedRoute>
          } />
          <Route path="/teacher/grades" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Grades />
            </ProtectedRoute>
          } />
          <Route path="/teacher/assignments" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Assignments />
            </ProtectedRoute>
          } />
          <Route path="/teacher/messages" element={
            <ProtectedRoute allowedRoles={['teacher', 'admin', 'student']}>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path="/teacher/profile" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/student/dashboard" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/schedule" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Schedule />
            </ProtectedRoute>
          } />
          <Route path="/student/grades" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Grades />
            </ProtectedRoute>
          } />
          <Route path="/student/attendance" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Attendance />
            </ProtectedRoute>
          } />
          <Route path="/student/assignments" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Assignments />
            </ProtectedRoute>
          } />
          <Route path="/student/messages" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path="/student/profile" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
