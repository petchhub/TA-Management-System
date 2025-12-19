# Role-Based Routing Configuration

## Overview

This document describes the role-based routing system implemented in the TA Management System. The system controls which URLs are accessible to different user roles through both frontend route protection and backend API authorization.

## Architecture

### Frontend Routing
- **Router**: React Router v6
- **Authentication Context**: `AuthContext` provides centralized user state management
- **Route Protection**: `ProtectedRoute` component enforces role-based access
- **Conditional Navigation**: `RoleBasedLink` component for role-aware links

### Backend Routing
- **Framework**: Gin Web Framework (Go)
- **Middleware**: JWT-based authentication with role authorization
- **Access Control**: Role-based middleware enforces endpoint access

## User Roles

| Role | Access Level | Use Case |
|------|------------|----------|
| STUDENT | Low | Students applying for TA positions, viewing work hours |
| PROFESSOR | Medium | Professors managing TA recruitment, viewing applicants |
| FINANCE | Medium | Finance staff managing payments and budgets |
| ADMIN | High | Administrators with full system access |

## Frontend Routes

### Public Routes (No Authentication Required)
```
/                    - Home page
/login              - Login page
/unauthorized       - 403 error page
```

### Student Routes (Role: STUDENT)
```
/student/dashboard          - Student dashboard
/student/work-hours         - View work hours
/student/applications       - View TA applications
/student/profile           - User profile
```

### Professor Routes (Role: PROFESSOR)
```
/prof/dashboard            - Professor dashboard
/prof/recruitment          - TA recruitment management
/prof/course-management    - Manage courses
/prof/ta-details          - View TA details
```

### Finance Routes (Role: FINANCE)
```
/finance/dashboard         - Finance dashboard
/finance/course-export     - Export course data
/finance/email-announcement - Send announcements
/finance/holiday-calendar   - Manage holidays
/finance/work-hours        - Manage work hours
```

## Backend API Routes

### Authentication Endpoints (Public)
```
GET    /TA-management/auth/login                    - Login page
GET    /TA-management/auth/google/login            - Google OAuth login
GET    /TA-management/auth/google/callback         - OAuth callback
POST   /TA-management/auth/logout                   - Logout
```

### User Endpoint (Authenticated)
```
GET    /TA-management/auth/me                       - Get current user info
```

### Course Routes (Authenticated)
```
GET    /TA-management/course                        - Get all courses
GET    /TA-management/course/:id                    - Get course details
POST   /TA-management/course                        - Create course (Admin/Finance)
PUT    /TA-management/course/:id                    - Update course (Admin/Finance)
DELETE /TA-management/course/:id                    - Delete course (Admin/Finance)
```

### Student Routes (Role: STUDENT)
```
GET    /TA-management/student/dashboard             - Student dashboard
GET    /TA-management/student/applications          - List applications
POST   /TA-management/student/apply                 - Apply for TA position
```

### Professor Routes (Role: PROFESSOR)
```
GET    /TA-management/prof/dashboard                - Professor dashboard
GET    /TA-management/prof/recruitment              - Recruitment management
GET    /TA-management/prof/applicants               - List applicants
POST   /TA-management/prof/select-ta                - Select TA
```

### Finance Routes (Role: FINANCE)
```
GET    /TA-management/finance/dashboard             - Finance dashboard
GET    /TA-management/finance/export                - Export data
GET    /TA-management/finance/work-hours            - Work hours report
```

### Admin Routes (Role: ADMIN)
```
GET    /TA-management/admin/dashboard               - Admin dashboard
GET    /TA-management/admin/users                   - Manage users
POST   /TA-management/admin/assign-role             - Assign user roles
```

## Implementation Details

### 1. Frontend Protection

#### AuthContext
Located in: `src/context/AuthContext.tsx`

```typescript
// Usage in components
const { user, isAuthenticated, hasRole } = useAuth();

if (hasRole(['PROFESSOR'])) {
  // Show professor content
}
```

#### ProtectedRoute
Located in: `src/components/routing/ProtectedRoute.tsx`

```typescript
// Usage in App.tsx
<Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
  <Route path="/student/dashboard" element={<StudentDashboard />} />
</Route>
```

#### RoleBasedLink
Located in: `src/components/routing/RoleBasedLink.tsx`

```typescript
// Usage in navigation
<RoleBasedLink 
  allowedRoles={['PROFESSOR']} 
  to="/prof/recruitment"
>
  TA Recruitment
</RoleBasedLink>
```

### 2. Backend Protection

#### AuthMiddleware
Located in: `internal/middlewares/authen_middleware.go`

Validates JWT token from cookies and extracts user claims.

```go
authenticatedRouter.Use(middleware.AuthMiddleware(jwtSecret))
```

#### RoleMiddleware
Located in: `internal/middlewares/authen_middleware.go`

Enforces role-based access to endpoints.

```go
professorRouter := authenticatedRouter.Group("/prof")
professorRouter.Use(middleware.RoleMiddleware("PROFESSOR"))
```

### 3. Service Utilities

Located in: `src/services/authService.ts`

Provides helper functions for:
- Role checking: `hasRole()`, `hasAnyRole()`
- Permission validation: `canAccess()`, `hasRoleOrHigher()`
- Authentication: `isAuthenticated()`, `getCurrentUser()`, `logout()`

## Access Control Flow

### Frontend Flow
```
1. User navigates to URL
2. ProtectedRoute checks if user is authenticated
3. If not authenticated → redirect to /login
4. If authenticated, check user role
5. If role allowed → render component
6. If role denied → redirect to /unauthorized
```

### Backend Flow
```
1. Client sends request with auth_token cookie
2. AuthMiddleware validates JWT token
3. If invalid → return 401 Unauthorized
4. Extract claims (including role) from token
5. RoleMiddleware checks if role is in allowed list
6. If not allowed → return 403 Forbidden
7. If allowed → process request
```

## Security Best Practices

1. **Never trust frontend validation alone** - Always validate on backend
2. **Use HTTPS** - Transmit tokens securely
3. **HttpOnly cookies** - Prevent XSS attacks
4. **Token expiration** - Implement token refresh mechanism
5. **Role validation** - Verify roles on every protected endpoint
6. **Error handling** - Never expose sensitive info in error messages

## Adding New Routes

### Frontend
1. Create new page component in `src/pages/`
2. Add route in `App.tsx` with appropriate `ProtectedRoute`
3. Use `RoleBasedLink` for navigation

### Backend
1. Create controller in `internal/modules/[module]/controller/`
2. Create routes in `InitRouter()` function
3. Apply appropriate middleware (AuthMiddleware, RoleMiddleware)
4. Return JSON responses with appropriate HTTP status codes

## Testing Role-Based Access

### Manual Testing
1. Login as different roles
2. Attempt to access restricted routes
3. Verify redirect to /unauthorized when unauthorized
4. Check backend console for middleware logs

### Automated Testing
- Unit tests for `hasRole()`, `canAccess()` functions
- Integration tests for route protection
- API tests for endpoint authorization

## Error Handling

### Frontend
- 401 Unauthorized → Redirect to login
- 403 Forbidden → Redirect to unauthorized page
- Invalid token → Clear auth state, redirect to login

### Backend
- 401: Missing or invalid token
- 403: Valid token but insufficient role
- 500: Server error (log and respond with generic message)

## Token Structure

JWT token includes the following claims:
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

## Troubleshooting

### User can access unauthorized routes
- Check browser cookies for valid `auth_token`
- Verify `role` claim in JWT token
- Check backend middleware is applied to route
- Clear browser cache and cookies

### 403 Forbidden errors
- Verify user has required role
- Check role spelling matches exactly
- Verify middleware is correctly applied
- Check backend logs for detailed error

### 401 Unauthorized errors
- Token may have expired - require re-login
- Cookie may not be sent - check CORS settings
- Check if `credentials: 'include'` in fetch calls
