import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, User, CreditCard } from 'lucide-react';
import { API_BASE_URL } from '../../config/env';
/**
 * LoginPage - Handles Google OAuth authentication
 * Initiates login flow and processes OAuth callback
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to appropriate dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectToDashboard(user.role);
    }
  }, [isAuthenticated, user]);

  // Handle OAuth callback from URL parameters
  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const success = params.get('success');
      const error = params.get('error');

      // Handle error from backend redirect
      if (error) {
        const errorMessages: { [key: string]: string } = {
          invalid_request: 'Invalid authentication request. Please try again.',
          state_mismatch: 'Session expired or invalid. Please try again.',
          email_not_verified: 'Your email is not verified. Please verify your email.',
          code_exchange_failed: 'Failed to exchange authorization code. Please try again.',
          authentication_failed: 'Authentication failed. Please try again.',
        };
        setError(errorMessages[error] || 'An error occurred during authentication.');
        // Clear error parameter from URL
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }

      // Handle successful callback
      if (success === 'true') {
        try {
          setLoading(true);
          setError(null);

          // Fetch user data from backend /auth/me endpoint
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            credentials: 'include',
          });

          if (response.ok) {
            const userData = await response.json();

            // Convert role to uppercase to match frontend expectations
            const normalizedUser = {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              role: userData.role?.toUpperCase() || null,
            };

            login(normalizedUser);
            redirectToDashboard(normalizedUser.role);
          } else if (response.status === 401) {
            setError('Authentication failed. Please try again.');
          } else {
            setError('Unable to verify your identity. Please try again.');
          }
        } catch (err) {
          console.error('Callback error:', err);
          setError('An error occurred during authentication.');
        } finally {
          setLoading(false);
          // Clear success parameter from URL
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    };

    handleCallback();
  }, [login]);

  const redirectToDashboard = (role: string | null) => {
    switch (role) {
      case 'STUDENT':
        navigate('/student/dashboard');
        break;
      case 'PROFESSOR':
        navigate('/prof/dashboard');
        break;
      case 'FINANCE':
        navigate('/finance/dashboard');
        break;
      case 'ADMIN':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request OAuth URL from backend
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to initiate Google login');
      }

      const googleAuthUrl = await response.text();

      // Redirect to Google OAuth consent screen
      if (googleAuthUrl) {
        window.location.href = googleAuthUrl;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to initiate login. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="mx-auto w-40 h-24 flex items-center justify-center mb-4 rounded-xl overflow-hidden border-white-100 bg-white">
            <img src="/ta-logo.png" alt="TA Management Logo" className="max-h-full w-auto object-contain rounded-xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">TA Management</h1>
          <p className="text-gray-500">ระบบบริหารจัดการผู้ช่วยสอน</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 hover:border-orange-500 hover:text-orange-600 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-orange-600 border-t-transparent rounded-full"></div>
                Authenticating...
              </>
            ) : (
              <>
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Sign in with @kmitl.ac.th
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            กลับไปค้นหาตำแหน่ง TA
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Supported Roles
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center cursor-default">
              <div className="flex justify-center mb-2">
                <GraduationCap className="w-6 h-6 text-gray-400" />
              </div>
              <span className="text-sm font-medium text-gray-600">Student</span>
              <p className="text-[10px] text-gray-400 mt-1">Apply & Track</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center cursor-default">
              <div className="flex justify-center mb-2">
                <User className="w-6 h-6 text-gray-400" />
              </div>
              <span className="text-sm font-medium text-gray-600">Professor</span>
              <p className="text-[10px] text-gray-400 mt-1">Recruit & Manage</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center cursor-default">
              <div className="flex justify-center mb-2">
                <CreditCard className="w-6 h-6 text-gray-400" />
              </div>
              <span className="text-sm font-medium text-gray-600">Finance</span>
              <p className="text-[10px] text-gray-400 mt-1">Payment & Rates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
