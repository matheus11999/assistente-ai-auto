# Assistente Técnico com IA - Sistema WhatsApp

## 📋 Visão Geral

Este é um sistema completo de assistente técnico com inteligência artificial para atendimento via WhatsApp. O sistema utiliza o OpenRouter para IA, Evolution API 2 para WhatsApp, e Supabase como backend.

## 🏗️ Arquitetura

### Frontend
- **Framework**: React 18 + Vite + TypeScript
- **UI Library**: Shadcn/ui + Radix UI
- **Estilização**: Tailwind CSS
- **Estado**: React Query (TanStack Query)
- **Roteamento**: React Router Dom
- **Autenticação**: Supabase Auth

### Backend
- **Database**: Supabase (PostgreSQL)
- **IA**: OpenRouter API
- **WhatsApp**: Evolution API 2
- **Webhooks**: Supabase Edge Functions

### Banco de Dados
- **settings**: Configurações do sistema (IA, APIs, balança)
- **produtos**: Catálogo de produtos/peças técnicas
- **logs_mensagens**: Histórico de conversas do WhatsApp

## 🚀 Como Executar

### Pré-requisitos
```bash
# Node.js 18+
# npm ou yarn
# Conta no Supabase
# Conta no OpenRouter
# Instância da Evolution API 2
```

### Instalação
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Executar migrations do Supabase
npx supabase db reset

# Iniciar o projeto em desenvolvimento
npm run dev

# Build para produção
npm run build
```

### Configuração
1. **Supabase**: Configure as credenciais em `src/integrations/supabase/client.ts`
2. **OpenRouter**: Obtenha a API key em https://openrouter.ai/keys
3. **Evolution API**: Configure sua instância e token
4. **Webhook**: Implemente as Edge Functions para receber mensagens

## 🛠️ Funcionalidades Principais

### Painel Administrativo
- ✅ **Autenticação**: Login/logout seguro via Supabase Auth
- ✅ **Configuração da IA**: Ativar/desativar, nome, modelo
- ✅ **Configuração de APIs**: OpenRouter e Evolution API
- ✅ **Gerenciamento de Produtos**: CRUD completo
- ✅ **Logs de Mensagens**: Histórico de conversas
- ✅ **Dashboard**: Métricas e estatísticas

### Bot WhatsApp
- 🔄 **Recepção de Mensagens**: Via webhook da Evolution API
- 🔄 **Processamento com IA**: Análise via OpenRouter
- 🔄 **Consulta de Produtos**: Busca no banco de dados
- 🔄 **Respostas Automáticas**: Envio via Evolution API

### Inteligência Artificial
- 🔄 **Interpretação de Mensagens**: Extrai intenção e modelo
- 🔄 **Busca de Produtos**: Consulta produtos compatíveis
- 🔄 **Formatação de Respostas**: Respostas estruturadas
- 🔄 **Contexto Técnico**: Especializado em assistência técnica

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── dashboard/          # Componentes do painel admin
│   │   ├── AIConfigTab.tsx     # Configuração da IA
│   │   ├── APIConfigTab.tsx    # Configuração das APIs
│   │   ├── ProductsTab.tsx     # Gerenciamento de produtos
│   │   ├── LogsTab.tsx         # Logs de mensagens
│   │   └── SettingsTab.tsx     # Configurações gerais
│   └── ui/                 # Componentes de interface
├── pages/
│   ├── Index.tsx          # Página inicial
│   ├── Auth.tsx           # Página de login
│   ├── Dashboard.tsx      # Painel principal
│   └── NotFound.tsx       # 404
├── integrations/
│   └── supabase/          # Configuração do Supabase
├── hooks/                 # Hooks customizados
├── lib/                   # Utilitários
└── services/              # Serviços da aplicação
    ├── whatsapp.ts        # Integration Evolution API
    ├── openrouter.ts      # Integration OpenRouter
    └── webhook.ts         # Webhook handlers
```

## 🔧 Configurações

### Variáveis de Ambiente
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Configurações no Painel
1. **Nome da IA**: Como a IA se apresenta (ex: "Atendente TechAI")
2. **Status da IA**: Ativar/desativar respostas automáticas
3. **Modelo OpenRouter**: Modelo de IA (ex: "openai/gpt-4o")
4. **API OpenRouter**: Chave da API
5. **Token Evolution**: Token de autenticação
6. **ID da Instância**: Identificador da instância WhatsApp

## 🤖 Fluxo do Bot

### Recepção de Mensagem
1. Evolution API recebe mensagem do WhatsApp
2. Webhook envia dados para o sistema
3. Sistema verifica se IA está ativa
4. Sistema valida se é mensagem privada

### Processamento com IA
1. Mensagem enviada para OpenRouter
2. IA analisa intenção e extrai modelo/produto
3. Sistema busca produtos compatíveis no banco
4. IA formata resposta estruturada

### Resposta ao Cliente
1. Resposta enviada via Evolution API
2. Conversação salva nos logs
3. Métricas atualizadas no dashboard

## 📊 Banco de Dados

### Tabela: settings
```sql
id              UUID PRIMARY KEY
nome_ia         TEXT (Nome da IA)
ia_ativa        BOOLEAN (Status da IA)
openrouter_api  TEXT (Chave da API)
openrouter_model TEXT (Modelo da IA)
evolution_token TEXT (Token Evolution)
instancia_id    TEXT (ID da instância)
balanca_status  TEXT (Status da balança)
balanca_modelo  TEXT (Modelo da balança)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### Tabela: produtos
```sql
id              UUID PRIMARY KEY
nome            TEXT (Nome do produto)
modelo_aparelho TEXT (Modelo compatível)
descricao       TEXT (Descrição)
preco           NUMERIC (Preço)
quantidade      INTEGER (Estoque)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### Tabela: logs_mensagens
```sql
id              UUID PRIMARY KEY
numero_usuario  TEXT (Número do WhatsApp)
mensagem_usuario TEXT (Mensagem recebida)
resposta_ia     TEXT (Resposta enviada)
timestamp       TIMESTAMP
```

## 🔒 Segurança

- **RLS (Row Level Security)**: Habilitado em todas as tabelas
- **Policies**: Apenas usuários autenticados podem acessar dados
- **API Keys**: Armazenadas de forma segura no Supabase
- **Autenticação**: Gerenciada pelo Supabase Auth

## 📝 Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Iniciar desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview da build

# Supabase
npx supabase start   # Iniciar Supabase local
npx supabase stop    # Parar Supabase local
npx supabase db reset # Reset do banco

# Linting e Type Check
npm run lint         # ESLint
tsc --noEmit         # Type check
```

## 🎯 Status de Implementação

### ✅ Concluído
- [x] Interface do painel administrativo
- [x] Autenticação com Supabase
- [x] Configuração das APIs
- [x] Gerenciamento de produtos
- [x] Logs de mensagens
- [x] Banco de dados com migrations
- [x] Componentes UI responsivos

### 🔄 Em Desenvolvimento
- [ ] Serviços de integração (WhatsApp, OpenRouter)
- [ ] Webhook para receber mensagens
- [ ] Processamento de IA
- [ ] Edge Functions do Supabase
- [ ] Testes automatizados

### 📋 Próximos Passos
1. Implementar serviços de integração
2. Configurar webhooks da Evolution API
3. Criar Edge Functions para processamento
4. Implementar lógica de IA
5. Testes e validação completa
6. Deploy em produção

## 🤝 Como Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas e suporte:
- Documentação: Este arquivo CLAUDE.md
- Issues: GitHub Issues
- Email: [contato@exemplo.com]

---

**Assistente Técnico com IA** - Sistema completo de atendimento WhatsApp com inteligência artificial para assistências técnicas.