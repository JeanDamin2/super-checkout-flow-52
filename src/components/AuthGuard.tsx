/**
 * AuthGuard Component
 * 
 * Componente de proteção de rotas que verifica se o usuário está autenticado
 * antes de permitir acesso às páginas protegidas da aplicação.
 * 
 * @component AuthGuard
 * @description Higher-Order Component que implementa proteção de rotas baseada
 * em autenticação. Verifica os dados de sessão no localStorage e redireciona
 * usuários não autenticados para a página de login.
 * 
 * TODO: BACKEND INTEGRATION - Quando conectado a um backend real, este componente
 * deve verificar a validade do token JWT em vez de apenas verificar o localStorage.
 * Exemplo: await fetch('/api/auth/verify', { headers: { Authorization: `Bearer ${token}` }})
 * 
 * @param {AuthGuardProps} props - Props do componente
 * @param {ReactNode} props.children - Componentes filhos a serem protegidos
 * 
 * @returns {JSX.Element | null} Renderiza os children se autenticado, senão null
 */

import React, { useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: BACKEND INTEGRATION - Esta verificação deve ser substituída por validação de token JWT
    // Exemplo de como seria com uma API:
    // const token = localStorage.getItem('authToken');
    // const response = await fetch('/api/auth/verify', { 
    //   headers: { Authorization: `Bearer ${token}` } 
    // });
    // if (!response.ok) navigate('/login');
    
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    
    if (!isLoggedIn || isLoggedIn !== 'true' || !currentUserEmail) {
      console.log('🔒 Usuário não autenticado, redirecionando para login');
      navigate('/login', { replace: true });
      return;
    }
    
    console.log('✅ Usuário autenticado:', currentUserEmail);
  }, [navigate]);

  // TODO: BACKEND INTEGRATION - Verificação deve ser baseada em token válido
  // Em vez de verificar localStorage, verificar se o token JWT é válido
  // Verificar se está logado antes de renderizar
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const currentUserEmail = localStorage.getItem('currentUserEmail');
  
  if (!isLoggedIn || isLoggedIn !== 'true' || !currentUserEmail) {
    return null; // Não renderizar nada enquanto redireciona
  }

  return <>{children}</>;
};