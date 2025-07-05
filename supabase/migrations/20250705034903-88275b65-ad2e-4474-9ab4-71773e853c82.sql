
-- Criar tabela de produtos
CREATE TABLE public.produtos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  url_imagem TEXT,
  is_principal BOOLEAN DEFAULT false,
  is_orderbump BOOLEAN DEFAULT false,
  is_upsell BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de clientes
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  cpf TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de vendas
CREATE TABLE public.vendas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_cliente UUID REFERENCES public.clientes(id) NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  metodo_pagamento TEXT NOT NULL,
  data_da_venda TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de itens da venda
CREATE TABLE public.itens_da_venda (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_venda UUID REFERENCES public.vendas(id) ON DELETE CASCADE NOT NULL,
  id_produto UUID REFERENCES public.produtos(id) NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  quantidade INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de configurações
CREATE TABLE public.configuracoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chave TEXT UNIQUE NOT NULL,
  valor TEXT,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de perfis de usuário (para administradores)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir configurações padrão
INSERT INTO public.configuracoes (chave, valor, descricao) VALUES
('exibir_termos_legais', 'false', 'Controla se os termos legais são exibidos no checkout'),
('nome_empresa', 'Super Checkout', 'Nome que aparece na fatura'),
('email_suporte', 'suporte@supercheckout.com', 'Email de suporte'),
('texto_seguranca', 'Seus dados estão seguros conosco', 'Texto de segurança no checkout');

-- Habilitar RLS (Row Level Security) em todas as tabelas
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_da_venda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas para produtos (admin pode tudo, público pode ler)
CREATE POLICY "Administradores podem gerenciar produtos" ON public.produtos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Público pode ver produtos" ON public.produtos
  FOR SELECT USING (true);

-- Criar políticas para clientes (admin pode tudo, público pode criar)
CREATE POLICY "Administradores podem gerenciar clientes" ON public.clientes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Público pode criar clientes" ON public.clientes
  FOR INSERT WITH CHECK (true);

-- Criar políticas para vendas (admin pode tudo, público pode criar)
CREATE POLICY "Administradores podem gerenciar vendas" ON public.vendas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Público pode criar vendas" ON public.vendas
  FOR INSERT WITH CHECK (true);

-- Criar políticas para itens da venda (admin pode tudo, público pode criar)
CREATE POLICY "Administradores podem gerenciar itens da venda" ON public.itens_da_venda
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Público pode criar itens da venda" ON public.itens_da_venda
  FOR INSERT WITH CHECK (true);

-- Criar políticas para configurações (admin pode tudo, público pode ler)
CREATE POLICY "Administradores podem gerenciar configurações" ON public.configuracoes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Público pode ver configurações" ON public.configuracoes
  FOR SELECT USING (true);

-- Criar políticas para perfis (usuários podem ver seu próprio perfil)
CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Função para criar perfil automaticamente quando um usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'admin');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Função para processar uma venda completa
CREATE OR REPLACE FUNCTION public.processar_venda(
  cliente_nome TEXT,
  cliente_email TEXT,
  cliente_cpf TEXT DEFAULT NULL,
  produtos JSONB,
  metodo_pagamento TEXT,
  valor_total DECIMAL
)
RETURNS UUID AS $$
DECLARE
  cliente_id UUID;
  venda_id UUID;
  produto JSONB;
BEGIN
  -- Verificar se cliente já existe pelo email
  SELECT id INTO cliente_id FROM public.clientes WHERE email = cliente_email;
  
  -- Se não existe, criar novo cliente
  IF cliente_id IS NULL THEN
    INSERT INTO public.clientes (nome, email, cpf)
    VALUES (cliente_nome, cliente_email, cliente_cpf)
    RETURNING id INTO cliente_id;
  END IF;
  
  -- Criar a venda
  INSERT INTO public.vendas (id_cliente, valor_total, metodo_pagamento, status)
  VALUES (cliente_id, valor_total, metodo_pagamento, 'concluida')
  RETURNING id INTO venda_id;
  
  -- Inserir itens da venda
  FOR produto IN SELECT * FROM jsonb_array_elements(produtos)
  LOOP
    INSERT INTO public.itens_da_venda (id_venda, id_produto, preco_unitario, quantidade)
    VALUES (
      venda_id,
      (produto->>'id_produto')::UUID,
      (produto->>'preco_unitario')::DECIMAL,
      COALESCE((produto->>'quantidade')::INTEGER, 1)
    );
  END LOOP;
  
  RETURN venda_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar produtos por tipo
CREATE OR REPLACE FUNCTION public.buscar_produtos_por_tipo(tipo TEXT DEFAULT 'all')
RETURNS TABLE (
  id UUID,
  nome TEXT,
  descricao TEXT,
  preco DECIMAL,
  url_imagem TEXT,
  is_principal BOOLEAN,
  is_orderbump BOOLEAN,
  is_upsell BOOLEAN
) AS $$
BEGIN
  CASE tipo
    WHEN 'principal' THEN
      RETURN QUERY SELECT p.id, p.nome, p.descricao, p.preco, p.url_imagem, p.is_principal, p.is_orderbump, p.is_upsell
                   FROM public.produtos p WHERE p.is_principal = true;
    WHEN 'orderbump' THEN
      RETURN QUERY SELECT p.id, p.nome, p.descricao, p.preco, p.url_imagem, p.is_principal, p.is_orderbump, p.is_upsell
                   FROM public.produtos p WHERE p.is_orderbump = true;
    WHEN 'upsell' THEN
      RETURN QUERY SELECT p.id, p.nome, p.descricao, p.preco, p.url_imagem, p.is_principal, p.is_orderbump, p.is_upsell
                   FROM public.produtos p WHERE p.is_upsell = true;
    ELSE
      RETURN QUERY SELECT p.id, p.nome, p.descricao, p.preco, p.url_imagem, p.is_principal, p.is_orderbump, p.is_upsell
                   FROM public.produtos p;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para envio de email pós-venda (preparação para integração com serviço externo)
CREATE OR REPLACE FUNCTION public.trigger_email_pos_venda()
RETURNS trigger AS $$
BEGIN
  -- Esta função pode ser expandida para chamar um Edge Function
  -- que enviará o email usando Resend ou SendGrid
  PERFORM pg_notify('nova_venda', json_build_object(
    'venda_id', NEW.id,
    'cliente_id', NEW.id_cliente,
    'valor_total', NEW.valor_total,
    'metodo_pagamento', NEW.metodo_pagamento
  )::text);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_email_after_venda
  AFTER INSERT ON public.vendas
  FOR EACH ROW 
  WHEN (NEW.status = 'concluida')
  EXECUTE PROCEDURE public.trigger_email_pos_venda();

-- Índices para melhorar performance
CREATE INDEX idx_produtos_tipo ON public.produtos(is_principal, is_orderbump, is_upsell);
CREATE INDEX idx_clientes_email ON public.clientes(email);
CREATE INDEX idx_vendas_cliente ON public.vendas(id_cliente);
CREATE INDEX idx_vendas_data ON public.vendas(data_da_venda);
CREATE INDEX idx_itens_venda ON public.itens_da_venda(id_venda);
CREATE INDEX idx_configuracoes_chave ON public.configuracoes(chave);
