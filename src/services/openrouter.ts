interface OpenRouterConfig {
  apiKey: string;
  model: string;
  baseUrl?: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ProductAnalysis {
  hasProductIntent: boolean;
  extractedModel?: string;
  extractedPart?: string;
  confidence: number;
}

export class OpenRouterService {
  private config: OpenRouterConfig;
  private systemPrompt: string;

  constructor(config: OpenRouterConfig) {
    this.config = {
      baseUrl: 'https://openrouter.ai/api/v1',
      ...config
    };
    
    this.systemPrompt = `Você é um assistente especializado em assistência técnica de dispositivos eletrônicos, especialmente celulares, tablets e dispositivos móveis.

Suas responsabilidades:
1. Analisar mensagens de clientes procurando por peças/componentes
2. Extrair modelo específico do aparelho mencionado
3. Identificar qual peça o cliente precisa
4. Responder de forma técnica mas amigável

Quando receber uma mensagem:
- Se o cliente mencionar um produto/peça específica, extraia: MODELO do aparelho e TIPO de peça
- Se não conseguir identificar claramente, peça mais informações
- Seja sempre educado e profissional
- Use emojis moderadamente para ser mais amigável

Exemplos de análise:
"Vocês têm frontal do Galaxy S20?" → Modelo: "Galaxy S20", Peça: "frontal"
"Bateria do iPhone 12" → Modelo: "iPhone 12", Peça: "bateria"  
"Câmera traseira Xiaomi Note 11" → Modelo: "Redmi Note 11", Peça: "câmera traseira"

Responda sempre em português brasileiro.`;
  }

  async analyzeMessage(userMessage: string, userName?: string): Promise<ProductAnalysis> {
    try {
      const analysisPrompt = `Analise esta mensagem de cliente e determine se ele está procurando por uma peça/produto específico:

Mensagem: "${userMessage}"

Responda APENAS no formato JSON:
{
  "hasProductIntent": boolean,
  "extractedModel": "modelo exato se identificado",
  "extractedPart": "tipo de peça se identificado", 
  "confidence": numero de 0 a 1
}

Exemplos:
"frontal do galaxy s20" → {"hasProductIntent": true, "extractedModel": "Galaxy S20", "extractedPart": "frontal", "confidence": 0.9}
"oi, bom dia" → {"hasProductIntent": false, "confidence": 0.1}`;

      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://assistente-tecnico.com',
          'X-Title': 'Assistente Técnico IA'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: 'system', content: analysisPrompt }
          ],
          max_tokens: 200,
          temperature: 0.3,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;

      try {
        return JSON.parse(aiResponse) as ProductAnalysis;
      } catch (parseError) {
        console.error('Erro ao fazer parse da análise AI:', parseError);
        return {
          hasProductIntent: false,
          confidence: 0
        };
      }
    } catch (error) {
      console.error('Erro na análise OpenRouter:', error);
      return {
        hasProductIntent: false,
        confidence: 0
      };
    }
  }

  async generateResponse(
    userMessage: string,
    context?: {
      userName?: string;
      aiName: string;
      foundProducts?: any[];
      noProductsFound?: boolean;
    }
  ): Promise<string> {
    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: this.systemPrompt }
      ];

      let contextInfo = '';
      if (context?.foundProducts && context.foundProducts.length > 0) {
        contextInfo = `\n\nProdutos encontrados no estoque: ${JSON.stringify(context.foundProducts)}`;
      } else if (context?.noProductsFound) {
        contextInfo = '\n\nNenhum produto encontrado no estoque para a consulta.';
      }

      const userPrompt = `Cliente ${context?.userName || 'usuário'} disse: "${userMessage}"${contextInfo}

Como ${context?.aiName || 'assistente técnico'}, responda de forma útil e profissional.`;

      messages.push({ role: 'user', content: userPrompt });

      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://assistente-tecnico.com',
          'X-Title': 'Assistente Técnico IA'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: messages,
          max_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          frequency_penalty: 0.3,
          presence_penalty: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta adequada.';

    } catch (error) {
      console.error('Erro ao gerar resposta OpenRouter:', error);
      throw error;
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.config.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        }
      });

      if (!response.ok) {
        return {
          success: false,
          error: `API Key inválida ou erro de conexão: ${response.status}`
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Erro de rede: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }

  normalizeModel(model: string): string {
    const modelMap: Record<string, string[]> = {
      'Galaxy S20': ['galaxy s20', 'g980f', 'sm-g980f', 's20'],
      'Galaxy S21': ['galaxy s21', 'g991f', 'sm-g991f', 's21'],
      'iPhone 12': ['iphone 12', 'a2172', 'iph12'],
      'iPhone 13': ['iphone 13', 'a2633', 'iph13'],
      'Redmi Note 11': ['redmi note 11', 'note11', 'redmi 11'],
      'Redmi Note 12': ['redmi note 12', 'note12', 'redmi 12'],
    };

    const normalizedInput = model.toLowerCase().trim();
    
    for (const [standardModel, variations] of Object.entries(modelMap)) {
      if (variations.some(variation => normalizedInput.includes(variation))) {
        return standardModel;
      }
    }

    return model;
  }

  normalizePartType(part: string): string {
    const partMap: Record<string, string[]> = {
      'frontal': ['frontal', 'tela', 'display', 'touch', 'lcd'],
      'bateria': ['bateria', 'battery'],
      'camera': ['camera', 'câmera', 'cam'],
      'alto-falante': ['alto-falante', 'speaker', 'som'],
      'microfone': ['microfone', 'mic'],
      'conector': ['conector', 'entrada', 'porta'],
    };

    const normalizedInput = part.toLowerCase().trim();
    
    for (const [standardPart, variations] of Object.entries(partMap)) {
      if (variations.some(variation => normalizedInput.includes(variation))) {
        return standardPart;
      }
    }

    return part;
  }
}