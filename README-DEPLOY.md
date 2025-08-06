# 🚀 Guia de Deploy - Assistente Técnico IA

## 📋 Pré-requisitos

- Conta no [Supabase](https://supabase.com)
- Conta no [OpenRouter](https://openrouter.ai)
- Instância da [Evolution API 2](https://github.com/EvolutionAPI/evolution-api)
- Node.js 18+ instalado

## 1️⃣ Configuração do Supabase

### Criar Projeto
1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Clique em "New Project"
3. Configure nome e região
4. Anote a URL e Anon Key

### Executar Migrations
```bash
# Instalar Supabase CLI
npm install -g @supabase/cli

# Fazer login
npx supabase login

# Vincular ao projeto
npx supabase link --project-ref YOUR_PROJECT_ID

# Executar migrations
npm run supabase:migrate
```

### Deploy da Edge Function
```bash
# Deploy do webhook
npm run supabase:functions:deploy

# Ver logs em tempo real
npm run supabase:functions:logs
```

## 2️⃣ Configuração da Evolution API

### URL do Webhook
Configure no painel da Evolution API:
```
https://YOUR_SUPABASE_PROJECT.functions.supabase.co/whatsapp-webhook
```

### Eventos para Capturar
- `MESSAGE_RECEIVED`
- `MESSAGE_CREATE`

## 3️⃣ Variáveis de Ambiente

### Frontend (.env.local)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
EVOLUTION_API_URL=https://your-evolution-api.com
```

### Supabase Edge Functions
Configure no Supabase Dashboard → Settings → Edge Functions:
```
EVOLUTION_API_URL=https://your-evolution-api.com
```

## 4️⃣ Configurações no Painel Admin

Após fazer login no painel:

### 🧠 Aba IA
- **Nome da IA**: Ex: "Atendente TechAI"
- **Status**: Ativar IA
- **Modelo**: Ex: "openai/gpt-4o"

### ⚡ Aba APIs
- **OpenRouter API**: Sua chave do OpenRouter
- **Evolution Token**: Token da sua instância
- **ID da Instância**: Nome da instância configurada

### 📦 Aba Produtos
Cadastre produtos com:
- Nome da peça
- Modelo do aparelho
- Descrição
- Preço
- Quantidade em estoque

## 5️⃣ Deploy do Frontend

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer deploy
vercel

# Configurar variáveis de ambiente no dashboard
```

### Netlify
```bash
# Build do projeto
npm run build

# Fazer upload da pasta dist/
# Configurar variáveis no dashboard
```

## 6️⃣ Teste de Funcionamento

### 1. Verificar Conexões
- Evolution API: Status "connected"
- OpenRouter: API key válida
- Supabase: Dados sendo salvos

### 2. Teste de Mensagem
1. Envie mensagem via WhatsApp: "frontal do Galaxy S20"
2. Verifique logs no Supabase
3. Confirme resposta automática

### 3. Monitoramento
```bash
# Ver logs da Edge Function
npm run supabase:functions:logs

# Acompanhar mensagens no painel
```

## 🛠️ Solução de Problemas

### Webhook Não Recebe Mensagens
- Verificar URL configurada na Evolution API
- Confirmar que a Edge Function foi deployed
- Verificar logs da função

### IA Não Responde
- Confirmar que está ativada no painel
- Verificar chave da OpenRouter API
- Confirmar modelo configurado

### Produtos Não São Encontrados
- Verificar cadastro correto
- Confirmar campos modelo_aparelho e nome
- Testar busca no painel

## 📊 Monitoramento

### Métricas Importantes
- Taxa de resposta da IA
- Tempo de processamento
- Produtos mais consultados
- Erros na integração

### Logs Úteis
```bash
# Logs da Edge Function
npm run supabase:functions:logs

# Status da Evolution API
curl -H "Authorization: Bearer TOKEN" \
  https://your-evolution-api.com/instance/fetchInstances/INSTANCE_ID
```

## 🔒 Segurança

### Checklist de Segurança
- [ ] RLS habilitado no Supabase
- [ ] API keys não expostas no frontend
- [ ] Webhook com validação de assinatura
- [ ] HTTPS em todas as conexões
- [ ] Backups do banco configurados

## 📞 Suporte

- **Documentação**: Veja CLAUDE.md
- **Logs**: Supabase Dashboard → Edge Functions
- **Issues**: GitHub Issues do projeto

---

Após seguir este guia, seu assistente técnico estará funcionando completamente! 🎉