import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext';

interface RoleBasedLinkProps extends LinkProps {
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * RoleBasedLink component that shows or hides links based on user role
 * Useful for conditional navigation links in UI
 */
export const RoleBasedLink: React.FC<RoleBasedLinkProps> = ({
  allowedRoles,
  fallback = null,
  children,
  ...linkProps
}) => {
  const { hasRole } = useAuth();

  if (!hasRole(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <Link {...linkProps}>{children}</Link>;
};

export default RoleBasedLink;
