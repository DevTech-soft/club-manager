import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { api, LoginResponse } from '../services/api';
import { Coach } from '../types';

type UserType = 'admin' | 'superadmin' | 'coach' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  userType: UserType;
  coachInfo: Coach | null;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getInitialUserType = (): UserType => {
  const savedUserType = localStorage.getItem('userType');
  // Ensure the saved user type is one of the allowed values before using it.
  if (savedUserType && ['admin', 'superadmin', 'coach'].includes(savedUserType)) {
      return savedUserType as UserType;
  }
  return null;
}

const getInitialCoachInfo = (): Coach | null => {
    const savedCoach = localStorage.getItem('coachInfo');
    if (savedCoach) {
        try {
            // Safely parse the stored JSON for coach information.
            return JSON.parse(savedCoach);
        } catch (e) {
            console.error("Failed to parse coachInfo from localStorage", e);
            // If parsing fails, the data is corrupt. Clear it.
            localStorage.removeItem('coachInfo');
            return null;
        }
    }
    return null;
}


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage to persist session across page reloads.
  // NOTA: Los tokens JWT están en httpOnly cookies, no en localStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
      // Check for a consistent auth state. Both items should exist for a valid session.
      return localStorage.getItem('isAuthenticated') === 'true' && !!localStorage.getItem('userType');
  });
  const [userType, setUserType] = useState<UserType>(getInitialUserType);
  const [coachInfo, setCoachInfo] = useState<Coach | null>(getInitialCoachInfo);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVerifyingSession, setIsVerifyingSession] = useState<boolean>(true);

  // Centralized logout function to clear both state and localStorage.
  const logout = useCallback(async () => {
    try {
      // Llamar al endpoint de logout para limpiar las cookies httpOnly en el servidor
      await api.logout();
    } catch (error) {
      console.error("Logout error:", error);
      // Continuar con el logout local incluso si falla el servidor
    } finally {
      // Limpiar estado local
      setIsAuthenticated(false);
      setUserType(null);
      setCoachInfo(null);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userType');
      localStorage.removeItem('coachInfo');
    }
  }, []);

  /**
   * Verificar si la sesión es válida al cargar la aplicación
   * Usa el endpoint /auth/me que valida el accessToken en la cookie
   */
  const verifySession = useCallback(async () => {
    // Solo verificar si el localStorage indica que estamos autenticados
    const savedAuth = localStorage.getItem('isAuthenticated') === 'true';

    if (!savedAuth) {
      setIsVerifyingSession(false);
      return;
    }

    try {
      // Verificar con el servidor si la sesión es válida
      await api.me();
      // Si llegamos aquí, la sesión es válida
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error("Session verification failed:", error);
      // Si falla, hacer logout local
      setIsAuthenticated(false);
      setUserType(null);
      setCoachInfo(null);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userType');
      localStorage.removeItem('coachInfo');
    } finally {
      setIsVerifyingSession(false);
    }
  }, []);

  const login = async (user: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response: LoginResponse = await api.login(user, pass);

      if (response.success) {
        // Los tokens están en httpOnly cookies (manejadas automáticamente por el navegador)
        // Solo guardamos datos no sensibles en localStorage
        setIsAuthenticated(true);
        setUserType(response.userType);

        // Persist state in localStorage (solo datos no sensibles)
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userType', response.userType as string);

        if (response.userType === 'coach' && response.coachInfo) {
          setCoachInfo(response.coachInfo);
          localStorage.setItem('coachInfo', JSON.stringify(response.coachInfo));
        } else {
          setCoachInfo(null);
          localStorage.removeItem('coachInfo');
        }

        return true;
      }

      // If login is not successful, ensure we are logged out.
      await logout();
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      await logout(); // Ensure we are logged out on API error.
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar la sesión al montar el componente
  useEffect(() => {
    verifySession();
  }, [verifySession]);

  // Escuchar evento de sesión expirada disparado por apiClient
  useEffect(() => {
    const handleSessionExpired = () => {
      console.log('Session expired, logging out...');
      logout();
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [logout]);

  // Listen for storage changes to sync logout across tabs.
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
        // When 'isAuthenticated' is removed in another tab, it signifies a logout.
        // Sync this tab by logging out as well.
        if (event.key === 'isAuthenticated' && !event.newValue) {
            logout();
        }
    };

    window.addEventListener('storage', handleStorageChange);

    // When the component unmounts, clean up the event listener to prevent memory leaks.
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [logout]); // The effect depends on the `logout` function.

  // Mientras verificamos la sesión, mostrar loading
  if (isVerifyingSession) {
    return null; // O un componente de loading
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userType, coachInfo, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
