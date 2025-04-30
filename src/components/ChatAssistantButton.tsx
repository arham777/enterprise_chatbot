import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { MessageSquare, X, FileText, BarChart3, Database, Paperclip, Send, RefreshCw, Maximize2, Minus, Sparkles, Bot, Loader2, Table } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardFooter } from './ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatAssistant } from './HeroSection';
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Extended type for chat messages to support different content types
type ChatMessageType = {
  type: 'user' | 'bot';
  text: string;
  visualization?: string; // Base64 encoded image or multiple images separated by marker
  fileId?: string; // Reference to uploaded file
  fileInfo?: {
    filename: string;
    fileType: string; // PDF or CSV
    columns?: string[];
    rows?: number;
  };
  isStreaming?: boolean; // Whether the message is currently being streamed
  loadingIndicator?: boolean; // Whether to show loading indicator instead of content
  sourceDocument?: string; // Optional source document information
  suggestedQuestions?: string[]; // Optional suggested follow-up questions
};

// Styled markdown renderer component
const FormattedMarkdown = ({ children }: { children: string }) => {
  return (
    <div className="markdown-content prose prose-sm max-w-none overflow-hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // @ts-expect-error - The types for react-markdown are not correctly defining the inline prop
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            
            // Special handling for HTML content - render it directly
            if (match && match[1] === 'html') {
              return (
                <div 
                  dangerouslySetInnerHTML={{ __html: String(children).replace(/\n$/, '') }} 
                  className="overflow-x-auto custom-scrollbar"
                  style={{
                    maxWidth: '100%',
                    overflowY: 'hidden'
                  }}
                />
              );
            }
            
            return !inline && match ? (
              <SyntaxHighlighter
                style={atomDark}
                language={match[1]}
                PreTag="div"
                className="rounded-md my-2"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-gray-100 px-1.5 py-0.5 rounded" {...props}>
                {children}
              </code>
            );
          },
          h1({ node, ...props }) {
            return <h1 className="text-xl font-bold mt-4 mb-2" {...props} />;
          },
          h2({ node, ...props }) {
            return <h2 className="text-lg font-bold mt-3 mb-2" {...props} />;
          },
          h3({ node, ...props }) {
            return <h3 className="text-md font-bold mt-3 mb-1" {...props} />;
          },
          p({ node, ...props }) {
            return <p className="mb-2" {...props} />;
          },
          ul({ node, ...props }) {
            return <ul className="list-disc pl-5 my-2" {...props} />;
          },
          ol({ node, ...props }) {
            return <ol className="list-decimal pl-5 my-2" {...props} />;
          },
          li({ node, ...props }) {
            return <li className="my-1" {...props} />;
          },
          table({ node, ...props }) {
            return (
              <div className="overflow-x-auto custom-scrollbar my-3 border border-gray-200 rounded-md">
                <table className="border-collapse min-w-full text-sm" {...props} />
              </div>
            );
          },
          thead({ node, ...props }) {
            return <thead className="bg-gray-100 sticky top-0" {...props} />;
          },
          tbody({ node, ...props }) {
            return <tbody className="divide-y divide-gray-200" {...props} />;
          },
          tr({ node, ...props }) {
            return <tr className="hover:bg-gray-50" {...props} />;
          },
          th({ node, ...props }) {
            return <th className="px-3 py-2 text-left font-semibold text-gray-700" {...props} />;
          },
          td({ node, ...props }) {
            return <td className="px-3 py-2 whitespace-normal break-words border-t border-gray-200" {...props} />;
          },
          a({ node, ...props }) {
            return <a className="text-blue-500 underline hover:text-blue-700" {...props} />;
          },
          blockquote({ node, ...props }) {
            return <blockquote className="border-l-4 border-gray-300 pl-4 my-2 italic" {...props} />;
          },
          img({ node, ...props }) {
            return <img className="max-w-full h-auto rounded-md my-2" {...props} />;
          },
          hr({ node, ...props }) {
            return <hr className="my-4 border-gray-300" {...props} />;
          }
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};

// Streaming text component with typing effect
const StreamingText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    // Reset if text changes
    if (displayedText === '' && text) {
      setCurrentIndex(0);
      setDisplayedText('');
    }
    
    if (currentIndex < text.length) {
      // Determine character typing speed based on character type
      // Type faster for common characters, slower for punctuation, line breaks
      let delay = 15; // base delay
      
      const currentChar = text[currentIndex];
      if (currentChar === '\n') {
        delay = 300; // pause longer at line breaks
      } else if ('.,:;?!'.includes(currentChar)) {
        delay = 200; // pause at punctuation
      } else if (currentChar === '#' || currentChar === '*') {
        delay = 5; // speed through markdown syntax
      }
      
      // Type faster when a lot of text to show
      if (text.length > 500) {
        delay = Math.max(5, delay / 2);
      }
      
      const timeout = setTimeout(() => {
        // Add the current character to displayed text
        setDisplayedText(prev => prev + currentChar);
        setCurrentIndex(prev => prev + 1);
        
        // If we've reached the end, we're done
        if (currentIndex + 1 >= text.length) {
          // console.log('Streaming complete');
        }
      }, delay + (Math.random() * 10)); // Add small random variation
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, displayedText]);
  
  return <FormattedMarkdown>{displayedText}</FormattedMarkdown>;
};

// Helper component for chat messages with support for visualizations
const ChatMessage = ({ message }: { message: ChatMessageType }) => {
  const isUser = message.type === 'user';
  const [showSuggestedQuestions, setShowSuggestedQuestions] = useState(true);
  
  // Split multiple visualizations if they exist
  const visualizations = message.visualization 
    ? message.visualization.split("||VISUALIZATION_SEPARATOR||") 
    : [];

  // Handle clicking a suggested question
  const handleSuggestedQuestionClick = (question: string) => {
    // Dispatch a custom event that the parent component (ChatAssistantButton) can listen for
    window.dispatchEvent(new CustomEvent('suggested-question-click', { 
      detail: { question }
    }));
  };
    
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'rounded-lg px-4 py-3 text-sm shadow-sm',
          isUser
            ? 'blue-gradient text-white rounded-br-none max-w-[75%]'
            : 'bg-white text-gray-800 rounded-bl-none max-w-[85%]'
        )}
      >
        <div className="space-y-2">
          {/* File upload info */}
          {message.fileInfo && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded mb-3">
              <Table className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-semibold text-blue-700">{message.fileInfo.filename}</p>
                {message.fileInfo.fileType === 'CSV' && message.fileInfo.rows !== undefined && message.fileInfo.columns !== undefined ? (
                  <p className="text-xs text-gray-600">{message.fileInfo.rows} rows · {message.fileInfo.columns.length} columns</p>
                ) : (
                  <p className="text-xs text-gray-600">{message.fileInfo.fileType} document</p>
                )}
              </div>
            </div>
          )}
          
          {/* Source document info for bot messages */}
          {!isUser && message.sourceDocument && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded mb-3">
              <FileText className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-gray-600">Source: {message.sourceDocument}</p>
              </div>
            </div>
          )}
          
          {/* Text content with streaming effect for bot messages */}
          {isUser ? (
            <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
          ) : message.loadingIndicator ? (
            <div className="bot-response relative flex items-center gap-2 h-6">
              <div className="text-sm text-gray-500">Analyzing your request</div>
              <div className="flex items-center space-x-1">
                <div className="animate-pulse bg-blue-500 h-1.5 w-1.5 rounded-full"></div>
                <div className="animate-pulse bg-blue-500 h-1.5 w-1.5 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                <div className="animate-pulse bg-blue-500 h-1.5 w-1.5 rounded-full" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          ) : message.isStreaming ? (
            <div className="bot-response">
              <StreamingText text={message.text} />
            </div>
          ) : (
            <div className="bot-response">
              <FormattedMarkdown>{message.text}</FormattedMarkdown>
            </div>
          )}

          {/* Suggested questions */}
          {!isUser && !message.isStreaming && !message.loadingIndicator && message.suggestedQuestions && Array.isArray(message.suggestedQuestions) && message.suggestedQuestions.length > 0 && showSuggestedQuestions && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-medium text-gray-500">Suggested questions</p>
                <button 
                  onClick={() => setShowSuggestedQuestions(false)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {message.suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestionClick(question)}
                    className="text-left text-xs py-1.5 px-2.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Visualizations if available */}
          {visualizations.length > 0 && (
            <div className="mt-3 rounded-md overflow-hidden border border-gray-200 bg-white p-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Data Visualization</h4>
              
              {visualizations.length === 1 ? (
                // Single visualization
                <div className="visualization-container">
                  <a href={visualizations[0]} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={visualizations[0]} 
                      alt="Data visualization" 
                      className="w-full object-contain max-h-[400px] rounded hover:opacity-90 transition-opacity"
                    />
                  </a>
                </div>
              ) : (
                // Multiple visualizations
                <div className={`grid ${visualizations.length === 2 ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
                  {visualizations.map((viz, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-2 visualization-item">
                      <a href={viz} target="_blank" rel="noopener noreferrer">
                        <img 
                          src={viz} 
                          alt={`Visualization ${index + 1}`} 
                          className="w-full object-contain max-h-[300px] rounded hover:opacity-90 transition-opacity"
                        />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Helper component for Welcome Screen Cards
const WelcomeCard = ({ icon: Icon, title, description, onClick }: { 
  icon: React.ElementType, 
  title: string, 
  description: string,
  onClick?: () => void
}) => (
  <div 
    className="group cursor-pointer rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-blue-400/50"
    onClick={onClick}
  >
    <div className="mb-3 flex justify-center">
      <Icon className="h-6 w-6 text-cybergen-primary transition-transform group-hover:scale-110" />
    </div>
    <h3 className="mb-1 text-center font-semibold text-sm">{title}</h3>
    <p className="text-center text-xs text-muted-foreground">{description}</p>
  </div>
);

const ChatAssistantButton = () => {
  const { isOpen, setIsOpen } = useChatAssistant();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [message, setMessage] = useState('');
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated, redirectToLogin, userEmail } = useAuth();

  // Define API base URL and CORS proxy functionality
  const ORIGINAL_API_URL = import.meta.env.VITE_API_URL || 'http://103.18.20.205:8070';
  
  // Helper function to create a CORS proxy URL if needed
  const createProxiedUrl = (url: string): string => {
    // Check if we're in development environment
    const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
    
    if (isDevelopment) {
      // ThingProxy is failing with 500 errors, try direct connection instead
      // If direct connection works, no proxy is needed
      return url;
      
      // Alternative options if direct connection doesn't work:
      // return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      // return `https://cors-anywhere.herokuapp.com/${url}`;
      // return `https://proxy.cors.sh/${url}`;
    }
    
    // In production, use the direct URL (assuming same-origin or proper CORS setup)
    return url;
  };
  
  // Determine the API URL to use (with proxy if needed)
  const API_BASE_URL = createProxiedUrl(ORIGINAL_API_URL);

  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Only reset maximized state when going from desktop to mobile
      // not every time this effect runs
      if (mobile && isMaximized) {
        setIsMaximized(false);
      }
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [isMaximized]);

  // Listen for document selection messages from DocumentSidebar
  useEffect(() => {
    const handleDocumentSelection = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin && 
        event.data?.type === 'SELECT_DOCUMENT' &&
        event.data?.payload?.documentName
      ) {
        const documentName = event.data.payload.documentName;
        
        // Activate knowledge base
        setUseKnowledgeBase(true);
        
        // Add a message about the selected document
        setChatHistory(prev => [...prev, { 
          type: 'user', 
          text: `I want to discuss the document: ${documentName}` 
        }]);
        
        // Add bot response
        setChatHistory(prev => [...prev, { 
          type: 'bot', 
          text: `I've loaded the document **${documentName}**. The Knowledge Base is now active. What would you like to know about this document?`,
          fileInfo: {
            filename: documentName,
            fileType: 'PDF'
          }
        }]);
      }
    };
    
    window.addEventListener('message', handleDocumentSelection);
    return () => window.removeEventListener('message', handleDocumentSelection);
  }, []);

  // Show a log message about the API URL being used (helpful for debugging)
  useEffect(() => {
    const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
    if (isDevelopment) {
      console.info(`Using API URL: ${API_BASE_URL} ${API_BASE_URL !== ORIGINAL_API_URL ? '(with CORS proxy)' : ''}`);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const toggleChat = () => setIsOpen(!isOpen);
  const toggleMaximize = () => {
    console.log("Maximize button clicked, current state:", isMaximized);
    setIsMaximized(prevState => !prevState);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const resetChat = () => {
    // Check if there's any PDF document in the chat history
    const hasPdfDocument = chatHistory.some(
      msg => msg.fileInfo?.fileType === 'PDF'
    );
    
    // Clear chat history
    setChatHistory([]);
    setMessage('');
    
    // Only reset knowledge base if there's no PDF document
    if (!hasPdfDocument) {
      setUseKnowledgeBase(false);
    }
    
    setActiveFileId(null);
    inputRef.current?.focus();

    // Remove document deletion confirmation and API call
    // We will never delete documents when just clearing chat
  };

  const toggleKnowledgeBase = async () => {
    // Toggle state first for immediate UI feedback
    const newState = !useKnowledgeBase;
    setUseKnowledgeBase(newState);
    inputRef.current?.focus();
    
    // Check if user is authenticated and email is available
    if (!userEmail) {
      setChatHistory(prev => [...prev, { 
        type: 'bot', 
        text: 'Error: User email information is missing. Please sign out and sign in again.'
      }]);
      return;
    }
    
    try {
      // Call the knowledge base endpoint
      const knowledgeBaseEndpoint = `${ORIGINAL_API_URL}/set-knowledge-base/`;
      
      const response = await fetch(knowledgeBaseEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        body: JSON.stringify({
          activate: newState,
          email: userEmail
        }),
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`Failed to ${newState ? 'activate' : 'deactivate'} knowledge base: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Knowledge base ${newState ? 'activated' : 'deactivated'}: `, data);
      
    } catch (error) {
      console.error('Error toggling knowledge base:', error);
      // Don't show error to user as we've already updated the UI
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if user is authenticated and email is available
    if (!userEmail) {
      setChatHistory(prev => [...prev, { 
        type: 'bot', 
        text: 'Error: User email information is missing. Please sign out and sign in again.'
      }]);
      return;
    }

    // Check if file is PDF - only allow PDF files as endpoint can only handle PDFs
    const isPDF = file.name.toLowerCase().endsWith('.pdf');
    
    if (!isPDF) {
      setChatHistory(prev => [...prev, { 
        type: 'bot', 
        text: 'Only PDF files are supported for document upload. Please upload a PDF file.'
      }]);
      return;
    }

    // Validate file size before upload - prevent server errors for large files
    const maxSizeMB = 5; // 5MB for PDFs
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    if (file.size > maxSizeBytes) {
      setChatHistory(prev => [...prev, { 
        type: 'bot', 
        text: `File too large. Maximum PDF size is ${maxSizeMB}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`
      }]);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Additional PDF validation - check PDF format
    // Simple PDF header check
    const firstBytes = await readFileHeader(file, 5);
    const isPDFFormat = firstBytes === '%PDF-';
    
    if (!isPDFFormat) {
      setChatHistory(prev => [...prev, { 
        type: 'bot', 
        text: `The file ${file.name} doesn't appear to be a valid PDF document. Make sure your file is not corrupted.`
      }]);
      return;
    }

    // Add file to chat history
    setChatHistory(prev => [...prev, { 
      type: 'user', 
      text: `I'd like to analyze this PDF document: ${file.name}`
    }]);
    
    setIsLoading(true);

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', userEmail);

    let response = null;
    let errorMessage = '';

    try {
      // Direct API approach
      const uploadEndpoint = `${ORIGINAL_API_URL}/upload-pdf/`;
      
      console.log(`Uploading PDF file to: ${uploadEndpoint}`);
      
      // Try to upload file with improved headers
      response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        headers: {
          // Don't set Content-Type when using FormData, browser will set it with boundary
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        credentials: 'omit'
      });

      if (!response.ok) {
        // Special handling for 500 Internal Server Error
        if (response.status === 500) {
          throw new Error("Server error: The PDF document might be too complex, password-protected, or in an unsupported format.");
        } else if (response.status === 413) {
          throw new Error("File too large: The PDF document exceeds the server's size limit. Please use a smaller file (under 5MB).");
        } else {
          throw new Error(`API error: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      
      // Check if it's a network error that might be related to file size
      errorMessage = error instanceof Error ? error.message : String(error);
      
      // Detect if it's likely a file size issue based on the error
      const isLikelyFileSizeIssue = 
        errorMessage.includes('413') || 
        errorMessage.includes('Request Entity Too Large') ||
        errorMessage.includes('Failed to fetch');
      
      if (isLikelyFileSizeIssue) {
        setChatHistory(prev => [...prev, { 
          type: 'bot', 
          text: `## File Too Large\n\nThe file you're trying to upload exceeds the maximum size limit (5MB).\n\nPlease compress your PDF or use a smaller file.`
        }]);
        setIsLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';  // Reset the file input
        }
        return;
      }
      
      // For other errors, continue with generic error handling
      response = null;
    }

    // Helper function to read first few bytes of a file
    async function readFileHeader(file: File, bytesToRead: number): Promise<string> {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = (e) => {
          if (e.target?.result) {
            const arr = new Uint8Array(e.target.result as ArrayBuffer);
            let result = '';
            for (let i = 0; i < Math.min(bytesToRead, arr.length); i++) {
              result += String.fromCharCode(arr[i]);
            }
            resolve(result);
          } else {
            resolve('');
          }
        };
        reader.readAsArrayBuffer(file.slice(0, bytesToRead));
      });
    }

    // If we have a response, process it
    if (response) {
      try {
        // First check if we can parse as JSON
        const text = await response.text();
        let data;
        try {
          // Try to parse as JSON
          data = JSON.parse(text);
        } catch (e) {
          // If not JSON, use text directly
          data = text;
        }
        
        // For PDF files
        let responseText;
        
        // Check if the response is an object with a message property (from FastAPI)
        if (data && typeof data === 'object' && data.message) {
          responseText = `## PDF Document Loaded Successfully\n\nI've loaded your PDF document **${file.name}**. You can now ask questions about this document.`;
        } else {
          responseText = typeof data === 'string' 
            ? data 
            : `## PDF Document Loaded Successfully\n\nI've loaded your PDF document **${file.name}**. You can now ask questions about this document.`;
        }
        
        // Automatically activate knowledge base when PDF is uploaded
        setUseKnowledgeBase(true);
        
        // Call the knowledge base endpoint to activate it
        try {
          const knowledgeBaseEndpoint = `${ORIGINAL_API_URL}/set-knowledge-base/`;
          
          const kbResponse = await fetch(knowledgeBaseEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Origin': window.location.origin,
            },
            body: JSON.stringify({
              activate: true,
              email: userEmail
            }),
            mode: 'cors'
          });
          
          if (!kbResponse.ok) {
            console.error(`Failed to activate knowledge base: ${kbResponse.status}`);
          } else {
            const kbData = await kbResponse.json();
            console.log("Knowledge base activated: ", kbData);
          }
        } catch (kbError) {
          console.error('Error activating knowledge base:', kbError);
          // Continue despite error as we've already updated the UI
        }
        
        // Log source document information if available
        if (data.source_document) {
          console.log(`Response generated from source document: ${data.source_document}`);
        }
        
        setChatHistory(prev => [...prev, { 
          type: 'bot', 
          text: responseText,
          fileInfo: {
            filename: file.name,
            fileType: 'PDF'
          },
          sourceDocument: data.source_document
        }]);
        
        // No file ID concept for PDFs in this implementation
        setActiveFileId(null);
      } catch (processError) {
        console.error('Error processing response:', processError);
        setChatHistory(prev => [...prev, { 
          type: 'bot', 
          text: `## Error\n\nI received a response from the server but couldn't process it.\n\n**Details:** ${processError instanceof Error ? processError.message : String(processError)}`
        }]);
      }
    } else {
      // All attempts failed - show error message
      setChatHistory(prev => [...prev, { 
        type: 'bot', 
        text: `## Error\n\nI encountered an error while processing your file. ${errorMessage.includes('413') ? 'The file is too large for upload (maximum 5MB).' : 'Please try again with a different file.'}\n\n${!errorMessage.includes('413') ? `**Technical details:** ${errorMessage || 'Failed to upload file. This may be due to network issues or file formatting.'}` : ''}`
      }]);
    }
    
    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';  // Reset the file input
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const checkAuth = () => {
    if (!isAuthenticated) {
      setIsOpen(false); // Close chat window
      redirectToLogin(); // Redirect to login
      return false;
    }
    
    return true;
  };

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage === '') return;

    // Check if user is authenticated
    if (!checkAuth()) return;

    try {
      // Add user message to chat history
      setChatHistory(prev => [...prev, { type: 'user', text: trimmedMessage }]);
      setMessage('');
      setIsLoading(true);

      // Add a placeholder for the bot's response with isStreaming=true
      const placeholderIndex = chatHistory.length + 1;
      setChatHistory(prev => [...prev, { 
        type: 'bot', 
        text: '', 
        isStreaming: true,
        loadingIndicator: true
      }]);

      // Create the request body matching the API's expected format
      const requestBody = JSON.stringify({ 
        query: trimmedMessage
      });

      // Add debug logging to show if knowledge base is being used
      console.log(`Using knowledge base: ${useKnowledgeBase ? 'ON' : 'OFF'}`);
      console.log('Request details:', { query: trimmedMessage, email: userEmail });
      
      // Check if we have the user email
      if (!userEmail) {
        console.error("User email is not available");
        setChatHistory(prev => [
          ...prev.slice(0, placeholderIndex),
          { 
            type: 'bot', 
            text: `## Error\n\nUser email information is missing. Please sign out and sign in again.`,
            isStreaming: false,
            loadingIndicator: false
          }
        ]);
        setIsLoading(false);
        return;
      }

      try {
        // Try direct call first without proxy
        // Add email as query parameter
        const apiEndpoint = `${ORIGINAL_API_URL}/generate-response/?email=${encodeURIComponent(userEmail)}`;
        console.log(`Attempting direct API call to: ${apiEndpoint}`);
        
        // Use a more complete set of headers to handle CORS properly
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': window.location.origin,
          },
          body: requestBody,
          mode: 'cors'
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error response:', response.status, errorText);
          throw new Error(`API error: ${response.status} - ${errorText || 'No error details'}`);
        }

        // Parse the response
        const data = await response.json();
        
        // Extract the response text from the data object
        const responseText = data.response || 'No response received';

        // Log source document information if available
        if (data.source_document) {
          console.log(`Response generated from source document: ${data.source_document}`);
        } else if (data.source) {
          console.log(`Response generated from source document: ${data.source}`);
        }

        // Update the chat history with the response
        setChatHistory(prev => [
          ...prev.slice(0, placeholderIndex),
          {
            type: 'bot',
            text: responseText,
            isStreaming: true,
            loadingIndicator: false,
            sourceDocument: data.source_document || data.source,
            suggestedQuestions: data.suggested_questions
          }
        ]);
        
        // After a short delay, turn off streaming to complete animation
        setTimeout(() => {
          setChatHistory(prev => {
            if (prev.length <= placeholderIndex) {
              return prev; // Guard against out-of-bounds access
            }
            return [
              ...prev.slice(0, placeholderIndex),
              {
                ...prev[placeholderIndex],
                isStreaming: false
              },
              ...prev.slice(placeholderIndex + 1)
            ];
          });
        }, responseText.length * 15); // Approximate time to finish the animation
      } catch (error) {
        console.error('Error fetching response:', error);
        
        // Try a fallback approach with different headers
        try {
          console.log("Direct API call failed. Attempting with alternative headers...");
          
          // Also include email in fallback attempt
          const fallbackResponse = await fetch(`${ORIGINAL_API_URL}/generate-response/?email=${encodeURIComponent(userEmail)}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': '*/*',
              'Connection': 'keep-alive',
            },
            body: requestBody,
            mode: 'cors'
          });
          
          if (!fallbackResponse.ok) {
            const errorText = await fallbackResponse.text();
            console.error('Fallback API error response:', fallbackResponse.status, errorText);
            throw new Error(`API error: ${fallbackResponse.status} - ${errorText || 'No error details'}`);
          }
          
          const fallbackData = await fallbackResponse.json();
          const fallbackText = fallbackData.response || 'No response received';
          
          // Log source document information if available in fallback response
          if (fallbackData.source_document) {
            console.log(`Response generated from source document: ${fallbackData.source_document}`);
          } else if (fallbackData.source) {
            console.log(`Response generated from source document: ${fallbackData.source}`);
          }
          
          setChatHistory(prev => [
            ...prev.slice(0, placeholderIndex),
            {
              type: 'bot',
              text: fallbackText,
              isStreaming: true,
              loadingIndicator: false,
              sourceDocument: fallbackData.source_document || fallbackData.source,
              suggestedQuestions: fallbackData.suggested_questions
            }
          ]);

          setTimeout(() => {
            setChatHistory(prev => {
              if (prev.length <= placeholderIndex) {
                return prev; // Guard against out-of-bounds access
              }
              return [
                ...prev.slice(0, placeholderIndex),
                {
                  ...prev[placeholderIndex],
                  isStreaming: false
                },
                ...prev.slice(placeholderIndex + 1)
              ];
            });
          }, fallbackText.length * 15);
          
          // Exit early since we successfully used the fallback
          return;
        } catch (fallbackError) {
          console.error('Fallback approach also failed:', fallbackError);
          // Continue to the error handling below
          
          // Format error message based on the type of error
          let errorDetail = 'Unknown error occurred';
          
          if (fallbackError instanceof TypeError && fallbackError.message.includes('Failed to fetch')) {
            errorDetail = 'Network Error: Unable to connect to the server. Please check your internet connection and try again.';
          } else if (fallbackError instanceof Error) {
            errorDetail = fallbackError.message;
          } else {
            errorDetail = String(fallbackError);
          }
          
          // Replace placeholder with error message
          setChatHistory(prev => [
            ...prev.slice(0, placeholderIndex),
            { 
              type: 'bot', 
              text: `## Error\n\nSorry, I encountered an error while processing your request.\n\n**Details:** ${errorDetail}\n\nPlease try again later or contact support with this error message.`,
              isStreaming: false,
              loadingIndicator: false
            }
          ]);
        }
      }
    } catch (outerError) {
      console.error('Unhandled error in sendMessage:', outerError);
      // This catch block handles any unexpected errors that might occur outside the API calls
      setChatHistory(prev => {
        // Find the last bot message index if it exists
        const lastBotIndex = [...prev].reverse().findIndex(msg => msg.type === 'bot');
        const placeholderIndex = lastBotIndex >= 0 ? prev.length - 1 - lastBotIndex : prev.length; 
        
        // Add error message or update existing bot message
        if (lastBotIndex >= 0 && prev[placeholderIndex].loadingIndicator) {
          return [
            ...prev.slice(0, placeholderIndex),
            { 
              type: 'bot', 
              text: `## Error\n\nAn unexpected error occurred.\n\n**Details:** ${outerError instanceof Error ? outerError.message : 'Unknown error'}\n\nPlease try again.`,
              isStreaming: false,
              loadingIndicator: false
            },
            ...prev.slice(placeholderIndex + 1)
          ];
        } else {
          return [
            ...prev,
            { 
              type: 'bot', 
              text: `## Error\n\nAn unexpected error occurred.\n\n**Details:** ${outerError instanceof Error ? outerError.message : 'Unknown error'}\n\nPlease try again.`,
              isStreaming: false,
              loadingIndicator: false
            }
          ];
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Dynamic Classes
  const chatWindowBaseClasses = "fixed shadow-xl border bg-card rounded-lg overflow-hidden flex flex-col transition-all duration-300 ease-out z-[100]";
  const chatWindowMobileClasses = "inset-x-0 bottom-0 w-full h-[85vh] max-h-[85vh] rounded-b-none";
  const chatWindowDesktopBase = "bottom-6 right-6 w-[440px] h-[600px] max-w-[95vw] max-h-[90vh]";
  const chatWindowDesktopMaximized = "bottom-6 right-6 w-[700px] h-[80vh] max-w-[95vw] max-h-[90vh]";
  const chatWindowDesktopClasses = isMaximized ? chatWindowDesktopMaximized : chatWindowDesktopBase;

  // Add debug logs
  React.useEffect(() => {
    console.log("ChatAssistantButton - isOpen changed:", isOpen);
  }, [isOpen]);

  // Add debug log for isMaximized state
  React.useEffect(() => {
    console.log("ChatAssistantButton - isMaximized changed:", isMaximized);
  }, [isMaximized]);

  // Add event listener for suggested question clicks
  useEffect(() => {
    const handleSuggestedQuestionClick = (event: CustomEvent) => {
      const question = event.detail.question;
      setMessage(question);
      // Optional: automatically send the question
      // sendMessage(question);
    };

    window.addEventListener('suggested-question-click', handleSuggestedQuestionClick as EventListener);
    
    return () => {
      window.removeEventListener('suggested-question-click', handleSuggestedQuestionClick as EventListener);
    };
  }, []);

  return (
    <>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept=".pdf"
      />
    
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className={cn(
              chatWindowBaseClasses,
              isMobile ? chatWindowMobileClasses : chatWindowDesktopClasses
            )}
            style={{ transformOrigin: 'bottom right' }}
          >
            {/* Header */}
            <CardHeader className="flex flex-row items-center justify-between p-3 border-b bg-gradient-to-r from-blue-50 to-blue-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full border items-center justify-center blue-gradient">
                  <Bot className="h-5 w-5 text-white"/>
                 </span>
                <h3 className="font-semibold text-base text-foreground">AI Assistant</h3>
              </div>
              <div className="flex items-center gap-1">
                {!isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMaximize}
                    className="h-7 w-7 text-muted-foreground hover:bg-blue-100 hover:text-blue-600 cursor-pointer"
                    aria-label={isMaximized ? "Restore chat size" : "Maximize chat"}
                    type="button"
                  >
                    {isMaximized ? <Minus className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleChat}
                  className="h-7 w-7 text-muted-foreground hover:bg-blue-100 hover:text-blue-600"
                  aria-label="Close chat"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Chat Body */}
            <CardContent ref={chatBodyRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
              {chatHistory.length === 0 ? (
                // Welcome Screen
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="flex flex-col items-center justify-center text-center h-full px-4"
                >
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full blue-gradient shadow-lg">
                    <Sparkles className="h-8 w-8 text-white" />
                   </div>
                   <h2 className="mb-2 text-xl font-bold text-foreground">How can I help?</h2>
                   <p className="mb-6 max-w-md text-sm text-muted-foreground">
                     Ask me anything, upload documents for analysis, or connect your data.
                   </p>
                   <div className={`grid w-full max-w-md gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    <WelcomeCard 
                      icon={FileText} 
                      title="PDF Documents" 
                      description="Upload & analyze documents." 
                      onClick={triggerFileUpload}
                    />
                    
                    <WelcomeCard 
                      icon={Database} 
                      title="Knowledge Base" 
                      description="Chat with your files."
                      onClick={async () => {
                        await toggleKnowledgeBase();
                        // Add a helpful message about knowledge base activation
                        setChatHistory(prev => [...prev, { 
                          type: 'bot', 
                          text: 'Knowledge Base has been activated. You can now ask questions about your uploaded documents. If you haven\'t uploaded any documents yet, you can do so using the paper clip icon in the chat input area.' 
                        }]);
                      }} 
                    />
                   </div>
                </motion.div>
              ) : (
                // Chat History
                chatHistory.map((msg, index) => (
                  <ChatMessage key={index} message={msg} />
                ))
              )}
            </CardContent>

            {/* Footer / Input Area */}
            <CardFooter className="p-3 border-t bg-gradient-to-r from-blue-50 to-blue-100 flex-shrink-0">
                {useKnowledgeBase && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0}}
                        className="mb-2 text-xs text-blue-500 flex items-center gap-1 justify-center"
                    >
                        <Database className="h-3 w-3"/> Knowledge Base Active
                    </motion.div>
                )}
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-blue-500 flex-shrink-0" 
                  aria-label="Upload PDF document"
                  onClick={triggerFileUpload}
                  disabled={isLoading}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleKnowledgeBase}
                    className={cn(
                    "h-8 w-8 flex-shrink-0 hover:text-blue-500",
                    useKnowledgeBase ? "text-blue-500 bg-blue-100" : "text-muted-foreground"
                    )}
                    aria-label={useKnowledgeBase ? "Deactivate knowledge base" : "Activate knowledge base"}
                    title={useKnowledgeBase ? "Knowledge base active" : "Activate knowledge base"}
                  disabled={isLoading}
                >
                  <Database className="h-4 w-4" />
                </Button>
                <div className="relative flex-grow">
                  <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
                    disabled={isLoading}
                  />
                </div>
                 <Button
                    variant="ghost"
                    size="icon"
                    onClick={resetChat}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                    aria-label="Reset chat"
                    title="Reset chat"
                  disabled={chatHistory.length === 0 && message === '' || isLoading}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                <Button
                  size="icon"
                  onClick={sendMessage}
                  className="h-8 w-8 rounded-full blue-gradient text-white flex-shrink-0 hover:shadow-md disabled:opacity-50"
                  aria-label="Send message"
                  disabled={message.trim() === '' || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                  <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardFooter>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <motion.div
          key="chat-button"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button
            onClick={toggleChat}
            className="h-14 w-14 rounded-full blue-gradient-button shadow-lg flex items-center justify-center"
            aria-label="Open chat assistant"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </motion.div>
      )}
    </>
  );
};

export default ChatAssistantButton;