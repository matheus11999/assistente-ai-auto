import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface WebhookMessage {
  key: {
    remoteJid: string;
    fromMe: boolean;
  };
  message: {
    conversation?: string;
    extendedTextMessage?: {
      text: string;
    };
  };
  pushName: string;
  messageTimestamp: number;
}

interface Settings {
  nome_ia: string;
  ia_ativa: boolean;
  openrouter_api: string;
  openrouter_model: string;
  evolution_token: string;
  instancia_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // Criar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: webhookData } = await req.json()
    console.log('📨 Webhook recebido:', JSON.stringify(webhookData, null, 2))

    // Buscar configurações
    const { data: settings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('*')
      .single()

    if (settingsError || !settings) {
      console.error('❌ Erro ao buscar configurações:', settingsError)
      return new Response('Configurações não encontradas', { status: 400 })
    }

    // Verificar se IA está ativa
    if (!settings.ia_ativa) {
      console.log('⏸️ IA desativada, ignorando mensagem')
      return new Response('IA desativada', { status: 200 })
    }

    // Validar mensagem
    const message = webhookData as WebhookMessage
    if (!isValidMessage(message)) {
      console.log('⚠️ Mensagem inválida ignorada')
      return new Response('Mensagem inválida', { status: 200 })
    }

    // Extrair dados da mensagem
    const userMessage = extractMessageText(message)
    const userNumber = extractUserNumber(message)
    const userName = message.pushName || 'Cliente'

    console.log(`👤 Processando mensagem de ${userName} (${userNumber}): "${userMessage}"`)

    // Processar com IA
    const aiResponse = await processWithAI(
      userMessage,
      userName,
      settings as Settings,
      supabaseClient
    )

    if (aiResponse) {
      // Enviar resposta via Evolution API
      const messageSent = await sendWhatsAppMessage(
        userNumber,
        aiResponse,
        settings as Settings
      )

      // Salvar log
      await supabaseClient
        .from('logs_mensagens')
        .insert({
          numero_usuario: userNumber,
          mensagem_usuario: userMessage,
          resposta_ia: messageSent ? aiResponse : null
        })

      console.log(`✅ Processamento concluído para ${userNumber}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Erro no webhook:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

function isValidMessage(message: WebhookMessage): boolean {
  // Ignora mensagens da própria instância
  if (message.key.fromMe) return false
  
  // Ignora grupos
  if (message.key.remoteJid.includes('@g.us')) return false
  
  // Verifica se tem texto
  const text = extractMessageText(message)
  return text && text.trim().length > 0
}

function extractMessageText(message: WebhookMessage): string {
  if (message.message.conversation) {
    return message.message.conversation
  }
  if (message.message.extendedTextMessage?.text) {
    return message.message.extendedTextMessage.text
  }
  return ''
}

function extractUserNumber(message: WebhookMessage): string {
  return message.key.remoteJid.replace('@s.whatsapp.net', '')
}

async function processWithAI(
  userMessage: string,
  userName: string,
  settings: Settings,
  supabaseClient: any
): Promise<string | null> {
  try {
    // Analisar mensagem com OpenRouter
    const analysis = await analyzeMessageWithAI(userMessage, settings)
    console.log('🧠 Análise da IA:', analysis)

    let response: string

    if (analysis.hasProductIntent && analysis.confidence > 0.7) {
      // Buscar produtos no banco
      const products = await searchProducts(
        analysis.extractedModel,
        analysis.extractedPart,
        supabaseClient
      )

      if (products.length > 0) {
        // Produto encontrado
        const product = products[0]
        response = formatTechnicalResponse(product)
      } else {
        // Produto não encontrado
        response = formatNotFoundResponse(settings.nome_ia)
      }
    } else {
      // Resposta genérica
      response = await generateAIResponse(userMessage, userName, settings)
    }

    return response

  } catch (error) {
    console.error('Erro no processamento IA:', error)
    return formatErrorResponse(settings.nome_ia)
  }
}

async function analyzeMessageWithAI(message: string, settings: Settings) {
  const analysisPrompt = `Analise esta mensagem e determine se o cliente está procurando por uma peça/produto:

Mensagem: "${message}"

Responda APENAS no formato JSON:
{
  "hasProductIntent": boolean,
  "extractedModel": "modelo do aparelho se identificado",
  "extractedPart": "tipo de peça se identificado",
  "confidence": número de 0 a 1
}`

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.openrouter_api}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: settings.openrouter_model,
        messages: [{ role: 'system', content: analysisPrompt }],
        max_tokens: 200,
        temperature: 0.3,
      })
    })

    const data = await response.json()
    const aiResponse = data.choices[0]?.message?.content
    return JSON.parse(aiResponse)
  } catch (error) {
    console.error('Erro na análise IA:', error)
    return { hasProductIntent: false, confidence: 0 }
  }
}

async function searchProducts(model?: string, part?: string, supabaseClient?: any) {
  try {
    if (!model && !part) return []

    let query = supabaseClient.from('produtos').select('*')

    if (model) {
      query = query.ilike('modelo_aparelho', `%${model}%`)
    }

    if (part) {
      query = query.ilike('nome', `%${part}%`)
    }

    query = query.gt('quantidade', 0).order('quantidade', { ascending: false }).limit(3)

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar produtos:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Erro na busca:', error)
    return []
  }
}

async function generateAIResponse(message: string, userName: string, settings: Settings) {
  const systemPrompt = `Você é o ${settings.nome_ia}, um assistente especializado em assistência técnica de dispositivos eletrônicos.

Seja sempre educado, profissional e útil. Use emojis moderadamente.`

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.openrouter_api}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: settings.openrouter_model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Cliente ${userName} disse: "${message}"` }
        ],
        max_tokens: 500,
        temperature: 0.7,
      })
    })

    const data = await response.json()
    return data.choices[0]?.message?.content || formatErrorResponse(settings.nome_ia)
  } catch (error) {
    console.error('Erro na resposta IA:', error)
    return formatErrorResponse(settings.nome_ia)
  }
}

async function sendWhatsAppMessage(number: string, message: string, settings: Settings): Promise<boolean> {
  try {
    const evolutionUrl = Deno.env.get('EVOLUTION_API_URL') || 'https://sua-evolution-api.com'
    
    const response = await fetch(`${evolutionUrl}/message/sendText/${settings.instancia_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.evolution_token}`,
      },
      body: JSON.stringify({
        number: number,
        options: {
          delay: 1200,
          presence: 'composing'
        },
        textMessage: {
          text: message
        }
      })
    })

    return response.ok
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error)
    return false
  }
}

function formatTechnicalResponse(product: any): string {
  return `🛠️ *Produto disponível!*

📦 *${product.nome}*
📱 *Compatível com:* ${product.modelo_aparelho}
💵 *Preço:* R$ ${product.preco.toFixed(2).replace('.', ',')}
✅ *Em estoque:* ${product.quantidade} unidades
${product.descricao ? `📝 ${product.descricao}` : ''}

Deseja agendar o reparo? 😊`
}

function formatNotFoundResponse(aiName: string): string {
  return `Olá! Sou o *${aiName}* 👋

Não encontrei o produto específico em nosso estoque atual.

Para te ajudar melhor, você poderia me informar:
🔸 Modelo completo do aparelho
🔸 Qual peça precisa (tela, bateria, câmera, etc.)

Assim posso verificar se temos algo compatível! 😊`
}

function formatErrorResponse(aiName: string): string {
  return `Olá! Sou o *${aiName}* 👋

Desculpe, estou com dificuldades técnicas no momento.

Por favor, tente novamente em alguns minutos.

Obrigado pela compreensão! 🙏`
}