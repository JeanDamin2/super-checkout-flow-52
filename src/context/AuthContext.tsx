/**
 * AuthContext - Context de Autenticação
 * 
 * Gerencia o estado global de autenticação da aplicação, incluindo informações
 * do usuário logado e controle de sessão.
 * 
 * @context AuthContext
 * @description Context responsável por gerenciar a autenticação mock da aplicação.
 * Mantém informações sobre o usuário autenticado e fornece método de logout.
 * 
 * TODO: BACKEND INTEGRATION - Este context precisa ser completamente refatorado
 * para trabalhar com autenticação real baseada em JWT tokens.
 * 
 * Principais mudanças necessárias:
 * - Substituir localStorage por tokens JWT
 * - Implementar refresh token logic
 * - Adicionar interceptadores para renovação automática
 * - Implementar logout no servidor
 * 
 * @example
 * ```tsx
 * const { isLoggedIn, currentUserEmail, logout } = useAuth();
 * ```
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  currentUserEmail: string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook para acessar o contexto de autenticação
 * 
 * @returns {AuthContextType} Objeto com estado e métodos de autenticação
 * @throws {Error} Se usado fora do AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider Component
 * 
 * Provider do contexto de autenticação que envolve a aplicação e fornece
 * estado de autenticação para todos os componentes filhos.
 * 
 * @param {AuthProviderProps} props - Props do provider
 * @param {ReactNode} props.children - Componentes filhos
 * 
 * @returns {JSX.Element} Provider com contexto de autenticação
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // Verificar estado de autenticação no carregamento
  useEffect(() => {
    // TODO: BACKEND INTEGRATION - Esta lógica deve ser substituída por verificação de token JWT
    // Exemplo de como seria com uma API:
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   try {
    //     const decoded = jwt.decode(token);
    //     if (decoded.exp > Date.now() / 1000) {
    //       setIsLoggedIn(true);
    //       setCurrentUserEmail(decoded.email);
    //     }
    //   } catch (error) {
    //     localStorage.removeItem('authToken');
    //   }
    // }
    
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userEmail = localStorage.getItem('currentUserEmail');
    
    setIsLoggedIn(loggedIn);
    setCurrentUserEmail(userEmail);
    
    console.log('🔐 Auth state initialized:', { loggedIn, userEmail });
  }, []);

  // Escutar mudanças no localStorage
  useEffect(() => {
    // TODO: BACKEND INTEGRATION - Em um sistema real, este listener não seria necessário
    // pois as mudanças de autenticação viriam de chamadas de API
    
    const handleStorageChange = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const userEmail = localStorage.getItem('currentUserEmail');
      
      setIsLoggedIn(loggedIn);
      setCurrentUserEmail(userEmail);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /**
   * Função de logout que limpa a sessão do usuário
   * 
   * TODO: BACKEND INTEGRATION - Esta função deve fazer uma chamada para o servidor
   * para invalidar o token e limpar a sessão no backend.
   * Exemplo: await fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` }})
   */
  const logout = () => {
    console.log('🚪 Fazendo logout...');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUserEmail');
    setIsLoggedIn(false);
    setCurrentUserEmail(null);
    window.location.href = '/login'; // Força redirecionamento completo
  };

  const value: AuthContextType = {
    isLoggedIn,
    currentUserEmail,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};