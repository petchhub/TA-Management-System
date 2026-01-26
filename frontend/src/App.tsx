import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/routing/ProtectedRoute';
import UnauthorizedPage from './pages/auth/UnauthorizedPage';
import { Toaster } from "./components/ui/sonner";

// Public pages
import PublicHomePage from './pages/public/HomePage';
import LoginPage from './pages/auth/LoginPage';

// Student pages
import StudentLayout from './pages/student/StudentLayout';

// Professor pages
import ProfessorLayout from './pages/professor/ProfessorLayout';

// Finance pages
import FinanceLayout from './pages/finance/FinanceLayout';

/**
 * Role-based routing configuration for the TA Management System
 * Routes are organized by access level:
 * - Public: Accessible to everyone
 * - Protected: Requires authentication
 * - Role-based: Requires specific role(s)
 */
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes - Accessible to everyone */}
          <Route path="/" element={<PublicHomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Student Routes - Only accessible to STUDENT role */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route path="/student/dashboard" element={<StudentLayout initialPage="dashboard" />} />
            <Route path="/student/work-hours" element={<StudentLayout initialPage="managed-courses" />} />
            <Route path="/student/courses" element={<StudentLayout initialPage="courses" />} />
            <Route path="/student/profile" element={<StudentLayout initialPage="profile" />} />
            <Route path="/student/*" element={<StudentLayout />} />
          </Route>

          {/* Professor Routes - Only accessible to PROFESSOR role */}
          <Route element={<ProtectedRoute allowedRoles={['PROFESSOR']} />}>
            <Route path="/prof/*" element={<ProfessorLayout />} />
            <Route path="/prof/dashboard" element={<ProfessorLayout initialPage="dashboard" />} />
            <Route path="/prof/recruitment" element={<ProfessorLayout initialPage="recruitment" />} />
            <Route path="/prof/work-hours" element={<ProfessorLayout initialPage="work-hours" />} />
            <Route path="/prof/courses" element={<ProfessorLayout initialPage="courses" />} />
          </Route>

          {/* Finance Routes - Only accessible to FINANCE role */}
          <Route element={<ProtectedRoute allowedRoles={['FINANCE']} />}>
            <Route path="/finance/*" element={<FinanceLayout />} />
            <Route path="/finance/dashboard" element={<FinanceLayout initialPage="dashboard" />} />
            <Route path="/finance/semester" element={<FinanceLayout initialPage="semester" />} />
            <Route path="/finance/courses" element={<FinanceLayout initialPage="work-hours" />} />
            <Route path="/finance/export" element={<FinanceLayout initialPage="export" />} />
            <Route path="/finance/holidays" element={<FinanceLayout initialPage="holidays" />} />
            <Route path="/finance/announcement" element={<FinanceLayout initialPage="announcement" />} />
          </Route>

          {/* Catch-all route - Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}