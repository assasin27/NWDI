export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  content: string;
  usingFallback: boolean;
}

export interface BargainContext {
  productId: string;
  productName: string;
  originalPrice: number;
  currentOffer?: number;
  userId: string;
  userHistory?: string[]; // past purchases or negotiations
  conversationHistory?: Array<{role: 'user' | 'assistant', content: string}>; // Add conversation history
  negotiationState?: 'initial' | 'negotiating' | 'agreed' | 'declined';
}

export interface NegotiationResult {
  response: string;
  agreedPrice?: number;
  isComplete: boolean;
  shouldAddToCart: boolean;
}

export const chatbotService = {
  // Simple in-memory cart storage keyed by userId.
  cart: {} as Record<string, Array<{ productId: string; price: number }>>,

  addToCart(userId: string, productId: string, price: number) {
    if (!this.cart[userId]) {
      this.cart[userId] = [];
    }
    this.cart[userId].push({ productId, price });
  },

  getCart(userId: string) {
    return this.cart[userId] ?? [];
  },

  getMaxDiscountPercent(originalPrice: number): number {
    // Cheaper items get up to 10% discount, more expensive items up to 20%
    return originalPrice <= 500 ? 10 : 20;
  },

  getMinAllowedPrice(originalPrice: number): number {
    const maxDiscount = this.getMaxDiscountPercent(originalPrice);
    return Math.round(originalPrice * (1 - maxDiscount / 100));
  },

  getLastProposedPrice(context: BargainContext): number | null {
    if (context.currentOffer && context.currentOffer > 0) {
      return context.currentOffer;
    }

    const history = context.conversationHistory ?? [];
    for (let i = history.length - 1; i >= 0; i--) {
      const msg = history[i];
      if (msg.role === 'assistant') {
        const match = msg.content.match(/₹\s*([\d.]+)/);
        if (match) {
          return parseFloat(match[1]);
        }
      }
    }

    return null;
  },

  getLastAssistantMessage(context: BargainContext): string | null {
    const history = context.conversationHistory ?? [];
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].role === 'assistant') {
        return history[i].content;
      }
    }
    return null;
  },

  getConfirmablePriceFromAssistant(context: BargainContext): number | null {
    const assistant = this.getLastAssistantMessage(context);
    if (!assistant) return null;

    const priceMatch = assistant.match(/₹\s*([\d.]+)/);
    const hasConfirmCue =
      /lock (?:this|it) in/i.test(assistant) ||
      /reply\s*["']?yes["']?/i.test(assistant) ||
      /add (?:it )?to your cart/i.test(assistant);

    if (priceMatch && hasConfirmCue) {
      return parseFloat(priceMatch[1]);
    }
    return null;
  },

  shouldRequireLoginConfirmation(message: string, context: BargainContext): boolean {
    const lower = message.toLowerCase().trim();
    const isYes = lower === 'yes' || lower === 'y' || lower === 'yeah';
    const confirmablePrice = this.getConfirmablePriceFromAssistant(context);
    return !context.userId && isYes && !!confirmablePrice;
  },

  async negotiatePrice(message: string, context: BargainContext): Promise<ChatResponse> {
    // If the user is trying to confirm a price but isn't logged in, don't call the LLM
    if (this.shouldRequireLoginConfirmation(message, context)) {
      const confirmablePrice = this.getConfirmablePriceFromAssistant(context)!;
      return {
        content: `Please log in first so I can add this to your cart. Once you're logged in, reply "yes" to confirm ₹${confirmablePrice}.`,
        usingFallback: true
      };
    }

    try {
      // Build conversation history for context
      const conversationContext = context.conversationHistory ? 
        context.conversationHistory.slice(-6).map(msg => 
          `${msg.role === 'user' ? 'Customer' : 'Assistant'}: ${msg.content}`
        ).join('\n') : '';

      const maxDiscountPercent = this.getMaxDiscountPercent(context.originalPrice);
      const minAllowedPrice = this.getMinAllowedPrice(context.originalPrice);

      const systemPrompt = `You are an intelligent price negotiation assistant for a farm fresh marketplace. You have excellent negotiation skills and maintain professional, friendly relationships with customers.

PRODUCT DETAILS:
- Product: ${context.productName}
- Original Price: ₹${context.originalPrice}
- Current Offer: ₹${context.currentOffer || 'None yet'}
- Pending Deal: ${context.currentOffer ? `₹${context.currentOffer} (awaiting confirmation)` : 'None'}

CONVERSATION HISTORY:
${conversationContext}

CURRENT CUSTOMER MESSAGE: "${message}"

NEGOTIATION GUIDELINES:
- Be conversational and build rapport
- Start from original price and negotiate down gradually (typically 5-15% discounts)
- Never go below the allowed minimum price
- Focus only on price negotiation; do not ask broad preference questions or request more details
- If the buyer says "yes" after a price offer, confirm that exact price and stop asking for budget
- Always use ₹ symbol for prices
- Ask questions to understand customer needs and budget
- Be persuasive but fair - focus on product quality and value
- Consider the conversation history to avoid repeating yourself
- If there's a pending deal awaiting confirmation, focus on getting confirmation rather than offering new deals
- ONLY offer a final deal when the customer has made a specific price offer or clearly agreed to a specific price you've proposed
- If customer just says "yes" to negotiate, start the negotiation by asking for their offer
- If customer agrees to a specific price you've offered, then confirm the deal
- End negotiations positively when deal is reached
- Vary your responses - don't be repetitive
- Show personality and be helpful
- Avoid phrases like "Sounds good!" or "If you'd like..." – keep answers direct and action‑oriented.

Respond naturally as a skilled negotiation assistant:
- Maximum discount: ${maxDiscountPercent}% (never go below ₹${minAllowedPrice})`;

      const response = await this.callLLM(systemPrompt);
      return { content: response, usingFallback: false };
    } catch (error) {
      console.error('LLM API error:', error);
      // Fallback to intelligent mock responses
      const fallbackContent = await this.getIntelligentFallbackResponse(message, context);
      return { content: fallbackContent, usingFallback: true };
    }
  },

  async generateInitialOffer(productName: string, price: number): Promise<ChatResponse> {
    try {
      const systemPrompt = `You are a friendly assistant for a farm fresh marketplace. Introduce yourself and the product, then invite price negotiation.

Product: ${productName}
Price: ₹${price}

Be welcoming, mention the product quality, and ask if they'd like to negotiate the price. Keep it under 50 words.`;

      const response = await this.callLLM(systemPrompt);
      return { content: response, usingFallback: false };
    } catch (error) {
      console.error('LLM API error:', error);
      return { content: `Hi! This fresh ${productName} is ₹${price}. Would you like to negotiate the price?`, usingFallback: true };
    }
  },

  async callLLM(prompt: string): Promise<string> {
    // Try multiple LLM providers in order of preference
    const providers = [
      this.callGrokAPI,
      this.callOpenAI,
      this.callAnthropic,
      this.callTogetherAI,
      this.callCohere,
      this.callHuggingFaceAPI,
    ];

    for (const provider of providers) {
      try {
        const raw = await provider.call(this, prompt);

        // Strip common “Sounds good…” / “If you'd like…” fluff from LLM responses
        return raw.replace(/^(Sounds good[.!]?(\s+If you'd like[^\n]*\n?)?)/i, '').trim();
      } catch (error) {
        console.warn(`LLM provider failed:`, error);
        continue;
      }
    }

    throw new Error('All LLM providers failed');
  },

  async callGrokAPI(prompt: string): Promise<string> {
    const API_KEY = import.meta.env.VITE_XAI_API_KEY;
    const API_URL = 'https://api.x.ai/v1/chat/completions';

    if (!API_KEY) {
      throw new Error('XAI API key not configured');
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Grok API failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
  },

  async callOpenAI(prompt: string): Promise<string> {
    const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
    const API_URL = 'https://api.openai.com/v1/chat/completions';

    if (!API_KEY) throw new Error('OpenAI API key not configured');

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI API failed: ${response.status}`);

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
  },

  async callAnthropic(prompt: string): Promise<string> {
    const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
    const API_URL = 'https://api.anthropic.com/v1/chat/completions';

    if (!API_KEY) throw new Error('Anthropic API key not configured');

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({
        model: 'claude-2.1',
        messages: [{ role: 'user', content: prompt }],
        max_tokens_to_sample: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error(`Anthropic API failed: ${response.status}`);

    const data = await response.json();
    return data?.completion || 'Sorry, I couldn\'t generate a response.';
  },

  async callTogetherAI(prompt: string): Promise<string> {
    const API_KEY = import.meta.env.VITE_TOGETHER_API_KEY;
    const API_URL = 'https://api.together.xyz/v1/chat/completions';

    if (!API_KEY) {
      throw new Error('Together AI API key not configured');
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistralai/Mistral-7B-Instruct-v0.1',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Together AI failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
  },

  async callCohere(prompt: string): Promise<string> {
    const API_KEY = import.meta.env.VITE_COHERE_API_KEY;
    const API_URL = 'https://api.cohere.ai/generate';

    if (!API_KEY) throw new Error('Cohere API key not configured');

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'command-xlarge-nightly',
        prompt,
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error(`Cohere API failed: ${response.status}`);

    const data = await response.json();
    return data?.generations?.[0]?.text || 'Sorry, I couldn\'t generate a response.';
  },

  async callHuggingFaceAPI(prompt: string): Promise<string> {
    const API_KEY = import.meta.env.VITE_HF_API_KEY;
    const API_URL = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';

    if (!API_KEY) {
      throw new Error('Hugging Face API key not configured');
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 100,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API failed: ${response.status}`);
    }

    const data = await response.json();
    return data[0]?.generated_text || 'Sorry, I couldn\'t generate a response.';
  },

  async getIntelligentFallbackResponse(message: string, context: BargainContext): Promise<string> {
    // Try using the LLM first (better than pure hardcoded rules)
    try {
      const prompt = `You are a price negotiation assistant for a farm fresh marketplace.
Product: ${context.productName}
Original Price: ₹${context.originalPrice}
Customer message: "${message}"

Reply as a helpful negotiation assistant. Keep it short and focused on price.`;
      const llmResponse = await this.callLLM(prompt);
      if (llmResponse?.trim()) {
        return llmResponse;
      }
    } catch (e) {
      // fall back to local rules below
    }

    const lowerMessage = message.toLowerCase();
    const messageLength = context.conversationHistory?.length || 0;

    // Calculate price constraints early so they're available throughout
    const maxDiscountPercent = this.getMaxDiscountPercent(context.originalPrice);
    const minAllowedPrice = this.getMinAllowedPrice(context.originalPrice);

    // Analyze user message for intent
    const isOffering = /\d+/.test(message) || lowerMessage.includes('offer') || lowerMessage.includes('pay');
    const isAgreeing = lowerMessage.includes('deal') || lowerMessage.includes('ok') || lowerMessage.includes('sure') || lowerMessage.includes('confirm') || (lowerMessage.includes('yes') && messageLength > 1);
    const isRejecting = lowerMessage.includes('no') || lowerMessage.includes('too much') || lowerMessage.includes('expensive');
    const isQuestioning = lowerMessage.includes('?') || lowerMessage.includes('why') || lowerMessage.includes('how');
    const isSimpleYes = lowerMessage.trim() === 'yes' || lowerMessage.trim() === 'y' || lowerMessage.trim() === 'yeah';

    // Extract offered price if present
    const priceMatch = message.match(/(\d+)/);
    const offeredPrice = priceMatch ? parseInt(priceMatch[1]) : null;

    // Detect if assistant already proposed/locked in a price
    const lastAssistant = this.getLastAssistantMessage(context);
    const lastLockedInPrice = lastAssistant?.match(/locked in at ₹\s*([\d.]+)/i)?.[1];

    const confirmablePrice = this.getConfirmablePriceFromAssistant(context);

    if ((isSimpleYes || isAgreeing) && confirmablePrice) {
      if (!context.userId) {
        return `Please log in first so I can add this to your cart. Once you're logged in, reply "yes" to confirm ₹${confirmablePrice}.`;
      }

      // Add to in-memory cart
      this.addToCart(context.userId, context.productId, confirmablePrice);
      const cartItems = this.getCart(context.userId);
      return `Confirmed. ₹${confirmablePrice} has been added to your cart (you now have ${cartItems.length} item${cartItems.length === 1 ? '' : 's'}).`;
    }

    // If user says "yes" right after the initial greeting, treat it as "let's negotiate"
    if (isSimpleYes && messageLength === 1 && !offeredPrice) {
      return `Great! What's your best offer for this ${context.productName}?`;
    }

    if (offeredPrice !== null) {
      if (offeredPrice >= minAllowedPrice) {
        return `That works! Let's lock it in at ₹${offeredPrice}. Reply "yes" to add it to your cart.`;
      }

      const counter = Math.max(
        minAllowedPrice,
        Math.round((context.originalPrice + offeredPrice) / 2)
      );
      return `I appreciate your offer. The best I can do is ₹${counter}. Does that work?`;
    }

    // If user says "no" (not offering a price), end the chat politely
    if (isRejecting && !isOffering) {
      return `No problem. If you'd like to negotiate later, just say so and I’ll be here to help.`;
    }

    if (isRejecting) {
      return `I understand quality comes at a price. The best I can offer is ₹${minAllowedPrice}. Would that work for you?`;
    }

    // Keep fallback focused on price negotiation rather than open-ended conversation
    return `Please provide a price you'd like to pay for this ${context.productName}, or reply "yes" if you agree to the last price I suggested.`;
  }
};