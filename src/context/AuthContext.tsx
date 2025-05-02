import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// Define action types
type AuthAction = 
  | { type: 'LOGIN'; email: string; name?: string }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_AUTH'; isAuthenticated: boolean; email: string | null; name?: string | null };

// Define state type
type AuthState = {
  isAuthenticated: boolean;
  userEmail: string | null;
  userName: string | null;
};

// Define context type
type AuthContextType = AuthState & {
  login: (email: string, name?: string) => void;
  logout: () => void;
  redirectToLogin: () => void;
};

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  userEmail: null,
  userName: null
};

// Create reducer function
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return {
        isAuthenticated: true,
        userEmail: action.email,
        userName: action.name || state.userName
      };
    case 'LOGOUT':
      return {
        isAuthenticated: false,
        userEmail: null,
        userName: null
      };
    case 'RESTORE_AUTH':
      return {
        isAuthenticated: action.isAuthenticated,
        userEmail: action.email,
        userName: action.name
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  // Check for existing auth state on mount
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    console.log('AUTH PROVIDER: Checking existing auth state:', isAuthenticated);
    console.log('AUTH PROVIDER: User email:', userEmail);
    console.log('AUTH PROVIDER: User name:', userName);
    dispatch({ type: 'RESTORE_AUTH', isAuthenticated, email: userEmail, name: userName });
  }, []);

  // Log state changes for debugging
  useEffect(() => {
    console.log('AUTH STATE CHANGED:', state);
  }, [state]);

  const login = (email: string, name?: string) => {
    console.log('AUTH PROVIDER: Login called with email:', email, 'and name:', name);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userEmail', email);
    if (name) {
      localStorage.setItem('userName', name);
    }
    dispatch({ type: 'LOGIN', email, name });
  };

  const logout = () => {
    console.log('AUTH PROVIDER: Logout called');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    dispatch({ type: 'LOGOUT' });
    navigate('/auth');
  };

  const redirectToLogin = () => {
    navigate('/auth');
  };

  // Provide the context value
  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    redirectToLogin
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};