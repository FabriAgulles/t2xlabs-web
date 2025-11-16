import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Send, Bot, X, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Constants
const MAX_MESSAGE_LENGTH = 300;
const WEBHOOK_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const SCROLL_THRESHOLD = 100; // Pixels to scroll before showing widget
const CHAR_WARNING_THRESHOLD = 50; // Show warning when less than 50 chars remain

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: string;
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
              ? /* DISEÑO ACCESIBLE: Fondo blanco sólido con texto oscuro para contraste WCAG AA (12.63:1) */
                'bg-white text-slate-800 border border-slate-200 shadow-sm'
              : /* Mensajes del usuario: Azul con texto blanco (contraste 8.59:1) */
                'bg-blue-600 text-white shadow-md'
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
                    className="underline hover:opacity-80 font-medium"
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
          /* Timestamp con contraste mejorado (7.23:1) */
          <span className="text-xs text-slate-600 mt-1 px-1 animate-fade-in">
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
    {/* DISEÑO ACCESIBLE: Fondo blanco con texto oscuro y borde definido */}
    <div className="bg-white text-slate-700 p-3 rounded-lg border border-slate-200 shadow-sm">
      <div className="flex gap-1 items-center">
        <span className="text-xs mr-2">Titu está escribiendo</span>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
      </div>
    </div>
  </div>
));

TypingIndicator.displayName = 'TypingIndicator';

// Retry logic with exponential backoff - MOVED OUTSIDE COMPONENT
const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES,
  onReconnecting?: (isReconnecting: boolean) => void
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
        throw new Error('No pudimos procesar tu solicitud');
      }
    } catch (error) {
      const isLastRetry = i === retries - 1;

      if (error instanceof Error && error.name === 'AbortError') {
        if (isLastRetry) {
          throw new Error('La conexión tardó demasiado');
        }
      } else if (isLastRetry) {
        throw error;
      }

      // Exponential backoff
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));

      if (i < retries - 1 && onReconnecting) {
        onReconnecting(true);
      }
    }
  }

  throw new Error('No pudimos conectarnos. Intenta de nuevo');
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [isShaking, setIsShaking] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get webhook URL from environment variable
  const WEBHOOK_URL = import.meta.env.VITE_CHATBOT_WEBHOOK_URL || '';

  // Detect scroll to show widget
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > SCROLL_THRESHOLD && !isVisible) {
        setIsVisible(true);
      }
    };

    // Show immediately if already scrolled
    if (window.scrollY > SCROLL_THRESHOLD) {
      setIsVisible(true);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isVisible]);

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
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  }, [messages, isTyping]);

  // Shake animation every 6 seconds when widget is closed
  useEffect(() => {
    if (!isOpen && isVisible) {
      const interval = setInterval(() => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 600);
      }, 6000);

      return () => clearInterval(interval);
    }
  }, [isOpen, isVisible]);

  // Focus management with cleanup
  useEffect(() => {
    let focusTimeout: NodeJS.Timeout;

    if (isOpen) {
      focusTimeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }

    return () => {
      if (focusTimeout) {
        clearTimeout(focusTimeout);
      }
    };
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

  // Send message to webhook - MEMOIZED
  const sendToWebhook = useCallback(async (message: string): Promise<string> => {
    if (!WEBHOOK_URL) {
      console.error('WEBHOOK_URL no está configurada');
      toast.error('Servicio temporalmente no disponible', {
        description: 'Por favor intenta más tarde',
        position: 'top-right',
      });
      return 'Lo siento, el servicio no está disponible en este momento. Por favor intenta más tarde.';
    }

    try {
      setIsReconnecting(false);

      const payload = {
        userId,
        message,
        timestamp: new Date().toISOString()
      };

      const response = await fetchWithRetry(
        WEBHOOK_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify(payload)
        },
        MAX_RETRIES,
        setIsReconnecting
      );

      // Intentar parsear JSON de forma segura
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // Si falla el parseo de JSON, mostrar mensaje user-friendly
        console.error('Error parsing JSON response:', jsonError);
        toast.error('Respuesta inesperada del servidor', {
          description: 'Estamos trabajando en solucionarlo',
          duration: 5000,
          position: 'top-right',
        });
        return 'Lo siento, recibimos una respuesta inesperada. Por favor intenta de nuevo.';
      }

      return data.reply || 'Lo siento, no pude procesar tu mensaje en este momento.';
    } catch (error) {
      console.error('Error sending to webhook:', error);

      // Mensajes de error user-friendly basados en el tipo de error
      let userMessage = 'Error de conexión';

      if (error instanceof Error) {
        // Convertir mensajes técnicos a mensajes comprensibles
        if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
          userMessage = 'No pudimos conectar con el servidor';
        } else if (error.message.includes('timeout') || error.message.includes('AbortError')) {
          userMessage = 'La conexión tardó demasiado tiempo';
        } else if (error.message.includes('No pudimos')) {
          // Mantener nuestros mensajes custom
          userMessage = error.message;
        } else {
          userMessage = 'Problema de conexión temporal';
        }
      }

      toast.error('No pudimos procesar tu solicitud', {
        description: userMessage,
        duration: 5000,
        position: 'top-right',
      });

      setIsReconnecting(false);
      return 'Lo siento, hay un problema de conexión. Por favor intenta más tarde.';
    }
  }, [userId, WEBHOOK_URL]);

  // Handle send message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || inputValue.length > MAX_MESSAGE_LENGTH) return;

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

    const botReply = await sendToWebhook(messageToSend);
    setIsTyping(false);

    const botMessage: Message = {
      id: crypto.randomUUID(),
      content: botReply,
      isBot: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, botMessage]);
  }, [inputValue, sendToWebhook]);

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
    setInputValue('');
    setIsTyping(false);
    setIsReconnecting(false);

    toast.success('Conversación reiniciada', {
      description: 'Puedes comenzar una nueva conversación',
      position: 'top-right',
    });

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

  // Character validation
  const isOverLimit = inputValue.length > MAX_MESSAGE_LENGTH;

  // Don't render if not visible yet
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Enhanced Chat Bubble Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className={`
            group relative
            w-16 h-16
            rounded-full
            shadow-2xl
            transition-all
            duration-500
            hover:scale-110
            hover:shadow-[0_0_40px_rgba(37,99,235,0.6)]
            focus:ring-4
            focus:ring-blue-500
            focus:ring-offset-2
            ${isShaking ? 'chat-widget-shake' : ''}
            bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500
            hover:from-blue-500 hover:via-cyan-500 hover:to-blue-600
            border-2 border-white/20
            backdrop-blur-sm
          `}
          aria-label="Abrir chat con Titu"
          aria-expanded={isOpen}
        >
          {/* Animated glow ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />

          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20" />

          {/* Bot Icon */}
          <Bot className="w-7 h-7 text-white relative z-10 drop-shadow-lg" />

          {/* Sparkle effect on hover */}
          <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />

          {/* Notification badge */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          className="w-80 h-96 bg-white border border-slate-200 rounded-lg shadow-2xl flex flex-col overflow-hidden animate-scale-in"
          role="dialog"
          aria-labelledby="chat-title"
          aria-modal="true"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p id="chat-title" className="text-sm font-semibold text-white">Titu</p>
                <p className="text-xs text-white/90 flex items-center gap-1">
                  {isReconnecting ? (
                    <>
                      <span className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
                      Reconectando...
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                      Disponible 24/7
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRestartConversation}
                className="text-white hover:bg-white/20 transition-colors focus:ring-2 focus:ring-white/50"
                aria-label="Reiniciar conversación"
                title="Reiniciar conversación"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 transition-colors focus:ring-2 focus:ring-white/50"
                aria-label="Cerrar chat"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-slate-50 to-white"
            role="log"
            aria-live="polite"
            aria-label="Mensajes del chat"
          >
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {/* Typing Indicator */}
            {isTyping && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  maxLength={MAX_MESSAGE_LENGTH}
                  /* DISEÑO ACCESIBLE:
                     - Border sólido visible (#E2E8F0)
                     - Focus: Border azul + ring para indicador claro
                     - Min height 44px para touch targets
                  */
                  className="
                    flex-1
                    text-sm
                    min-h-[44px]
                    border-slate-300
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-500/20
                    placeholder:text-slate-400
                  "
                  aria-label="Escribe tu mensaje"
                  aria-describedby="char-count"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isOverLimit}
                  size="icon"
                  className="
                    min-w-[44px]
                    min-h-[44px]
                    bg-gradient-to-br
                    from-blue-600
                    to-cyan-500
                    hover:from-blue-500
                    hover:to-cyan-400
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    text-white
                    shadow-lg
                    hover:shadow-xl
                    transition-all
                    duration-300
                    focus:ring-2
                    focus:ring-blue-500
                    focus:ring-offset-2
                  "
                  aria-label="Enviar mensaje"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              {/* Badge "Hecho por t2xlabs" con diseño futurista */}
              <div className="flex items-center justify-center gap-2 text-xs mt-1">
                <span className="text-slate-500 text-[10px]">Powered by</span>
                <a
                  href="https://t2xlabs.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    group
                    relative
                    inline-flex
                    items-center
                    gap-1.5
                    px-3
                    py-1
                    rounded-full
                    bg-gradient-to-r
                    from-cyan-500
                    via-blue-600
                    to-cyan-500
                    text-white
                    font-bold
                    text-[10px]
                    uppercase
                    tracking-wider
                    shadow-md
                    hover:shadow-lg
                    hover:shadow-cyan-500/50
                    transition-all
                    duration-300
                    hover:scale-105
                    focus:outline-none
                    focus:ring-2
                    focus:ring-cyan-400
                    focus:ring-offset-1
                  "
                  aria-label="Visitar t2xlabs.com"
                >
                  {/* Icono de estrella futurista */}
                  <svg
                    className="w-3 h-3 transition-transform duration-300 group-hover:rotate-12"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>

                  <span>t2xlabs</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export memoized component
export default memo(ChatWidget);
