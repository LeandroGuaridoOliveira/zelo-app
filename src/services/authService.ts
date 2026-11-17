import { API_CONFIG, fetchWithTimeout } from './apiConfig';
import {
  AuthResponse,
  Usuario,
  USER_MARIA_ID,
  USER_ANA_ID,
  USER_JOSE_ID,
  FIXED_CASA_ID,
  FIXED_IDOSO_ID,
} from '@/types/zelo';

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface SignupData {
  nome: string;
  email: string;
  senha: string;
  papel: 'IDOSO' | 'FAMILIAR' | 'GUARDIAO';
  telefone?: string;
}

// Perfis cadastrados para acesso rápido
const DEMO_USERS: Record<string, Usuario> = {
  'maria@zelo.com': {
    id: USER_MARIA_ID,
    nome: 'Dona Maria',
    email: 'maria@zelo.com',
    papel: 'IDOSO',
    casaId: FIXED_CASA_ID,
    idosoId: FIXED_IDOSO_ID,
    telefone: '(11) 99888-7766',
  },
  'ana@zelo.com': {
    id: USER_ANA_ID,
    nome: 'Ana Oliveira (Filha)',
    email: 'ana@zelo.com',
    papel: 'FAMILIAR',
    casaId: FIXED_CASA_ID,
    idosoId: FIXED_IDOSO_ID,
    telefone: '(11) 98765-4321',
  },
  'jose@zelo.com': {
    id: USER_JOSE_ID,
    nome: 'Seu José (Vizinho)',
    email: 'jose@zelo.com',
    papel: 'GUARDIAO',
    casaId: FIXED_CASA_ID,
    idosoId: FIXED_IDOSO_ID,
    telefone: '(11) 97654-3210',
  },
};

export const authService = {
  /**
   * Realiza login no backend .NET (5080) com fallback automático para Java (8080)
   * e dados fixos de teste (Dona Maria, Ana, Seu José)
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, senha } = credentials;

    if (!API_CONFIG.useMock) {
      // 1. Tenta API .NET
      try {
        const response = await fetchWithTimeout(`${API_CONFIG.cuidadoApiUrl}/auth/login`, {
          method: 'POST',
          body: JSON.stringify({ email, senha }),
        });

        if (response.ok) {
          const data = await response.json();
          return {
            accessToken: data.accessToken || data.token || 'jwt-token-real',
            tokenType: 'Bearer',
            expiresIn: data.expiresIn || 86400,
            usuario: data.usuario || {
              id: data.id || USER_ANA_ID,
              nome: data.nome || email.split('@')[0],
              email: email,
              papel: data.papel || (email.includes('maria') ? 'IDOSO' : 'FAMILIAR'),
              casaId: FIXED_CASA_ID,
              idosoId: FIXED_IDOSO_ID,
            },
          };
        }
      } catch (_err) {
        // Se .NET estiver inacessível, tenta na API Java (8080)
        try {
          const resJava = await fetchWithTimeout(`${API_CONFIG.monitorApiUrl}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ email, senha }),
          });

          if (resJava.ok) {
            const data = await resJava.json();
            return {
              accessToken: data.token || data.accessToken || 'jwt-token-java',
              tokenType: 'Bearer',
              expiresIn: data.expiresIn || 86400,
              usuario: data.usuario || {
                id: data.id || USER_ANA_ID,
                nome: data.nome || email.split('@')[0],
                email: email,
                papel: data.papel || (email.includes('maria') ? 'IDOSO' : 'FAMILIAR'),
                casaId: FIXED_CASA_ID,
                idosoId: FIXED_IDOSO_ID,
              },
            };
          }
        } catch (_javaErr) {
          if (!API_CONFIG.fallbackDemo) {
            throw new Error('Falha ao conectar com o serviço de autenticação.');
          }
        }
      }
    }

    // Modo Fallback / Demonstração
    const normalizedEmail = email.trim().toLowerCase();
    const demoUser = DEMO_USERS[normalizedEmail];

    if (demoUser && senha === '123456') {
      return {
        accessToken: `zelo-jwt-token-${demoUser.id.substring(0, 8)}`,
        tokenType: 'Bearer',
        expiresIn: 86400,
        usuario: demoUser,
      };
    }

    // Caso seja qualquer outro email válido para teste livre
    if (senha.length >= 6 && email.includes('@')) {
      const isIdoso = email.toLowerCase().includes('idoso') || email.toLowerCase().includes('maria');
      const newUser: Usuario = {
        id: `usr-${Date.now()}`,
        nome: email.split('@')[0],
        email: email,
        papel: isIdoso ? 'IDOSO' : 'FAMILIAR',
        casaId: FIXED_CASA_ID,
        idosoId: FIXED_IDOSO_ID,
      };

      return {
        accessToken: `zelo-jwt-token-custom-${Date.now()}`,
        tokenType: 'Bearer',
        expiresIn: 86400,
        usuario: newUser,
      };
    }

    throw new Error('Credenciais inválidas. Para demo use email maria@zelo.com / ana@zelo.com / jose@zelo.com e senha 123456');
  },

  /**
   * Realiza cadastro de novo usuário na API .NET ou Java
   */
  async signup(data: SignupData): Promise<AuthResponse> {
    if (!API_CONFIG.useMock) {
      // 1. Tenta .NET
      try {
        const response = await fetchWithTimeout(`${API_CONFIG.cuidadoApiUrl}/auth/signup`, {
          method: 'POST',
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const resData = await response.json();
          return {
            accessToken: resData.accessToken || `jwt-token-${Date.now()}`,
            tokenType: 'Bearer',
            usuario: resData.usuario || {
              id: resData.id || `usr-${Date.now()}`,
              nome: data.nome,
              email: data.email,
              papel: data.papel,
              casaId: FIXED_CASA_ID,
              idosoId: FIXED_IDOSO_ID,
              telefone: data.telefone,
            },
          };
        }
      } catch (_err) {
        // Tenta Java (8080)
        try {
          const resJava = await fetchWithTimeout(`${API_CONFIG.monitorApiUrl}/auth/signup`, {
            method: 'POST',
            body: JSON.stringify(data),
          });
          if (resJava.ok) {
            const resData = await resJava.json();
            return {
              accessToken: resData.accessToken || resData.token || `jwt-token-${Date.now()}`,
              tokenType: 'Bearer',
              usuario: resData.usuario || {
                id: resData.id || `usr-${Date.now()}`,
                nome: data.nome,
                email: data.email,
                papel: data.papel,
                casaId: FIXED_CASA_ID,
                idosoId: FIXED_IDOSO_ID,
                telefone: data.telefone,
              },
            };
          }
        } catch (_javaErr) {
          if (!API_CONFIG.fallbackDemo) {
            throw new Error('Falha ao registrar novo usuário.');
          }
        }
      }
    }

    // Fallback de cadastro
    const newUser: Usuario = {
      id: `usr-${Date.now()}`,
      nome: data.nome,
      email: data.email,
      papel: data.papel,
      casaId: FIXED_CASA_ID,
      idosoId: FIXED_IDOSO_ID,
      telefone: data.telefone,
    };

    return {
      accessToken: `zelo-jwt-token-new-${Date.now()}`,
      tokenType: 'Bearer',
      expiresIn: 86400,
      usuario: newUser,
    };
  },
};
