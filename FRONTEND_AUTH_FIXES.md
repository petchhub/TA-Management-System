# Frontend Role-Based Routing - Bug Fixes & Implementation

## Overview

This document details the bug fixes and improvements made to implement proper role-based routing with Google OAuth authentication in the TA Management System frontend.

## Key Changes Made

### 1. **Fixed AuthContext** (`src/context/AuthContext.tsx`)
   - Added JWT decoding fallback when `/auth/me` endpoint is not available
   - Properly handles missing role data from backend
   - Maps JWT claims to user object with role information
   - Added error handling for authentication checks
   - Exports useAuth hook for use in components

### 2. **Created LoginPage** (`src/pages/auth/LoginPage.tsx`)
   - Implements Google OAuth authentication flow
   - Initiates Google login by calling `/TA-management/auth/google`
   - Handles OAuth callback and user data retrieval
   - Redirects users to role-appropriate dashboard after login
   - Shows helpful UI with available roles
   - Error handling and loading states

### 3. **Enhanced Auth Service** (`src/services/authService.ts`)
   - Added `decodeJWT()` function to extract user data from JWT cookie
   - Handles JWT token base64 decoding with proper padding
   - Fallback mechanism when backend endpoints unavailable
   - JWT claims mapping: `sub` → id, `role` → role, etc.
   - Role hierarchy helpers for advanced permission checks

### 4. **Improved ProtectedRoute** (`src/components/routing/ProtectedRoute.tsx`)
   - Better loading state with animated spinner
   - Proper error handling for unauthorized access
   - Redirects based on authentication and role status

### 5. **Updated Dashboard Pages**
   - Added `useAuth()` hook to all dashboard components
   - Added logout functionality
   - Import useNavigate for redirect after logout
   - Made dashboard optional props for backwards compatibility

### 6. **Created Public Homepage** (`src/pages/public/HomePage.tsx`)
   - Landing page for unauthenticated users
   - Displays login button for new users
   - Shows welcome message for authenticated users
   - Lists features for each role

### 7. **Updated App.tsx Routing**
   - Fixed imports to use named exports where applicable
   - Proper role-based route configuration
   - Public, protected, and role-specific routes
   - Catch-all route for 404 handling

## Google OAuth Flow

### Authentication Process
```
1. User clicks "Sign in with Google" on LoginPage
2. Frontend calls: GET /TA-management/auth/google
3. Backend returns: Google OAuth authorization URL
4. User is redirected to Google login
5. User consents to share profile data
6. Google redirects to: /TA-management/auth/google/callback?code=...&state=...
7. Backend validates state and exchanges code for JWT token
8. Backend sets: auth_token cookie (JWT with role info)
9. Frontend checks /TA-management/auth/me or decodes JWT
10. User redirected to appropriate dashboard based on role
```

### JWT Token Structure
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "name": "User Name",
  "pic": "profile_picture_url",
  "role": "STUDENT|PROFESSOR|FINANCE|ADMIN",
  "iat": 1234567890,
  "exp": 1234571490
}
```

## Frontend Authentication Flow

### App Startup
1. AuthProvider initializes in App.tsx
2. On component mount, checks if user is logged in:
   - First tries to fetch `/TA-management/auth/me`
   - If fails, tries to decode JWT from cookies
   - Sets user state with role information
3. ProtectedRoute components check user role
4. Routes render based on authenticated status and role

### Route Access Control

| Route | Required Role | Accessible |
|-------|---------------|-----------|
| `/` | None | Everyone |
| `/login` | None | Everyone |
| `/unauthorized` | None | Everyone |
| `/student/*` | STUDENT | Students only |
| `/prof/*` | PROFESSOR | Professors only |
| `/finance/*` | FINANCE | Finance staff only |

## Bug Fixes Implemented

### 1. Missing JWT Decoding
   - **Problem**: Frontend couldn't read user role from JWT cookie
   - **Solution**: Implemented `decodeJWT()` function that:
     - Extracts JWT from `auth_token` cookie
     - Base64 decodes the payload
     - Handles padding correctly
     - Returns user object with role

### 2. Missing `/auth/me` Endpoint
   - **Problem**: Backend didn't implement this endpoint
   - **Solution**: 
     - Made it optional with fallback JWT decoding
     - AuthContext tries endpoint first, then JWT
     - Both methods return same user structure

### 3. No Role Information in Auth Context
   - **Problem**: User role wasn't being extracted or stored
   - **Solution**:
     - AuthContext now properly handles role from JWT or API
     - Exported UserRole type for type safety
     - hasRole() method checks against role array

### 4. Undefined Dashboard Components
   - **Problem**: App.tsx imported non-existent components
   - **Solution**:
     - Created missing page components
     - Updated existing dashboards with auth hooks
     - Fixed import statements for named vs default exports

### 5. Login Page Redirection
   - **Problem**: No proper login flow or role-based redirect
   - **Solution**:
     - Created comprehensive LoginPage component
     - Implements OAuth flow
     - Redirects to role-appropriate dashboard

## Testing the Implementation

### Test Scenario 1: Student Login
1. Navigate to `/login`
2. Click "Sign in with Google"
3. Complete Google authentication
4. Verify redirected to `/student/dashboard`
5. Verify role shows as STUDENT
6. Try accessing `/prof/dashboard` - should redirect to unauthorized

### Test Scenario 2: Professor Login
1. Navigate to `/login`
2. Click "Sign in with Google" with professor account
3. Verify redirected to `/prof/dashboard`
4. Verify role shows as PROFESSOR
5. Try accessing `/student/dashboard` - should redirect to unauthorized

### Test Scenario 3: Session Persistence
1. Login successfully
2. Refresh page
3. Verify user is still logged in (AuthContext restores from cookie)
4. Verify role is correct

### Test Scenario 4: Logout
1. Click logout button on any dashboard
2. Verify redirected to login page
3. Verify session is cleared

## Troubleshooting

### Issue: User not recognized after page refresh
- **Check**: Auth_token cookie still exists
- **Check**: Cookie domain and path are correct
- **Check**: JWT has not expired
- **Solution**: Clear cookies and login again

### Issue: Role-based redirect not working
- **Check**: User role in JWT matches expected values (case-sensitive)
- **Check**: ProtectedRoute allowedRoles matches role in JWT
- **Check**: Browser console for auth errors
- **Solution**: Verify backend is sending correct role in token

### Issue: Google OAuth redirect loop
- **Check**: Redirect URL in backend matches OAuth configuration
- **Check**: OAuth code is not null/undefined
- **Check**: State validation passes (CSRF check)
- **Solution**: Check backend OAuth configuration

## File Structure
```
frontend/src/
├── App.tsx (Main router with role-based routes)
├── context/
│   └── AuthContext.tsx (Authentication state & hooks)
├── components/
│   └── routing/
│       ├── ProtectedRoute.tsx (Route protection)
│       └── RoleBasedLink.tsx (Conditional navigation links)
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx (Google OAuth login)
│   │   └── UnauthorizedPage.tsx (403 error page)
│   ├── public/
│   │   └── HomePage.tsx (Landing page)
│   ├── student/
│   │   ├── Dashboard.tsx (Student dashboard)
│   │   └── WorkHours.tsx (Work hours tracking)
│   ├── professor/
│   │   ├── Dashboard.tsx (Professor dashboard)
│   │   └── TARecruitment.tsx (TA recruitment)
│   └── finance/
│       └── Dashboard.tsx (Finance dashboard)
└── services/
    └── authService.ts (Auth utilities & JWT decoding)
```

## Security Considerations

1. **HttpOnly Cookies**: Auth token stored in HttpOnly cookie (set by backend)
2. **CSRF Protection**: State parameter validated in OAuth flow
3. **Role Validation**: Always verify role on protected routes
4. **Token Expiration**: Implement token refresh mechanism
5. **No Sensitive Data in JWT**: Only include necessary claims

## Next Steps

1. **Implement Token Refresh**: Add refresh token logic for better security
2. **Add Loading States**: Show loading indicators during auth checks
3. **Implement Logout**: Add proper logout endpoint and cookie cleanup
4. **Add Error Recovery**: Better error messages and recovery flows
5. **Role Hierarchy**: Implement role inheritance (Admin > Finance > Professor > Student)

## Recent Updates (Finance & Student Implementation)

### Finance Role Implementation
- **Dashboard**: Full dashboard with stats aggregation (`/finance/dashboard`).
- **Course Management**: View and export functionality limited to Finance scope.
- **Export Features**:
  - Disbursement List (`/finance/export`) with Thai month localization.
  - Signature Sheets (`/finance/export`) with tailored filenames.
- **Data Access**: Secure endpoints for fetching all courses for financial review.

### Student Role Enhancements
- **Managed Courses**: View accepted TA positions (`/student/work-hours`).
- **Application Flow**: Apply for courses, view status.
- **Course Details**: Enhanced modal with real-time TA count and Discord integration mockup.
