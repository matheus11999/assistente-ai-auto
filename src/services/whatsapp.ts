interface EvolutionApiConfig {
  baseUrl: string;
  instanceId: string;
  token: string;
}

interface SendMessageRequest {
  number: string;
  message: string;
}

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

export class WhatsAppService {
  private config: EvolutionApiConfig;

  constructor(config: EvolutionApiConfig) {
    this.config = config;
  }

  async sendMessage(request: SendMessageRequest): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/message/sendText/${this.config.instanceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.token}`,
        },
        body: JSON.stringify({
          number: request.number,
          options: {
            delay: 1200,
            presence: 'composing'
          },
          textMessage: {
            text: request.message
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Evolution API error: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      return false;
    }
  }

  async sendTyping(number: string): Promise<void> {
    try {
      await fetch(`${this.config.baseUrl}/chat/presence/${this.config.instanceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.token}`,
        },
        body: JSON.stringify({
          number: number,
          presence: 'composing'
        })
      });
    } catch (error) {
      console.error('Erro ao enviar typing indicator:', error);
    }
  }

  extractMessageText(webhookData: WebhookMessage): string {
    if (webhookData.message.conversation) {
      return webhookData.message.conversation;
    }
    
    if (webhookData.message.extendedTextMessage?.text) {
      return webhookData.message.extendedTextMessage.text;
    }

    return '';
  }

  extractUserNumber(webhookData: WebhookMessage): string {
    return webhookData.key.remoteJid.replace('@s.whatsapp.net', '');
  }

  isValidMessage(webhookData: WebhookMessage): boolean {
    // Ignora mensagens enviadas pela própria instância
    if (webhookData.key.fromMe) {
      return false;
    }

    // Verifica se é mensagem privada (não grupo)
    if (webhookData.key.remoteJid.includes('@g.us')) {
      return false;
    }

    // Verifica se tem texto
    const messageText = this.extractMessageText(webhookData);
    if (!messageText || messageText.trim().length === 0) {
      return false;
    }

    return true;
  }

  async getInstanceStatus(): Promise<'connected' | 'disconnected' | 'error'> {
    try {
      const response = await fetch(`${this.config.baseUrl}/instance/fetchInstances/${this.config.instanceId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
        }
      });

      if (!response.ok) {
        return 'error';
      }

      const data = await response.json();
      return data.instance?.state === 'open' ? 'connected' : 'disconnected';
    } catch (error) {
      console.error('Erro ao verificar status da instância:', error);
      return 'error';
    }
  }

  formatTechnicalResponse(productInfo: {
    nome: string;
    modelo_aparelho: string;
    preco: number;
    quantidade: number;
    descricao?: string;
  }): string {
    const emoji = {
      tool: '🛠️',
      package: '📦',
      phone: '📱',
      money: '💵',
      check: '✅',
      info: '📝',
      smile: '😊'
    };

    return `${emoji.tool} *Produto disponível!*

${emoji.package} *${productInfo.nome}*
${emoji.phone} *Compatível com:* ${productInfo.modelo_aparelho}
${emoji.money} *Preço:* R$ ${productInfo.preco.toFixed(2).replace('.', ',')}
${emoji.check} *Em estoque:* ${productInfo.quantidade} unidades
${productInfo.descricao ? `${emoji.info} ${productInfo.descricao}` : ''}

Deseja agendar o reparo? ${emoji.smile}`;
  }

  formatNotFoundResponse(aiName: string): string {
    return `Olá! Sou o *${aiName}* 👋

Não encontrei o produto específico que você mencionou em nosso estoque atual.

Para te ajudar melhor, você poderia me informar:
🔸 Modelo completo do aparelho
🔸 Qual peça precisa (tela, bateria, câmera, etc.)

Assim posso verificar se temos algo compatível! 😊`;
  }

  formatErrorResponse(aiName: string): string {
    return `Olá! Sou o *${aiName}* 👋

Desculpe, estou com dificuldades técnicas no momento.

Por favor, tente novamente em alguns minutos ou entre em contato diretamente conosco.

Obrigado pela compreensão! 🙏`;
  }
}