import { useContext } from 'react';
import { AuthContext, AuthContextType } from '../contexts/AuthContextType';

// Custom hook to use the auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  return context;
}
