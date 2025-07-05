
/**
 * GatewayContext - Context de Gerenciamento de Gateways de Pagamento
 * 
 * TODO: BACKEND INTEGRATION - Substituir localStorage por APIs para gateways
 * Endpoints necessários: GET/POST/PUT/DELETE /api/gateways
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Gateway {
  id: string;
  name: string;
  type: 'mercado_pago';
  status: 'conectado' | 'desconectado';
  credentials: {
    publicKey: string;
    accessToken: string;
  };
  createdAt: string;
}

interface GatewayContextType {
  gateways: Gateway[];
  addGateway: (gateway: Omit<Gateway, 'id' | 'createdAt'>) => Gateway;
  updateGateway: (id: string, updates: Partial<Gateway>) => Gateway | null;
  deleteGateway: (id: string) => boolean;
  getGatewayById: (id: string) => Gateway | null;
  getConnectedGateways: () => Gateway[];
}

const GatewayContext = createContext<GatewayContextType | undefined>(undefined);

export const useGatewayContext = () => {
  const context = useContext(GatewayContext);
  if (!context) {
    throw new Error('useGatewayContext must be used within a GatewayProvider');
  }
  return context;
};

interface GatewayProviderProps {
  children: ReactNode;
}

export const GatewayProvider: React.FC<GatewayProviderProps> = ({ children }) => {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // Obter dados do usuário atual
  const getUserData = (userEmail: string): Gateway[] => {
    try {
      // TODO: BACKEND INTEGRATION - Substituir por: await fetch('/api/gateways')
      const allUsersData = JSON.parse(localStorage.getItem('app_data') || '{}');
      const userData = allUsersData[userEmail];
      
      if (userData && userData.gateways) {
        console.log('🔧 Gateways do usuário carregados:', userEmail, userData.gateways.length);
        return userData.gateways;
      } else {
        console.log('🔧 Novo usuário detectado, inicializando sem gateways');
        return [];
      }
    } catch (error) {
      console.error('❌ Erro ao ler dados do usuário:', error);
      return [];
    }
  };

  // Salvar dados do usuário atual
  const saveUserData = (userEmail: string, userGateways: Gateway[]) => {
    try {
      const allUsersData = JSON.parse(localStorage.getItem('app_data') || '{}');
      
      if (!allUsersData[userEmail]) {
        allUsersData[userEmail] = {};
      }
      
      allUsersData[userEmail].gateways = userGateways;
      localStorage.setItem('app_data', JSON.stringify(allUsersData));
      console.log('💾 Gateways do usuário salvos:', userEmail, userGateways.length);
    } catch (error) {
      console.error('❌ Erro ao salvar dados do usuário:', error);
    }
  };

  // Carregar gateways quando o usuário mudar
  useEffect(() => {
    const userEmail = localStorage.getItem('currentUserEmail');
    if (userEmail && userEmail !== currentUserEmail) {
      setCurrentUserEmail(userEmail);
      const userGateways = getUserData(userEmail);
      setGateways(userGateways);
      console.log('👤 Gateways carregados para usuário:', userEmail);
    }
  }, [currentUserEmail]);

  useEffect(() => {
    if (currentUserEmail) {
      saveUserData(currentUserEmail, gateways);
    }
  }, [gateways, currentUserEmail]);

  const addGateway = (gatewayData: Omit<Gateway, 'id' | 'createdAt'>): Gateway => {
    // TODO: BACKEND INTEGRATION - Substituir por: await fetch('/api/gateways', { method: 'POST' })
    const newGateway: Gateway = {
      ...gatewayData,
      id: `gtw_${gatewayData.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setGateways(prev => [...prev, newGateway]);
    return newGateway;
  };

  const updateGateway = (id: string, updates: Partial<Gateway>): Gateway | null => {
    let updatedGateway: Gateway | null = null;
    
    setGateways(prev => {
      const newGateways = prev.map(gateway => {
        if (gateway.id === id) {
          updatedGateway = { ...gateway, ...updates };
          return updatedGateway;
        }
        return gateway;
      });
      return newGateways;
    });
    
    return updatedGateway;
  };

  const deleteGateway = (id: string): boolean => {
    let wasDeleted = false;
    
    setGateways(prev => {
      const index = prev.findIndex(g => g.id === id);
      if (index !== -1) {
        wasDeleted = true;
        return prev.filter(g => g.id !== id);
      }
      return prev;
    });
    
    return wasDeleted;
  };

  const getGatewayById = (id: string): Gateway | null => {
    return gateways.find(g => g.id === id) || null;
  };

  const getConnectedGateways = (): Gateway[] => {
    return gateways.filter(g => g.status === 'conectado');
  };

  const value: GatewayContextType = {
    gateways,
    addGateway,
    updateGateway,
    deleteGateway,
    getGatewayById,
    getConnectedGateways
  };

  return (
    <GatewayContext.Provider value={value}>
      {children}
    </GatewayContext.Provider>
  );
};
