import { supabase } from '@/integrations/supabase/client';
import { WhatsAppService } from './whatsapp';
import { OpenRouterService } from './openrouter';

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

export class WebhookService {
  private whatsappService?: WhatsAppService;
  private openrouterService?: OpenRouterService;

  async processIncomingMessage(webhookData: WebhookMessage): Promise<void> {
    try {
      console.log('📨 Mensagem recebida:', webhookData);

      // Buscar configurações
      const settings = await this.getSettings();
      if (!settings) {
        console.error('❌ Configurações não encontradas');
        return;
      }

      // Verificar se IA está ativa
      if (!settings.ia_ativa) {
        console.log('⏸️ IA desativada, ignorando mensagem');
        return;
      }

      // Inicializar serviços
      await this.initializeServices(settings);
      if (!this.whatsappService || !this.openrouterService) {
        console.error('❌ Falha ao inicializar serviços');
        return;
      }

      // Validar mensagem
      if (!this.whatsappService.isValidMessage(webhookData)) {
        console.log('⚠️ Mensagem inválida ignorada');
        return;
      }

      // Extrair dados da mensagem
      const userMessage = this.whatsappService.extractMessageText(webhookData);
      const userNumber = this.whatsappService.extractUserNumber(webhookData);
      const userName = webhookData.pushName;

      console.log(`👤 Processando mensagem de ${userName} (${userNumber}): "${userMessage}"`);

      // Enviar indicador de "digitando"
      await this.whatsappService.sendTyping(userNumber);

      // Processar com IA
      const response = await this.processWithAI(
        userMessage,
        userName,
        settings.nome_ia,
        settings.openrouter_model
      );

      if (response) {
        // Enviar resposta
        const messageSent = await this.whatsappService.sendMessage({
          number: userNumber,
          message: response
        });

        // Salvar log no banco
        await this.saveMessageLog({
          numero_usuario: userNumber,
          mensagem_usuario: userMessage,
          resposta_ia: messageSent ? response : null
        });

        console.log(`✅ Resposta enviada para ${userNumber}`);
      }

    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
    }
  }

  private async getSettings(): Promise<Settings | null> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('nome_ia, ia_ativa, openrouter_api, openrouter_model, evolution_token, instancia_id')
        .single();

      if (error) throw error;
      return data as Settings;
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return null;
    }
  }

  private async initializeServices(settings: Settings): Promise<void> {
    try {
      // Inicializar WhatsApp Service
      this.whatsappService = new WhatsAppService({
        baseUrl: process.env.EVOLUTION_API_URL || 'https://sua-evolution-api.com',
        instanceId: settings.instancia_id,
        token: settings.evolution_token
      });

      // Inicializar OpenRouter Service
      this.openrouterService = new OpenRouterService({
        apiKey: settings.openrouter_api,
        model: settings.openrouter_model
      });

    } catch (error) {
      console.error('Erro ao inicializar serviços:', error);
    }
  }

  private async processWithAI(
    userMessage: string,
    userName: string,
    aiName: string,
    model: string
  ): Promise<string | null> {
    try {
      if (!this.openrouterService || !this.whatsappService) {
        return this.whatsappService?.formatErrorResponse(aiName) || null;
      }

      // Analisar mensagem para detectar intenção de produto
      const analysis = await this.openrouterService.analyzeMessage(userMessage, userName);
      console.log('🧠 Análise da IA:', analysis);

      let response: string;

      if (analysis.hasProductIntent && analysis.confidence > 0.7) {
        // Buscar produtos no banco
        const products = await this.searchProducts(
          analysis.extractedModel,
          analysis.extractedPart
        );

        if (products.length > 0) {
          // Produto encontrado - usar template estruturado
          const product = products[0]; // Usar primeiro resultado
          response = this.whatsappService.formatTechnicalResponse(product);
        } else {
          // Produto não encontrado
          response = this.whatsappService.formatNotFoundResponse(aiName);
        }
      } else {
        // Resposta genérica com contexto técnico
        response = await this.openrouterService.generateResponse(userMessage, {
          userName,
          aiName,
          noProductsFound: analysis.hasProductIntent && analysis.confidence > 0.5
        });
      }

      return response;

    } catch (error) {
      console.error('Erro no processamento com IA:', error);
      return this.whatsappService?.formatErrorResponse(aiName) || null;
    }
  }

  private async searchProducts(model?: string, part?: string): Promise<any[]> {
    try {
      if (!model && !part) {
        return [];
      }

      let query = supabase.from('produtos').select('*');

      // Buscar por modelo do aparelho
      if (model) {
        const normalizedModel = this.normalizeSearchTerm(model);
        query = query.ilike('modelo_aparelho', `%${normalizedModel}%`);
      }

      // Buscar por tipo de peça no nome
      if (part) {
        const normalizedPart = this.normalizeSearchTerm(part);
        query = query.ilike('nome', `%${normalizedPart}%`);
      }

      // Filtrar apenas produtos em estoque
      query = query.gt('quantidade', 0);

      // Ordenar por estoque e relevância
      query = query.order('quantidade', { ascending: false }).limit(3);

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
      }

      return data || [];

    } catch (error) {
      console.error('Erro na busca de produtos:', error);
      return [];
    }
  }

  private normalizeSearchTerm(term: string): string {
    return term
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, ' '); // Normaliza espaços
  }

  private async saveMessageLog(logData: {
    numero_usuario: string;
    mensagem_usuario: string;
    resposta_ia: string | null;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('logs_mensagens')
        .insert(logData);

      if (error) {
        console.error('Erro ao salvar log:', error);
      }
    } catch (error) {
      console.error('Erro ao salvar log da mensagem:', error);
    }
  }

  async validateWebhookSignature(payload: string, signature: string, secret: string): Promise<boolean> {
    try {
      // Implementar validação de assinatura do webhook se necessário
      // Por enquanto, retorna true para permitir desenvolvimento
      return true;
    } catch (error) {
      console.error('Erro na validação do webhook:', error);
      return false;
    }
  }

  async getWebhookStatus(): Promise<{
    status: 'active' | 'error' | 'inactive';
    lastMessage?: Date;
    messageCount?: number;
  }> {
    try {
      // Verificar última mensagem processada
      const { data: lastLog } = await supabase
        .from('logs_mensagens')
        .select('timestamp')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      // Contar mensagens das últimas 24h
      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 24);

      const { count } = await supabase
        .from('logs_mensagens')
        .select('*', { count: 'exact' })
        .gte('timestamp', oneDayAgo.toISOString());

      return {
        status: 'active',
        lastMessage: lastLog?.timestamp ? new Date(lastLog.timestamp) : undefined,
        messageCount: count || 0
      };

    } catch (error) {
      console.error('Erro ao verificar status do webhook:', error);
      return { status: 'error' };
    }
  }
}