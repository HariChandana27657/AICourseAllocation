import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CourseCatalog from './pages/CourseCatalog';
import PreferenceSubmission from './pages/PreferenceSubmission';
import AllocationResults from './pages/AllocationResults';
import CourseManagement from './pages/CourseManagement';
import Reports from './pages/Reports';
import StudentPreferences from './pages/StudentPreferences';
import AdminResetPassword from './pages/AdminResetPassword';
import Chatbot from './components/Chatbot';
import VoiceAssistant from './components/VoiceAssistant';
import { getUser, isAuthenticated, isStudent, isAdmin } from './utils/auth';
import type { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getUser());
    }
  }, []);

  const ProtectedRoute = ({ children, requireStudent = false, requireAdmin = false }: any) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" />;
    }
    if (requireStudent && !isStudent()) {
      return <Navigate to="/admin" />;
    }
    if (requireAdmin && !isAdmin()) {
      return <Navigate to="/student" />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        
        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute requireStudent>
              <StudentDashboard user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/courses"
          element={
            <ProtectedRoute requireStudent>
              <CourseCatalog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/preferences"
          element={
            <ProtectedRoute requireStudent>
              <PreferenceSubmission />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/results"
          element={
            <ProtectedRoute requireStudent>
              <AllocationResults />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute requireAdmin>
              <CourseManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute requireAdmin>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/preferences"
          element={
            <ProtectedRoute requireAdmin>
              <StudentPreferences />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reset-password"
          element={
            <ProtectedRoute requireAdmin>
              <AdminResetPassword />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
      {isAuthenticated() && <Chatbot />}
      {isAuthenticated() && <VoiceAssistant />}
    </Router>
  );
}

export default App;
