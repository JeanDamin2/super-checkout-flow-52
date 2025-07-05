
import { useState, useEffect, useCallback } from 'react';
import { getGlobalSettings, GlobalSettings } from '@/api/mockDatabase';

export const useGlobalSettings = () => {
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGlobalSettings = useCallback(async () => {
    try {
      setLoading(true);
      const settings = await getGlobalSettings();
      console.log('🔄 Configurações globais carregadas:', settings);
      setGlobalSettings(settings);
      setError(null);
    } catch (error) {
      console.error('❌ Erro ao carregar configurações globais:', error);
      setError('Erro ao carregar configurações globais');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGlobalSettings();

    // Escuta por atualizações das configurações globais
    const handleGlobalSettingsUpdate = (event: CustomEvent<GlobalSettings>) => {
      console.log('🔄 Evento de atualização recebido, aplicando novas configurações:', event.detail);
      setGlobalSettings(event.detail);
      setLoading(false);
      setError(null);
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'settings_updated') {
        console.log('🔄 Detectada atualização via localStorage, recarregando configurações...');
        // Pequeno delay para garantir que os dados foram salvos
        setTimeout(() => {
          loadGlobalSettings();
        }, 100);
      }
    };

    // Escuta eventos personalizados (mesma aba)
    window.addEventListener('globalSettingsUpdated', handleGlobalSettingsUpdate as EventListener);
    
    // Escuta mudanças no localStorage (outras abas)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('globalSettingsUpdated', handleGlobalSettingsUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadGlobalSettings]);

  return {
    globalSettings,
    loading,
    error,
    reload: loadGlobalSettings
  };
};
