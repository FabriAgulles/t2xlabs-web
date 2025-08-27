import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: string;
}

interface QuickReply {
  id: string;
  text: string;
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [inputDisabled, setInputDisabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies: QuickReply[] = [
    { id: '1', text: 'Agendar demo' },
    { id: '2', text: 'Consultas' }
  ];

  // Generate or retrieve userId
  useEffect(() => {
    let storedUserId = localStorage.getItem('chatbot-user-id');
    if (!storedUserId) {
      storedUserId = crypto.randomUUID();
      localStorage.setItem('chatbot-user-id', storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  // Add initial bot message when widget opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialMessage: Message = {
        id: crypto.randomUUID(),
        content: '👋 Hola, soy Titu el asistente de t2xLabs. ¿En qué puedo ayudarte hoy?',
        isBot: true,
        timestamp: new Date().toISOString()
      };
      setMessages([initialMessage]);
    }
  }, [isOpen, messages.length]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendToWebhook = async (message: string) => {
    try {
      const payload = {
        userId,
        message,
        timestamp: new Date().toISOString()
      };

      const response = await fetch('YOUR_N8N_WEBHOOK_URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        return data.reply || 'Lo siento, no pude procesar tu mensaje en este momento.';
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending to webhook:', error);
      return 'Lo siento, hay un problema de conexión. Por favor intenta más tarde.';
    }
  };

  const simulateTyping = async (duration: number = 2000) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, duration));
    setIsTyping(false);
  };

  const handleQuickReplyClick = async (reply: QuickReply) => {
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: reply.text,
      isBot: false,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setShowQuickReplies(false);
    
    // Simulate typing and enable input
    await simulateTyping();
    
    // Bot response after quick reply
    const botResponse = reply.id === '1' 
      ? 'Perfecto! Me encantaría ayudarte a agendar una demo. ¿Podrías decirme tu nombre para personalizar nuestra conversación?'
      : 'Excelente! Estoy aquí para resolver todas tus dudas. ¿Podrías decirme tu nombre y en qué específicamente te puedo ayudar?';
    
    const botMessage: Message = {
      id: crypto.randomUUID(),
      content: botResponse,
      isBot: true,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, botMessage]);
    setInputDisabled(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: inputValue,
      isBot: false,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate typing
    await simulateTyping();

    // Send to webhook and get response
    const botReply = await sendToWebhook(inputValue);
    
    const botMessage: Message = {
      id: crypto.randomUUID(),
      content: botReply,
      isBot: true,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, botMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !inputDisabled) {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Bubble Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          style={{ backgroundColor: '#2563EB' }}
        >
          <Bot className="w-6 h-6 text-white" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 h-96 bg-card border border-card-border rounded-lg shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-card p-4 flex items-center justify-between border-b border-card-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground">t2xLabs</p>
                <p className="text-xs text-success">Asistente IA – Disponible ✅</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-card-foreground hover:bg-secondary/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    message.isBot
                      ? 'bg-secondary/20 text-card-foreground'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {/* Quick Replies */}
            {showQuickReplies && messages.length > 0 && (
              <div className="flex flex-col gap-2">
                {quickReplies.map((reply) => (
                  <Button
                    key={reply.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickReplyClick(reply)}
                    className="self-start text-xs border-primary/30 hover:bg-primary/10"
                  >
                    {reply.text}
                  </Button>
                ))}
              </div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-secondary/20 text-card-foreground p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-card-border">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={inputDisabled ? "Selecciona una opción arriba..." : "Escribe tu mensaje..."}
                disabled={inputDisabled}
                className="flex-1 text-sm border-input-border focus:border-input-focus"
              />
              <Button
                onClick={handleSendMessage}
                disabled={inputDisabled || !inputValue.trim()}
                size="icon"
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;