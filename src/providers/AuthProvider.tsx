import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Usuario } from '@/types/zelo';
import { authService, LoginCredentials, SignupData } from '@/services/authService';

const SESSION_STORAGE_KEY = '@zelo:auth_session';

interface SessionData {
  token: string;
  user: Usuario;
}

interface AuthContextData {
  user: Usuario | null;
  token: string | null;
  isLoading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (data: SignupData) => Promise<void>;
  signOut: () => Promise<void>;
  loginAsDemo: (perfil: 'maria' | 'ana' | 'jose') => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Carrega sessão salva no dispositivo na inicialização do app
  useEffect(() => {
    async function loadSavedSession() {
      try {
        const json = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
        if (json) {
          const session: SessionData = JSON.parse(json);
          setUser(session.user);
          setToken(session.token);
        }
      } catch (e) {
        console.warn('Erro ao carregar sessão salva:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadSavedSession();
  }, []);

  const signIn = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      const sessionData: SessionData = {
        token: response.accessToken,
        user: response.usuario,
      };
      await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      setUser(response.usuario);
      setToken(response.accessToken);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: SignupData) => {
    setIsLoading(true);
    try {
      const response = await authService.signup(data);
      const sessionData: SessionData = {
        token: response.accessToken,
        user: response.usuario,
      };
      await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      setUser(response.usuario);
      setToken(response.accessToken);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Atalho de autenticação rápida
  const loginAsDemo = async (perfil: 'maria' | 'ana' | 'jose') => {
    let email = 'ana@zelo.com';
    if (perfil === 'maria') email = 'maria@zelo.com';
    if (perfil === 'jose') email = 'jose@zelo.com';

    await signIn({ email, senha: '123456' });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        signIn,
        signUp,
        signOut,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
