
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getGlobalSettings, updateGlobalSettings } from '@/api/mockDatabase';
import { toast } from '@/hooks/use-toast';
import { settingsSchema, SettingsFormData } from '@/types/settings';

export const useSettingsForm = () => {
  const [loading, setLoading] = useState(false);
  const [previewText, setPreviewText] = useState('');

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      textoIntrodutorio: '',
      emailSuporte: '',
      nomeEmpresa: '',
      nomeVendedor: '',
      textoSeguranca: '',
      linkTermosCompra: '',
      linkPoliticaPrivacidade: '',
      textoCopyright: '',
      exibirInformacoesLegais: true
    }
  });

  const loadSettings = async () => {
    try {
      console.log('🔄 Carregando configurações...');
      const settings = await getGlobalSettings();
      console.log('✅ Configurações carregadas:', settings);
      
      const footerWithDefaults: SettingsFormData = {
        textoIntrodutorio: settings.footer.textoIntrodutorio ?? '',
        emailSuporte: settings.footer.emailSuporte ?? '',
        nomeEmpresa: settings.footer.nomeEmpresa ?? '',
        nomeVendedor: settings.footer.nomeVendedor ?? '',
        textoSeguranca: settings.footer.textoSeguranca ?? '',
        linkTermosCompra: settings.footer.linkTermosCompra ?? '',
        linkPoliticaPrivacidade: settings.footer.linkPoliticaPrivacidade ?? '',
        textoCopyright: settings.footer.textoCopyright ?? '',
        exibirInformacoesLegais: settings.footer.exibirInformacoesLegais ?? true
      };
      
      form.reset(footerWithDefaults);
      updatePreview(footerWithDefaults);
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações.",
        variant: "destructive",
      });
    }
  };

  const updatePreview = (values: Partial<SettingsFormData>) => {
    const preview = `
${values.textoIntrodutorio || ''} ${values.emailSuporte || ''}.

${values.textoSeguranca || ''}

Valores parcelados possuem acréscimo ao mês.

${values.exibirInformacoesLegais ? 'Confira os Termos de Compra e nossa Política de Privacidade.' : ''}

${values.textoCopyright || ''}
    `.trim();
    
    setPreviewText(preview);
  };

  const onSubmit = async (data: SettingsFormData) => {
    console.log('🚀 Iniciando processo de salvamento...');
    console.log('📝 Dados do formulário:', data);
    
    setLoading(true);
    
    try {
      console.log('✅ Salvando configurações...');
      
      const updatedSettings = await updateGlobalSettings({
        footer: {
          textoIntrodutorio: data.textoIntrodutorio || '',
          emailSuporte: data.emailSuporte || '',
          nomeEmpresa: data.nomeEmpresa || '',
          nomeVendedor: data.nomeVendedor || '',
          textoSeguranca: data.textoSeguranca || '',
          linkTermosCompra: data.linkTermosCompra || '',
          linkPoliticaPrivacidade: data.linkPoliticaPrivacidade || '',
          textoCopyright: data.textoCopyright || '',
          exibirInformacoesLegais: data.exibirInformacoesLegais
        }
      });
      
      console.log('✅ Configurações salvas com sucesso:', updatedSettings);
      
      // Disparar eventos para atualização imediata
      console.log('📡 Disparando eventos de sincronização...');
      
      // Evento customizado para a mesma aba
      const customEvent = new CustomEvent('globalSettingsUpdated', {
        detail: updatedSettings
      });
      window.dispatchEvent(customEvent);
      console.log('✅ Evento customizado disparado');
      
      // Evento de localStorage para outras abas
      const storageKey = `settings_updated_${Date.now()}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedSettings));
      console.log('✅ Evento de storage disparado:', storageKey);
      
      // Remove a chave após um tempo
      setTimeout(() => {
        localStorage.removeItem(storageKey);
      }, 5000);
      
      // Toast de sucesso
      toast({
        title: "✅ Configurações salvas!",
        description: "As configurações foram atualizadas com sucesso e já estão ativas nos checkouts.",
        variant: "default",
      });
      
      console.log('🎉 Processo de salvamento concluído com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro durante o salvamento:', error);
      
      let errorMessage = "Erro inesperado ao salvar configurações";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "❌ Erro ao salvar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    const subscription = form.watch((values) => {
      updatePreview(values);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  return {
    form,
    loading,
    previewText,
    onSubmit
  };
};
