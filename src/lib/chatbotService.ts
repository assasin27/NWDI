export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface BargainContext {
  productId: string;
  productName: string;
  originalPrice: number;
  currentOffer?: number;
  userId: string;
  userHistory?: string[]; // past purchases or negotiations
  negotiationState?: 'initial' | 'negotiating' | 'agreed' | 'declined';
}

export interface NegotiationResult {
  response: string;
  agreedPrice?: number;
  isComplete: boolean;
  shouldAddToCart: boolean;
}

export const chatbotService = {
  async negotiatePrice(message: string, context: BargainContext): Promise<NegotiationResult> {
    // Mock negotiation - in production, use OpenAI API
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    const lowerMessage = message.toLowerCase();
    const currentPrice = context.currentOffer || context.originalPrice;

    // Check for agreement keywords
    if (lowerMessage.includes('yes') || lowerMessage.includes('deal') || lowerMessage.includes('ok') || lowerMessage.includes('accept')) {
      const finalPrice = Math.floor(currentPrice * 0.8); // Final negotiated price
      return {
        response: `Perfect! Deal accepted at ₹${finalPrice}. Adding ${context.productName} to your cart at the negotiated price.`,
        agreedPrice: finalPrice,
        isComplete: true,
        shouldAddToCart: true
      };
    }

    // Check for decline
    if (lowerMessage.includes('no') || lowerMessage.includes('nevermind') || lowerMessage.includes('cancel')) {
      return {
        response: `No problem! The original price is ₹${context.originalPrice}. Let me know if you'd like to try again.`,
        isComplete: true,
        shouldAddToCart: false
      };
    }

    // Extract numerical offer from user message
    const offerMatch = message.match(/(\d+)/);
    if (offerMatch) {
      const userOffer = parseInt(offerMatch[1]);
      const minAcceptable = Math.floor(context.originalPrice * 0.75); // Minimum acceptable price

      if (userOffer >= minAcceptable) {
        return {
          response: `₹${userOffer} sounds good! Should I add ${context.productName} to your cart at this price? (Reply 'yes' to confirm)`,
          agreedPrice: userOffer,
          isComplete: false,
          shouldAddToCart: false
        };
      } else if (userOffer >= context.originalPrice * 0.8) {
        const counterOffer = Math.floor(userOffer * 1.05);
        return {
          response: `I can do ₹${counterOffer} for you. How does that sound?`,
          currentOffer: counterOffer,
          isComplete: false,
          shouldAddToCart: false
        };
      } else {
        const counterOffer = Math.floor(context.originalPrice * 0.85);
        return {
          response: `That's quite low. I can offer ₹${counterOffer}. Would you like to accept this price?`,
          currentOffer: counterOffer,
          isComplete: false,
          shouldAddToCart: false
        };
      }
    }

    // Default responses for general negotiation
    const responses = [
      `Hi! ${context.productName} is ₹${currentPrice}. What's your offer?`,
      `That's a bit low. How about ₹${Math.floor(currentPrice * 0.9)}?`,
      `Great! We can do ₹${Math.floor(currentPrice * 0.85)} for you.`,
      `Sorry, I can't go lower than ₹${Math.floor(currentPrice * 0.8)}. Deal?`,
      `Perfect! Let's finalize at ₹${Math.floor(currentPrice * 0.8)}.`
    ];

    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      isComplete: false,
      shouldAddToCart: false
    };
  },

  async generateInitialOffer(productName: string, price: number): Promise<string> {
    return `Hi! This ${productName} is ₹${price}. Would you like to negotiate the price?`;
  }
};