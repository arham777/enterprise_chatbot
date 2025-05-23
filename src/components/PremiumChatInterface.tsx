import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea
} from '@/components/ui/prompt-input';
import { Button } from '@/components/ui/button';
import { 
  ArrowUp, 
  Paperclip, 
  Square, 
  X, 
  FileText, 
  BarChart3, 
  Folder, 
  Bot, 
  MessageCircle,
  RefreshCcw,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Save,
  Upload,
  Database,
  Globe
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://103.18.20.205:8070';

const WelcomeMessage = () => (
  <div className="flex flex-col items-center justify-center text-center p-4 md:p-8 max-w-xl mx-auto">
    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
      <img 
        src="/lovable-uploads/e79b349f-9d4e-4ddd-bc6e-dfc271683c93.png" 
        alt="AURA" 
        className="h-10 w-auto"
      />
    </div>
    <h2 className="text-xl md:text-2xl font-bold mb-2 text-gray-800">Welcome to AURA</h2>
    <p className="text-sm md:text-base text-gray-600 mb-4">
      I'm your AI assistant. Ask me anything, upload documents, or analyze data. How can I help you today?
    </p>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
      <Button variant="outline" className="justify-start text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-gray-200">
        <FileText className="mr-2 h-4 w-4 text-blue-500" />
        Analyze a document
      </Button>
      <Button variant="outline" className="justify-start text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-gray-200">
        <BarChart3 className="mr-2 h-4 w-4 text-blue-500" />
        Create data visualizations
      </Button>
      <Button variant="outline" className="justify-start text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-gray-200">
        <Database className="mr-2 h-4 w-4 text-blue-500" />
        Search knowledge base
      </Button>
      <Button variant="outline" className="justify-start text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-gray-200">
        <MessageCircle className="mr-2 h-4 w-4 text-blue-500" />
        Start a conversation
      </Button>
    </div>
  </div>
);

const ChatMessage = ({ 
  isBot, 
  content, 
  timestamp, 
  sourceDocument, 
  suggestedQuestions,
  onSuggestedQuestionClick 
}: { 
  isBot: boolean, 
  content: string, 
  timestamp: string,
  sourceDocument?: string,
  suggestedQuestions?: string[],
  onSuggestedQuestionClick?: (question: string) => void
}) => {
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  return (
  <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
    <div className={`flex max-w-[75%] md:max-w-[70%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
      <div className={`shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center ${isBot ? 'bg-blue-100 mr-2 sm:mr-3' : 'bg-blue-100 ml-2 sm:ml-3'}`}>
        {isBot ? (
          <img 
            src="/lovable-uploads/e79b349f-9d4e-4ddd-bc6e-dfc271683c93.png" 
            alt="Bot" 
            className="h-5 w-auto sm:h-6"
          />
        ) : (
          <div className="bg-gradient-to-b from-blue-400 to-blue-600 text-white h-8 w-8 rounded-full flex items-center justify-center text-sm">
            U
          </div>
        )}
      </div>
      <div className="flex flex-col">
        {/* Source document if available */}
        {isBot && (
          <div className="mb-1 px-2 py-1 bg-blue-50 rounded-t-lg flex items-center">
            {!sourceDocument || sourceDocument === "N/A" ? (
              <>
                <Globe className="h-3 w-3 text-blue-500 mr-1" />
                <span className="text-xs text-blue-600">web search</span>
              </>
            ) : (
              <>
                <FileText className="h-3 w-3 text-blue-500 mr-1" />
                <span className="text-xs text-blue-600">Source: {sourceDocument}</span>
              </>
            )}
          </div>
        )}
        
        <div className={`rounded-xl p-3 sm:p-4 ${isBot ? 'bg-gray-100' : 'bg-gradient-to-b from-blue-400 to-blue-600 text-white'}`}>
          <p className="text-sm">{content}</p>
        </div>
        
        {/* Suggested questions */}
        {isBot && suggestedQuestions && suggestedQuestions.length > 0 && showSuggestions && (
          <div className="mt-2 bg-white border border-gray-200 rounded-lg p-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-500">Suggested questions</span>
              <button 
                className="text-xs text-gray-400 hover:text-gray-600"
                onClick={() => setShowSuggestions(false)}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {suggestedQuestions.map((question, idx) => (
                <button
                  key={idx}
                  className="text-left text-xs py-1 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
                  onClick={() => onSuggestedQuestionClick && onSuggestedQuestionClick(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex mt-1 text-xs text-gray-500">
          <span>{timestamp}</span>
          {isBot && (
            <div className="flex items-center ml-2 space-x-2">
              <button className="hover:text-blue-500"><ThumbsUp className="h-3 w-3" /></button>
              <button className="hover:text-blue-500"><ThumbsDown className="h-3 w-3" /></button>
              <button className="hover:text-blue-500"><Copy className="h-3 w-3" /></button>
              <button className="hover:text-blue-500"><Save className="h-3 w-3" /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)};

const PremiumChatInterface = () => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [messages, setMessages] = useState<Array<{
    isBot: boolean, 
    content: string, 
    timestamp: string,
    sourceDocument?: string,
    suggestedQuestions?: string[]
  }>>([]);
  const [show, setShow] = useState(true); // Controls welcome message
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const { userEmail } = useAuth();

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSubmit = async () => {
    if ((input.trim() || files.length > 0) && !isLoading) {
      setShow(false);
      
      // Add user message
      const userMessage = {
        isBot: false,
        content: input || "Uploaded files: " + files.map(f => f.name).join(", "),
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      
      // Check if we have email
      if (!userEmail) {
        // Handle missing email
        setMessages(prev => [...prev, {
          isBot: true,
          content: "Error: User email information is missing. Please sign out and sign in again.",
          timestamp: new Date().toLocaleTimeString()
        }]);
        setIsLoading(false);
        return;
      }
      
      if (files.length > 0) {
        // Handle files upload
        // For now, just simulate
        setTimeout(() => {
          const botResponse = {
            isBot: true,
            content: "I've analyzed the files you uploaded. What would you like to know about them?",
            timestamp: new Date().toLocaleTimeString()
          };
          
          setMessages(prev => [...prev, botResponse]);
          setIsLoading(false);
          setInput("");
          setFiles([]);
        }, 2000);
      } else {
        // Send to actual API
        try {
          // Create request body
          const requestBody = JSON.stringify({
            query: input.trim()
          });
          
          // Make API call with email parameter
          const apiEndpoint = `${API_URL}/generate-response/?email=${encodeURIComponent(userEmail)}`;
          console.log(`Sending request to: ${apiEndpoint}`);
          
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
            throw new Error(`API error: ${response.status}`);
          }
          
          // Parse response
          const data = await response.json();
          
          // Log source document information if available
          if (data.source_document) {
            console.log(`Response generated from source document: ${data.source_document}`);
          } else if (data.source) {
            console.log(`Response generated from source document: ${data.source}`);
          }
          
          // Add bot response
          setMessages(prev => [...prev, {
            isBot: true,
            content: data.response || "Sorry, I couldn't generate a response.",
            timestamp: new Date().toLocaleTimeString(),
            sourceDocument: data.source_document || data.source,
            suggestedQuestions: data.suggested_questions
          }]);
        } catch (error) {
          console.error('Error fetching response:', error);
          
          // Add error message
          setMessages(prev => [...prev, {
            isBot: true,
            content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            timestamp: new Date().toLocaleTimeString()
          }]);
        } finally {
          setIsLoading(false);
          setInput("");
        }
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (uploadInputRef.current) {
      uploadInputRef.current.value = "";
    }
  };
  
  const resetChat = () => {
    setMessages([]);
    setShow(true);
    setInput("");
    // No document deletion functionality here
  };

  const handleSuggestedQuestionClick = (question: string) => {
    setInput(question);
    // Optional: automatically submit the question
    // handleSubmit(question);
  };

  // Add an effect to listen for document-related events
  useEffect(() => {
    // Handle any document-related messaging between components
    const handleDocumentEvents = (event: MessageEvent) => {
      // Only process messages from our origin
      if (event.origin !== window.location.origin) return;
      
      // Check for document-related events
      if (event.data && event.data.type === 'SELECT_DOCUMENT') {
        // Handle document selection
        console.log('Document selected:', event.data.payload.documentName);
        // You might want to do something with the selected document
      }
    };

    window.addEventListener('message', handleDocumentEvents);
    
    return () => {
      window.removeEventListener('message', handleDocumentEvents);
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div ref={messageContainerRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        {show && <WelcomeMessage />}
        
        {messages.map((message, index) => (
          <ChatMessage 
            key={index}
            isBot={message.isBot}
            content={message.content}
            timestamp={message.timestamp}
            sourceDocument={message.sourceDocument}
            suggestedQuestions={message.suggestedQuestions}
            onSuggestedQuestionClick={handleSuggestedQuestionClick}
          />
        ))}
        
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="flex max-w-[75%] md:max-w-[70%] flex-row">
              <div className="shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 mr-2 sm:mr-3 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/e79b349f-9d4e-4ddd-bc6e-dfc271683c93.png" 
                  alt="Bot"
                  className="h-5 w-auto sm:h-6"
                />
              </div>
              <div className="flex flex-col">
                <div className="rounded-xl p-3 sm:p-4 bg-gray-100">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Bottom Tab Navigation */}
      <div className="border-t border-gray-200 py-2 px-4">
        <div className="flex justify-center space-x-4 sm:space-x-6 md:space-x-20">
          <button className="flex flex-col items-center text-blue-500 hover:text-blue-700">
            <MessageCircle className="h-5 w-5 mb-1" />
            <span className="text-xs">Chat</span>
          </button>
          <button className="flex flex-col items-center text-gray-400 hover:text-blue-500">
            <FileText className="h-5 w-5 mb-1" />
            <span className="text-xs">Documents</span>
          </button>
          <button className="flex flex-col items-center text-gray-400 hover:text-blue-500">
            <Database className="h-5 w-5 mb-1" />
            <span className="text-xs">Knowledge</span>
          </button>
        </div>
      </div>
      
      {/* Input Area */}
      <div className="border-t border-gray-200 p-3 sm:p-4">
        <div className="rounded-full bg-gray-100 flex items-center p-2 pr-3">
          <div className="flex-none ml-1">
            <button className="text-gray-400 hover:text-blue-500 p-1 rounded-full" aria-label="Attach file">
              <Paperclip className="h-5 w-5" />
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                ref={uploadInputRef}
              />
            </button>
          </div>
          
          <div className="flex-1 mx-2">
            <input
              type="text"
              placeholder="Type your message or upload a file..."
              className="w-full border-none bg-transparent outline-none py-2 px-1 text-sm md:text-base"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          
          <div className="flex-none flex space-x-1">
            <button 
              className="text-gray-400 hover:text-blue-500 p-1 rounded-full"
              onClick={resetChat}
              aria-label="Reset chat"
            >
              <RefreshCcw className="h-5 w-5" />
            </button>
            
            <button 
              className={`p-2 rounded-full ${(input.trim() || files.length > 0) && !isLoading ? 'bg-gradient-to-b from-blue-400 to-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}
              onClick={handleSubmit}
              disabled={(!input.trim() && files.length === 0) || isLoading}
              aria-label={isLoading ? "Processing..." : "Send message"}
            >
              {isLoading ? (
                <Square className="h-5 w-5 fill-current" />
              ) : (
                <ArrowUp className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="bg-gray-100 flex items-center gap-2 rounded-lg px-3 py-1 text-xs"
              >
                <Paperclip className="size-3" />
                <span className="max-w-[120px] truncate">{file.name}</span>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="hover:bg-gray-200 rounded-full p-1"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumChatInterface;
