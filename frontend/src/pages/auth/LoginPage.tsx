import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
          const response = await fetch('http://localhost:8084/TA-management/auth/me', {
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
      const response = await fetch('http://localhost:8084/TA-management/auth/google', {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-primary-50)] to-[var(--color-primary-100)]">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TA Management System</h1>
          <p className="text-gray-600">Sign in to continue</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-[var(--color-primary-500)] border-t-transparent rounded-full"></div>
                Authenticating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            You will be signed in according to your assigned role in the system.
          </p>
        </div>

        <div className="mt-6 bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] rounded-lg p-4">
          <h3 className="text-sm font-semibold text-[var(--color-primary-900)] mb-2">Available Roles:</h3>
          <ul className="text-sm text-[var(--color-primary-800)] space-y-1">
            <li>• <strong>Student:</strong> Apply for TA positions, manage work hours</li>
            <li>• <strong>Professor:</strong> Recruit TAs, manage courses</li>
            <li>• <strong>Finance:</strong> Manage budgets and payments</li>
            <li>• <strong>Admin:</strong> System administration</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
