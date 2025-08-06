-- Criar tabela de configurações do sistema
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_ia TEXT DEFAULT 'Atendente TechAI',
  ia_ativa BOOLEAN DEFAULT false,
  openrouter_api TEXT,
  openrouter_model TEXT DEFAULT 'openai/gpt-4o',
  evolution_token TEXT,
  instancia_id TEXT,
  balanca_status TEXT DEFAULT 'Desconectado',
  balanca_modelo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de produtos
CREATE TABLE public.produtos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  modelo_aparelho TEXT NOT NULL,
  descricao TEXT,
  preco NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantidade INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de logs de mensagens
CREATE TABLE public.logs_mensagens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_usuario TEXT NOT NULL,
  mensagem_usuario TEXT NOT NULL,
  resposta_ia TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_mensagens ENABLE ROW LEVEL SECURITY;

-- Criar policies para authenticated users apenas
CREATE POLICY "Authenticated users can view settings" 
ON public.settings 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update settings" 
ON public.settings 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert settings" 
ON public.settings 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage produtos" 
ON public.produtos 
FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view logs" 
ON public.logs_mensagens 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert logs" 
ON public.logs_mensagens 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Função para atualizar timestamps automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar timestamps
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_produtos_updated_at
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configuração inicial
INSERT INTO public.settings (nome_ia, ia_ativa) VALUES ('Atendente TechAI', false);

-- Inserir alguns produtos de exemplo
INSERT INTO public.produtos (nome, modelo_aparelho, descricao, preco, quantidade) VALUES
('Frontal Samsung Galaxy S20', 'Galaxy S20 (SM-G980F)', 'Display touch completo para Samsung Galaxy S20 com garantia de 90 dias', 189.90, 5),
('Bateria iPhone 12', 'iPhone 12', 'Bateria original para iPhone 12 com kit de ferramentas incluído', 149.90, 8),
('Camera Traseira Xiaomi Redmi Note 11', 'Redmi Note 11', 'Câmera traseira principal 50MP para Xiaomi Redmi Note 11', 89.90, 3);