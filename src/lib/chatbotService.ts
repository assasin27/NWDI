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
}

export const chatbotService = {
  async negotiatePrice(message: string, context: BargainContext): Promise<string> {
    // Mock negotiation - in production, use OpenAI API
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    const responses = [
      `Hi! ${context.productName} is ₹${context.originalPrice}. What's your offer?`,
      `That's a bit low. How about ₹${Math.floor(context.originalPrice * 0.9)}?`,
      `Great! We can do ₹${Math.floor(context.originalPrice * 0.85)} for you.`,
      `Sorry, I can't go lower than ₹${Math.floor(context.originalPrice * 0.8)}. Deal?`,
      `Perfect! Let's finalize at ₹${Math.floor(context.originalPrice * 0.8)}.`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  },

  async generateInitialOffer(productName: string, price: number): Promise<string> {
    return `Hi! This ${productName} is ₹${price}. Would you like to negotiate the price?`;
  }
};