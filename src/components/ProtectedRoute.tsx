import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { setCurrentUser } from '../services/fieldManagementStore';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (user) {
      setCurrentUser({
        id: user.id,
        role: user.role,
        contractorId: user.contractorId,
        clientRecordId: user.clientRecordId,
      });
    } else {
      setCurrentUser(null);
    }
  }, [user]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
