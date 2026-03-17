import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { chatbotService, ChatMessage, BargainContext } from '../lib/chatbotService';
import { useSupabaseUser } from '../lib/useSupabaseUser';

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
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const context: BargainContext = {
    productId,
    productName,
    originalPrice,
    userId: user?.id || '',
    userHistory: [] // TODO: fetch user history
  };

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

    try {
      const response = await chatbotService.negotiatePrice(input, context);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

      // Check if price agreed (simple heuristic)
      const agreedPrice = extractAgreedPrice(response);
      if (agreedPrice && agreedPrice < originalPrice) {
        onPriceAgreed?.(agreedPrice);
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
            placeholder="Enter your offer..."
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={loading || !input.trim()}>
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};