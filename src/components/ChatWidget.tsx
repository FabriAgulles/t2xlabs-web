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
  const [isShaking, setIsShaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies: QuickReply[] = [
    { id: '1', text: 'Consultas' },
    { id: '2', text: 'Agendar Asesoría' }
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
        content: '👋 Hola, soy Titu ¿En qué puedo ayudarte hoy?',
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

  // Shake animation every 6 seconds when widget is closed
  useEffect(() => {
    if (!isOpen) {
      const interval = setInterval(() => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 600);
      }, 6000);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const sendToWebhook = async (message: string) => {
    try {
      console.log('Enviando mensaje a webhook:', message); // Debug log
      
      const payload = {
        userId,
        message,
        timestamp: new Date().toISOString()
      };

      console.log('Payload:', payload); // Debug log

      const response = await fetch('http://localhost:5678/webhook/chatbot-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('chatbot:secure2025')
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status); // Debug log

      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data); // Debug log
        return data.reply || 'Lo siento, no pude procesar tu mensaje en este momento.';
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
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
    console.log('Quick reply clicked:', reply.text); // Debug log
    
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: reply.text,
      isBot: false,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setShowQuickReplies(false);
    
    // Simulate typing
    await simulateTyping();
    
    // Send to webhook and get response
    const botReply = await sendToWebhook(reply.text);
    
    const botMessage: Message = {
      id: crypto.randomUUID(),
      content: botReply,
      isBot: true,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, botMessage]);
    setInputDisabled(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    console.log('Sending message:', inputValue); // Debug log

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: inputValue,
      isBot: false,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue('');

    // Simulate typing
    await simulateTyping();

    // Send to webhook and get response
    const botReply = await sendToWebhook(messageToSend);
    
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
          className={`w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${
            isShaking ? 'chat-widget-shake' : ''
          }`}
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
                <p className="text-sm font-medium text-card-foreground">Titu</p>
                <p className="text-xs text-success">Asistente IA - Disponible 24/7 ✅</p>
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
