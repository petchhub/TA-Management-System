import { UserRole } from '../context/AuthContext';

const API_BASE_URL = '/TA-management';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  pic?: string;
}

/**
 * Decodes JWT token from cookies and extracts user information
 * Fallback method when /auth/me endpoint is not available
 */
export const decodeJWT = (): User | null => {
  try {
    // Get the auth_token cookie value
    const cookies = document.cookie.split(';');
    let token = null;

    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth_token') {
        token = decodeURIComponent(value);
        break;
      }
    }

    if (!token) {
      return null;
    }

    // JWT has three parts separated by dots: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    // Add padding if needed
    const padding = 4 - (payload.length % 4);
    const paddedPayload = padding !== 4 ? payload + '='.repeat(padding) : payload;

    const decoded = JSON.parse(atob(paddedPayload));

    // Extract user information from JWT claims
    return {
      id: decoded.sub || decoded.id || '',
      email: decoded.email || '',
      name: decoded.name || '',
      role: (decoded.role as UserRole) || null,
      pic: decoded.pic,
    };
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Checks if a user has a specific role
 */
export const hasRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return userRole === requiredRole;
};

/**
 * Checks if a user has any of the required roles
 */
export const hasAnyRole = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  return requiredRoles.includes(userRole);
};

/**
 * Fetches the current authenticated user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Fallback to JWT decoding if endpoint not available
      return decodeJWT();
    }

    const userData = await response.json();
    return {
      id: userData.id || userData.sub || '',
      email: userData.email || '',
      name: userData.name || '',
      role: (userData.role as UserRole) || null,
      pic: userData.pic,
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    // Try fallback JWT decoding
    return decodeJWT();
  }
};

/**
 * Logout the current user
 */
export const logout = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to logout: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error logging out:', error);
    return false;
  }
};

/**
 * Checks if the user is authenticated by verifying the auth token
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });
    return response.ok;
  } catch {
    // If endpoint not available, check if JWT exists
    return decodeJWT() !== null;
  }
};

/**
 * Permission check helper - returns true if user has access to resource
 */
export const canAccess = (userRole: UserRole, resourceRole: UserRole | UserRole[]): boolean => {
  if (!userRole) return false;

  if (Array.isArray(resourceRole)) {
    return resourceRole.includes(userRole);
  }

  return userRole === resourceRole;
};

/**
 * Role hierarchy for advanced permission checking
 * ADMIN > FINANCE > PROFESSOR > STUDENT
 */
const roleHierarchy: Record<Exclude<UserRole, null>, number> = {
  ADMIN: 4,
  FINANCE: 3,
  PROFESSOR: 2,
  STUDENT: 1,
};

/**
 * Checks if a user's role is equal to or higher than a required role
 */
export const hasRoleOrHigher = (userRole: UserRole, requiredRole: UserRole): boolean => {
  if (!userRole || !requiredRole) return false;
  // We know userRole and requiredRole are not null here, but we cast to satisfy TS
  return (
    (roleHierarchy[userRole as Exclude<UserRole, null>] || 0) >=
    (roleHierarchy[requiredRole as Exclude<UserRole, null>] || 0)
  );
};
