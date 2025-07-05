
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CustomDomain {
  id: string;
  hostname: string;
  status: 'pendente' | 'verificado' | 'erro';
  createdAt: string;
}

interface DomainContextType {
  customDomain: CustomDomain | null;
  saveDomain: (hostname: string) => Promise<CustomDomain>;
  deleteDomain: () => void;
  simulateVerification: (domainId: string) => void;
}

const DomainContext = createContext<DomainContextType | undefined>(undefined);

export const useDomainContext = () => {
  const context = useContext(DomainContext);
  if (!context) {
    throw new Error('useDomainContext must be used within a DomainProvider');
  }
  return context;
};

interface DomainProviderProps {
  children: ReactNode;
}

export const DomainProvider: React.FC<DomainProviderProps> = ({ children }) => {
  const [customDomain, setCustomDomain] = useState<CustomDomain | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // Obter dados do usuário atual
  const getUserData = (userEmail: string): CustomDomain | null => {
    try {
      const allUsersData = JSON.parse(localStorage.getItem('app_data') || '{}');
      const userData = allUsersData[userEmail];
      
      if (userData && userData.customDomain) {
        console.log('🌐 Domínio do usuário carregado:', userEmail, userData.customDomain.hostname);
        return userData.customDomain;
      } else {
        console.log('🌐 Novo usuário detectado, sem domínio personalizado');
        return null;
      }
    } catch (error) {
      console.error('❌ Erro ao ler dados do usuário:', error);
      return null;
    }
  };

  // Salvar dados do usuário atual
  const saveUserData = (userEmail: string, userDomain: CustomDomain | null) => {
    try {
      const allUsersData = JSON.parse(localStorage.getItem('app_data') || '{}');
      
      if (!allUsersData[userEmail]) {
        allUsersData[userEmail] = {};
      }
      
      allUsersData[userEmail].customDomain = userDomain;
      localStorage.setItem('app_data', JSON.stringify(allUsersData));
      console.log('💾 Domínio do usuário salvo:', userEmail, userDomain?.hostname || 'removido');
    } catch (error) {
      console.error('❌ Erro ao salvar dados do usuário:', error);
    }
  };

  // Carregar domínio quando o usuário mudar
  useEffect(() => {
    const userEmail = localStorage.getItem('currentUserEmail');
    if (userEmail && userEmail !== currentUserEmail) {
      setCurrentUserEmail(userEmail);
      const userDomain = getUserData(userEmail);
      setCustomDomain(userDomain);
      console.log('👤 Domínio carregado para usuário:', userEmail);
    }
  }, [currentUserEmail]);

  // Salvar domínio no localStorage sempre que mudar
  useEffect(() => {
    if (currentUserEmail) {
      saveUserData(currentUserEmail, customDomain);
    }
  }, [customDomain, currentUserEmail]);

  const saveDomain = async (hostname: string): Promise<CustomDomain> => {
    const newDomain: CustomDomain = {
      id: `dom_${Date.now()}`,
      hostname: hostname.toLowerCase().trim(),
      status: 'pendente',
      createdAt: new Date().toISOString()
    };

    setCustomDomain(newDomain);
    console.log('🌐 Domínio salvo:', newDomain);
    
    // Iniciar verificação automática após salvar
    setTimeout(() => {
      console.log('⏰ Iniciando verificação automática do domínio:', newDomain.id);
      simulateVerification(newDomain.id);
    }, 100); // Pequeno delay para garantir que o estado foi atualizado
    
    return newDomain;
  };

  const simulateVerification = (domainId: string) => {
    console.log('🔍 Simulando verificação para domínio:', domainId);
    console.log('📋 Domínio atual no estado:', customDomain);
    
    setCustomDomain(prevDomain => {
      if (prevDomain && prevDomain.id === domainId) {
        console.log('⏳ Iniciando verificação DNS...');
        
        // Simula verificação DNS após 3 segundos
        setTimeout(() => {
          console.log('✅ Verificação concluída! Atualizando status...');
          setCustomDomain(currentDomain => {
            if (currentDomain && currentDomain.id === domainId) {
              const verifiedDomain = { ...currentDomain, status: 'verificado' as const };
              console.log('🎉 Domínio verificado com sucesso!', verifiedDomain);
              return verifiedDomain;
            }
            return currentDomain;
          });
        }, 3000);
        
        return prevDomain; // Mantém o status 'pendente' por enquanto
      }
      return prevDomain;
    });
  };

  const deleteDomain = () => {
    setCustomDomain(null);
    console.log('🗑️ Domínio removido');
  };

  return (
    <DomainContext.Provider
      value={{
        customDomain,
        saveDomain,
        deleteDomain,
        simulateVerification
      }}
    >
      {children}
    </DomainContext.Provider>
  );
};
