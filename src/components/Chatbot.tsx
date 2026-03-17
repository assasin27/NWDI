import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { chatbotService, ChatMessage, BargainContext } from '../lib/chatbotService';
import { useSupabaseUser } from '../lib/useSupabaseUser';
import { MessageCircle } from 'lucide-react';

interface ChatbotProps {
  productId: string;
  productName: string;
  originalPrice: number;
  onPriceAgreed?: (agreedPrice: number) => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({
  productId,
  productName,
  originalPrice,
  onPriceAgreed
}) => {
  const { user } = useSupabaseUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [pendingDeal, setPendingDeal] = useState<{price: number; productName: string} | null>(null);

  const context: BargainContext = {
    productId,
    productName,
    originalPrice,
    userId: user?.id || '',
    userHistory: [], // TODO: fetch user history
    conversationHistory: messages.map(msg => ({ role: msg.role, content: msg.content })),
    currentOffer: pendingDeal?.price
  };

  useEffect(() => {
    // Initialize with AI greeting
    const initChat = async () => {
      const response = await chatbotService.generateInitialOffer(productName, originalPrice);
      const initialMessage: ChatMessage = {
        id: '1',
        role: 'assistant',
        content: response.content,
        timestamp: new Date()
      };
      setMessages([initialMessage]);
      setUsingFallback(response.usingFallback);
    };
    initChat();
  }, [productName, originalPrice]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Quick shortcut: if user explicitly says "agreed at ₹X" (or similar), treat as confirmation
    const agreementMatch = input.match(/agreed (?:at )?₹?(\d+)/i);
    if (agreementMatch) {
      const agreedPrice = parseInt(agreementMatch[1]);
      const agreementMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Got it — locking it in at ₹${agreedPrice} as you requested. Adding to cart now...`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agreementMessage]);

      setTimeout(() => {
        onPriceAgreed?.(agreedPrice);
      }, 500);

      return;
    }

    try {
      const response = await chatbotService.negotiatePrice(input, context);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setUsingFallback(response.usingFallback);

      // Check if user is confirming a pending deal
      if (pendingDeal && (/(yes|yep|sure|add|confirm)/i.test(input))) {
        const confirmationMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: `Perfect! I've added ${pendingDeal.productName} to your cart at ₹${pendingDeal.price}. The deal is sealed! 🎉`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, confirmationMessage]);

        // Call the callback after showing confirmation
        setTimeout(() => {
          onPriceAgreed?.(pendingDeal.price);
          setPendingDeal(null); // Clear pending deal
        }, 1500);
        return; // Don't check for new agreements if confirming existing deal
      }

      // Check if the AI suggested a price and we should prompt for confirmation
      const suggestedPrice = extractSuggestedPrice(response.content);
      if (suggestedPrice && suggestedPrice < originalPrice) {
        setPendingDeal({ price: suggestedPrice, productName });
        const promptMessage: ChatMessage = {
          id: (Date.now() + 3).toString(),
          role: 'assistant',
          content: `Sounds good! If you'd like, I can lock this in at ₹${suggestedPrice}. Just reply "yes" to add it to your cart, or keep negotiating if you'd like a better price.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, promptMessage]);
        return;
      }

      // Check if price agreed (final deal)
      const agreedPrice = extractAgreedPrice(response.content);
      if (agreedPrice && agreedPrice < originalPrice) {
        // Set pending deal and ask for confirmation
        setPendingDeal({ price: agreedPrice, productName });
        const successMessage: ChatMessage = {
          id: (Date.now() + 4).toString(),
          role: 'assistant',
          content: `🎉 Great! We have a deal at ₹${agreedPrice} for this ${productName}. Would you like me to add it to your cart now? (Reply "yes" to add, or continue negotiating if you'd like a better price)`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setUsingFallback(true);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Using basic responses for now.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const extractAgreedPrice = (response: string): number | null => {
    const lowerResponse = response.toLowerCase();

    // More specific agreement detection - look for explicit final agreements
    const finalAgreementPatterns = [
      /deal at ₹(\d+)/i,
      /final price.*₹(\d+)/i,
      /agreed.*₹(\d+)/i,
      /settle.*₹(\d+)/i,
      /we have a deal at ₹(\d+)/i,
      /yours at ₹(\d+)/i,
      /lock (?:it )?in at ₹(\d+)/i,
      /locking (?:it )?in at ₹(\d+)/i
    ];

    // Check for final agreement language
    for (const pattern of finalAgreementPatterns) {
      const match = response.match(pattern);
      if (match && match[1]) {
        return parseInt(match[1]);
      }
    }

    // Fallback: check for very specific agreement keywords with price
    const agreementKeywords = ['final price', 'agreed price', 'deal at', 'settle at', 'lock in', 'locking in'];
    const hasSpecificAgreement = agreementKeywords.some(keyword => lowerResponse.includes(keyword));

    if (hasSpecificAgreement) {
      const priceMatch = response.match(/₹(\d+)/);
      return priceMatch ? parseInt(priceMatch[1]) : null;
    }

    return null;
  };

  const extractSuggestedPrice = (response: string): number | null => {
    const lowerResponse = response.toLowerCase();

    const suggestionPatterns = [
      /best i can do is ₹(\d+)/i,
      /could we settle at ₹(\d+)/i,
      /how about we meet in the middle at ₹(\d+)/i,
      /i can do ₹(\d+)/i,
      /let's do ₹(\d+)/i,
      /i can offer ₹(\d+)/i
    ];

    for (const pattern of suggestionPatterns) {
      const match = response.match(pattern);
      if (match && match[1]) {
        return parseInt(match[1]);
      }
    }

    // Fallback: catch phrases where assistant proposes a price without 'deal' wording
    const priceMatch = response.match(/₹(\d+)/);
    if (priceMatch) {
      // Avoid treating simple numbers as suggestions if they look like user quotes etc.
      const isQuestion = response.trim().endsWith('?');
      if (!isQuestion) {
        return parseInt(priceMatch[1]);
      }
    }

    return null;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <Card className="w-full max-w-md h-[500px] flex flex-col shadow-lg border-2">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            <span>Price Negotiation</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 min-h-0">
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-3 pb-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[280px] px-3 py-2 rounded-lg text-sm break-words ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {msg.content}
                  <div className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm max-w-[280px]">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex gap-2 mt-4 pt-3 border-t flex-shrink-0">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your offer or message..."
            disabled={loading}
            className="flex-1 text-sm"
          />
          <Button 
            onClick={sendMessage} 
            disabled={loading || !input.trim()}
            size="sm"
            className="px-4 flex-shrink-0"
          >
            {loading ? '...' : 'Send'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};