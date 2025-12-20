import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/routing/ProtectedRoute';
import UnauthorizedPage from './pages/auth/UnauthorizedPage';

// Public pages
import PublicHomePage from './pages/public/HomePage';
import LoginPage from './pages/auth/LoginPage';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import WorkHours from './pages/student/WorkHours';

// Professor pages
import ProfessorLayout from './pages/professor/ProfessorLayout';

// Finance pages
import { Dashboard as FinanceDashboard } from './pages/finance/Dashboard';

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
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/work-hours" element={<WorkHours />} />
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
            <Route path="/finance/dashboard" element={<FinanceDashboard />} />
          </Route>

          {/* Catch-all route - Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}