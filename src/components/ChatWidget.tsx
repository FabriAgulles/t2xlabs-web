import React, { useState, useEffect, useRef, useCallback, memo, lazy, Suspense } from 'react';
import { Send, Bot, X, MessageCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Constants
const MAX_MESSAGE_LENGTH = 500;
const WEBHOOK_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

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

// Memoized Message Component
const MessageBubble = memo(({ message }: { message: Message }) => {
  const [showTimestamp, setShowTimestamp] = useState(false);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Sanitize content before rendering
  const sanitizedContent = DOMPurify.sanitize(message.content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });

  return (
    <div
      className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-fade-in`}
      onMouseEnter={() => setShowTimestamp(true)}
      onMouseLeave={() => setShowTimestamp(false)}
    >
      <div className="flex flex-col max-w-[80%]">
        <div
          className={`p-3 rounded-lg text-sm transition-all duration-200 ${
            message.isBot
              ? 'bg-secondary/20 text-card-foreground'
              : 'bg-primary text-primary-foreground'
          }`}
        >
          {message.isBot ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-0">{children}</p>,
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:opacity-80"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {sanitizedContent}
            </ReactMarkdown>
          ) : (
            <div>{message.content}</div>
          )}
        </div>
        {showTimestamp && (
          <span className="text-xs text-muted-foreground mt-1 px-1 animate-fade-in">
            {formatTime(message.timestamp)}
          </span>
        )}
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

// Memoized Typing Indicator
const TypingIndicator = memo(() => (
  <div className="flex justify-start animate-fade-in">
    <div className="bg-secondary/20 text-card-foreground p-3 rounded-lg">
      <div className="flex gap-1 items-center">
        <span className="text-xs mr-2">Titu está escribiendo</span>
        <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
      </div>
    </div>
  </div>
));

TypingIndicator.displayName = 'TypingIndicator';

// Memoized Quick Reply Buttons
const QuickReplies = memo(({
  replies,
  onReplyClick
}: {
  replies: QuickReply[];
  onReplyClick: (reply: QuickReply) => void;
}) => (
  <div className="flex flex-col gap-2 animate-fade-in">
    {replies.map((reply) => (
      <Button
        key={reply.id}
        variant="outline"
        size="sm"
        onClick={() => onReplyClick(reply)}
        className="self-start text-xs border-primary/30 hover:bg-primary/10"
        aria-label={`Respuesta rápida: ${reply.text}`}
      >
        {reply.text}
      </Button>
    ))}
  </div>
));

QuickReplies.displayName = 'QuickReplies';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [isShaking, setIsShaking] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickReplies: QuickReply[] = [
    { id: '1', text: 'Consultas' },
    { id: '2', text: 'Agendar Asesoría' }
  ];

  // Get webhook URL from environment variable
  const WEBHOOK_URL = import.meta.env.VITE_CHATBOT_WEBHOOK_URL || '';

  // Generate or retrieve userId (sessionId)
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

  // Improved smooth scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest'
    });
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

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Focus input when chat opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Retry logic with exponential backoff
  const fetchWithRetry = async (
    url: string,
    options: RequestInit,
    retries = MAX_RETRIES
  ): Promise<Response> => {
    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          return response;
        }

        // Don't retry on 4xx errors (client errors)
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`Error del cliente: ${response.status}`);
        }
      } catch (error) {
        const isLastRetry = i === retries - 1;

        if (error instanceof Error && error.name === 'AbortError') {
          if (isLastRetry) {
            throw new Error('Tiempo de espera agotado');
          }
        } else if (isLastRetry) {
          throw error;
        }

        // Exponential backoff
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));

        if (i < retries - 1) {
          setIsReconnecting(true);
        }
      }
    }

    throw new Error('Error de conexión después de varios intentos');
  };

  // Send message to webhook
  const sendToWebhook = async (message: string): Promise<string> => {
    if (!WEBHOOK_URL) {
      console.error('WEBHOOK_URL no está configurada');
      toast.error('Error de configuración', {
        description: 'La URL del webhook no está configurada'
      });
      return 'Lo siento, hay un problema de configuración. Por favor contacta al soporte.';
    }

    try {
      setIsReconnecting(false);

      // Optional: Compress payload (simple JSON)
      const payload = {
        userId, // Using userId as sessionId
        message,
        timestamp: new Date().toISOString()
      };

      // Optional: Analytics event (commented)
      // trackEvent('chatbot_message_sent', { userId, messageLength: message.length });

      const response = await fetchWithRetry(
        WEBHOOK_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      // Optional: Analytics event (commented)
      // trackEvent('chatbot_message_received', { userId });

      return data.reply || 'Lo siento, no pude procesar tu mensaje en este momento.';
    } catch (error) {
      console.error('Error sending to webhook:', error);

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

      toast.error('Error de conexión', {
        description: `No se pudo enviar el mensaje: ${errorMessage}`,
        duration: 5000
      });

      setIsReconnecting(false);
      return 'Lo siento, hay un problema de conexión. Por favor intenta más tarde.';
    }
  };

  // Handle quick reply click
  const handleQuickReplyClick = useCallback(async (reply: QuickReply) => {
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: reply.text,
      isBot: false,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setShowQuickReplies(false);
    setIsTyping(true);

    // Send to webhook and get response
    const botReply = await sendToWebhook(reply.text);

    setIsTyping(false);

    const botMessage: Message = {
      id: crypto.randomUUID(),
      content: botReply,
      isBot: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, botMessage]);
  }, [userId]);

  // Handle send message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || inputValue.length > MAX_MESSAGE_LENGTH) return;

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
    setIsTyping(true);

    // Send to webhook and get response
    const botReply = await sendToWebhook(messageToSend);

    setIsTyping(false);

    const botMessage: Message = {
      id: crypto.randomUUID(),
      content: botReply,
      isBot: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, botMessage]);
  }, [inputValue, userId]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Handle restart conversation
  const handleRestartConversation = useCallback(() => {
    setMessages([]);
    setShowQuickReplies(true);
    setInputValue('');
    setIsTyping(false);
    setIsReconnecting(false);

    toast.success('Conversación reiniciada', {
      description: 'Puedes comenzar una nueva conversación'
    });

    // Add initial message again
    setTimeout(() => {
      const initialMessage: Message = {
        id: crypto.randomUUID(),
        content: '👋 Hola, soy Titu ¿En qué puedo ayudarte hoy?',
        isBot: true,
        timestamp: new Date().toISOString()
      };
      setMessages([initialMessage]);
    }, 100);
  }, []);

  // Character count
  const remainingChars = MAX_MESSAGE_LENGTH - inputValue.length;
  const isOverLimit = remainingChars < 0;

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
          aria-label="Abrir chat con Titu"
          aria-expanded={isOpen}
        >
          <Bot className="w-6 h-6 text-white" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          className="w-80 h-96 bg-card border border-card-border rounded-lg shadow-2xl flex flex-col overflow-hidden"
          role="dialog"
          aria-labelledby="chat-title"
          aria-modal="true"
        >
          {/* Header */}
          <div className="bg-gradient-card p-4 flex items-center justify-between border-b border-card-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p id="chat-title" className="text-sm font-medium text-card-foreground">Titu</p>
                <p className="text-xs text-success">
                  {isReconnecting ? 'Reconectando...' : 'Asistente IA - Disponible 24/7 ✅'}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRestartConversation}
                className="text-card-foreground hover:bg-secondary/20"
                aria-label="Reiniciar conversación"
                title="Reiniciar conversación"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-card-foreground hover:bg-secondary/20"
                aria-label="Cerrar chat"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 p-4 overflow-y-auto space-y-3"
            role="log"
            aria-live="polite"
            aria-label="Mensajes del chat"
          >
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {/* Quick Replies */}
            {showQuickReplies && messages.length > 0 && (
              <QuickReplies
                replies={quickReplies}
                onReplyClick={handleQuickReplyClick}
              />
            )}

            {/* Typing Indicator */}
            {isTyping && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-card-border">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  maxLength={MAX_MESSAGE_LENGTH}
                  className="flex-1 text-sm border-input-border focus:border-input-focus"
                  aria-label="Escribe tu mensaje"
                  aria-describedby="char-count"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isOverLimit}
                  size="icon"
                  className="bg-primary hover:bg-primary/90"
                  aria-label="Enviar mensaje"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div
                id="char-count"
                className={`text-xs text-right ${
                  isOverLimit ? 'text-destructive' : 'text-muted-foreground'
                }`}
                aria-live="polite"
              >
                {remainingChars} caracteres restantes
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export memoized component for lazy loading
export default memo(ChatWidget);
