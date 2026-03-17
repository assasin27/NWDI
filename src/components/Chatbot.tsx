import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { chatbotService, ChatMessage, BargainContext, NegotiationResult } from '../lib/chatbotService';
import { useSupabaseUser } from '../lib/useSupabaseUser';

interface ChatbotProps {
  productId: string;
  productName: string;
  originalPrice: number;
  onPriceAgreed?: (agreedPrice: number) => void;
  onAddToCart?: (productId: string, negotiatedPrice: number) => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({
  productId,
  productName,
  originalPrice,
  onPriceAgreed,
  onAddToCart
}) => {
  const { user } = useSupabaseUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [negotiationComplete, setNegotiationComplete] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [context, setContext] = useState<BargainContext>({
    productId,
    productName,
    originalPrice,
    userId: user?.id || '',
    userHistory: [],
    negotiationState: 'initial'
  });

  useEffect(() => {
    // Initialize with AI greeting
    const initChat = async () => {
      const greeting = await chatbotService.generateInitialOffer(productName, originalPrice);
      const initialMessage: ChatMessage = {
        id: '1',
        role: 'assistant',
        content: greeting,
        timestamp: new Date()
      };
      setMessages([initialMessage]);
    };
    initChat();
  }, [productName, originalPrice]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading || negotiationComplete) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const result: NegotiationResult = await chatbotService.negotiatePrice(input, context);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

      // Update context with current offer if provided
      if (result.agreedPrice) {
        setContext(prev => ({ ...prev, currentOffer: result.agreedPrice }));
      }

      // Handle negotiation completion
      if (result.isComplete) {
        setNegotiationComplete(true);
        
        if (result.shouldAddToCart && result.agreedPrice) {
          // Add to cart automatically
          onAddToCart?.(productId, result.agreedPrice);
          
          // Show success message
          const successMessage: ChatMessage = {
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: `✅ ${productName} has been added to your cart at ₹${result.agreedPrice}!`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, successMessage]);
        } else if (result.agreedPrice) {
          // Price agreed but waiting for confirmation
          onPriceAgreed?.(result.agreedPrice);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const extractAgreedPrice = (response: string): number | null => {
    const priceMatch = response.match(/₹(\d+)/);
    return priceMatch ? parseInt(priceMatch[1]) : null;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <Card className="w-full max-w-md h-96 flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Price Negotiation</CardTitle>
        {negotiationComplete && (
          <div className="text-sm text-green-600 font-medium">
            Negotiation Complete
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm">
                  Thinking...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex gap-2 mt-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={negotiationComplete ? "Negotiation complete" : "Enter your offer..."}
            disabled={loading || negotiationComplete}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={loading || !input.trim() || negotiationComplete}
          >
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};