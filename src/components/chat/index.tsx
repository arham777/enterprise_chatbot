import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AlertDialog from '@/components/AlertDialog';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { ChatHeader } from './ChatHeader';
import { WelcomeScreen } from './WelcomeScreen';
import { ChatMessage } from './ChatMessage';
import { MessageInput } from './MessageInput';
import { useChatState } from './useChatState';
import { useFileUpload } from './useFileUpload';
import { sendMessage } from './api';
import { ChatMessageType } from './types';

// Add styles for stable scrollbar
const scrollbarStyles = `
  .scrollbar-stable::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .scrollbar-stable::-webkit-scrollbar-track {
    background: transparent;
  }
  .scrollbar-stable::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 20px;
    border: 2px solid transparent;
  }
  .scrollbar-stable {
    scrollbar-width: thin;
    scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
  }
`;

// Main ChatAssistantButton component that brings all pieces together
const ChatAssistantButton = () => {
  const { isOpen, setIsOpen } = useChatAssistant();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [message, setMessage] = useState('');
  const [showCsvDropdown, setShowCsvDropdown] = useState(false);
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const csvDropdownRef = useRef<HTMLDivElement>(null);
  
  // Auth context
  const { isAuthenticated, redirectToLogin, userEmail, userName } = useAuth();
  
  // Alert dialog hook
  const { isOpen: isAlertOpen, options: alertOptions, openAlert, closeAlert, confirm, alert } = useAlertDialog();

  // Chat state management
  const {
    useKnowledgeBase,
    setUseKnowledgeBase,
    csvMode,
    setCsvMode,
    activeCSVFile,
    setActiveCSVFile,
    availableCSVFiles,
    setAvailableCSVFiles,
    chatHistory,
    setChatHistory,
    isLoading: chatIsLoading,
    setIsLoading: setChatIsLoading,
    historyLoadAttempted,
    setHistoryLoadAttempted,
    activeFileId,
    setActiveFileId,
    toggleKnowledgeBase,
    toggleCsvMode,
    resetChat,
    addCsvFileToAvailable,
    handleSelectCsvFile,
    clearCsvFilesList,
    isResetting
  } = useChatState(userEmail, isAuthenticated);

  // File upload functionality
  const {
    fileInputRef,
    isLoading: fileIsLoading,
    handleFileUpload,
    triggerFileUpload
  } = useFileUpload({
    userEmail,
    setChatHistory,
    setUseKnowledgeBase,
    setCsvMode,
    setActiveCSVFile,
    setActiveFileId,
    addCsvFileToAvailable
  });

  // Combined loading state
  const isLoading = chatIsLoading || fileIsLoading;

  // Check if mobile device
  const checkIfMobile = () => {
    return window.innerWidth < 768;
  };
  
  // Initialize mobile detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = checkIfMobile();
      setIsMobile(mobile);
      // Only reset maximized state when going from desktop to mobile
      if (mobile && isMaximized) {
        setIsMaximized(false);
      }
    };
    
    // Check on mount and add resize listener
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMaximized]);

  // Handle chat open/close
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Focus input when chat opens
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Handle escape key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isOpen, setIsOpen]);

  // Scroll to the bottom whenever chatHistory changes or when the chat is opened
  useEffect(() => {
    // Use setTimeout to ensure this runs after the DOM has been updated
    setTimeout(scrollToBottom, 100);
  }, [chatHistory, isOpen]);
  
  // Function to scroll chat to the bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatBodyRef.current) {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
      }
    }, 100);
  };

  // Check URL parameters and session ID
  useEffect(() => {
    // Save session ID to localStorage on first load
    if (!localStorage.getItem('sessionId')) {
      localStorage.setItem('sessionId', `session_${Date.now()}`);
    }

    // Check for URL params that should activate the chat
    const params = new URLSearchParams(window.location.search);
    if (params.get('openChat') === 'true') {
      setIsOpen(true);
      // Remove the param so refreshing doesn't re-open
      const newUrl = `${window.location.pathname}${window.location.hash}`;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  // Add event listener for clicking outside the CSV dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (csvDropdownRef.current && !csvDropdownRef.current.contains(event.target as Node)) {
        setShowCsvDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add event listener for suggested question clicks
  useEffect(() => {
    const handleSuggestedQuestionClick = (event: CustomEvent) => {
      const question = event.detail.question;
      setMessage(question);
    };

    const handleDocumentUploaded = (event: CustomEvent) => {
      const { fileName, fileType } = event.detail;
      const isPDF = fileType === 'PDF' || fileName.toLowerCase().endsWith('.pdf');
      const isCSV = fileType === 'CSV' || fileName.toLowerCase().endsWith('.csv');
      
      // Open the chatbot
      setIsOpen(true);
      
      // Activate appropriate mode based on file type
      if (isPDF) {
        // For PDF files, activate knowledge base
        setUseKnowledgeBase(true);
        setCsvMode(false);
        localStorage.setItem('useKnowledgeBase', 'true');
        localStorage.setItem('csvMode', 'false');
      } else if (isCSV) {
        // For CSV files, activate CSV mode
        setUseKnowledgeBase(false);
        setCsvMode(true);
        setActiveCSVFile(fileName);
        localStorage.setItem('useKnowledgeBase', 'false');
        localStorage.setItem('csvMode', 'true');
        localStorage.setItem('activeCSVFile', fileName);
        
        // Add to available CSV files list
        addCsvFileToAvailable(fileName);
      }
      
      // Create a success message with the same format as in handleFileUpload
      const successMessage = `${isPDF ? 'PDF document' : 'CSV file'} **${fileName}** has been uploaded successfully.\n\n${
        isPDF ? 'The knowledge base has been automatically activated. You can now ask questions about your document content.' :
        'CSV mode has been automatically activated. You can now ask questions about this CSV file.'
      }`;
      
      // Add the message to chat history
      setChatHistory(prev => [...prev, { 
        type: 'user', 
        text: `I'd like to analyze this ${isPDF ? 'PDF document' : 'CSV file'}: ${fileName}`
      }]);
      
      // Add the success response message
      setChatHistory(prev => [...prev, { 
        type: 'bot',
        text: successMessage,
        fileInfo: {
          filename: fileName,
          fileType: isPDF ? 'PDF' : 'CSV',
        }
      }]);
      
      // Set active file ID for CSV files
      if (isCSV) {
        setActiveFileId(fileName);
      } else {
        setActiveFileId(null);
      }
    };
    
    window.addEventListener('suggested-question-click', handleSuggestedQuestionClick as EventListener);
    window.addEventListener('document-uploaded', handleDocumentUploaded as EventListener);
    
    return () => {
      window.removeEventListener('suggested-question-click', handleSuggestedQuestionClick as EventListener);
      window.removeEventListener('document-uploaded', handleDocumentUploaded as EventListener);
    };
  }, []);

  const toggleChat = () => setIsOpen(!isOpen);
  const toggleMaximize = () => setIsMaximized(prevState => !prevState);

  const checkAuth = () => {
    if (!isAuthenticated) {
      setIsOpen(false); // Close chat window
      redirectToLogin(); // Redirect to login
      return false;
    }
    
    return true;
  };

  // Function to check if a message is a greeting
  const isGreeting = (message: string): boolean => {
    const greetingPatterns = [
      /^hi$/i,
      /^hello$/i,
      /^hey$/i,
      /^howdy$/i,
      /^greetings$/i,
      /^hi there$/i,
      /^hello there$/i,
      /^good morning$/i,
      /^good afternoon$/i,
      /^good evening$/i
    ];
    
    return greetingPatterns.some(pattern => pattern.test(message.trim()));
  };

  // Function to get user's name from auth context or fallback to a friendly greeting
  const getUserName = (): string => {
    // First try to get the name from auth context
    if (userName) {
      return userName;
    }
    
    // Fall back to the first part of the email if we have it
    if (userEmail) {
      const namePart = userEmail.split('@')[0];
      return namePart
        .replace(/[.\-_]/g, ' ') // Replace common email separators with spaces
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    
    // Last resort
    return 'there';
  };

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage === '') return;

    // Check if user is authenticated
    if (!checkAuth()) return;

    try {
      // Add user message to chat history
      setChatHistory(prev => [...prev, { type: 'user', text: trimmedMessage }]);
      setMessage('');
      setChatIsLoading(true);

      // Add a placeholder for the bot's response with isStreaming=true
      const placeholderIndex = chatHistory.length + 1;
      setChatHistory(prev => [...prev, { 
        type: 'bot', 
        text: '', 
        isStreaming: true,
        loadingIndicator: true
      }]);
      
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
        setChatIsLoading(false);
        return;
      }

      // If the message was a greeting, personalize the response with the user's name
      if (isGreeting(trimmedMessage)) {
        const userName = getUserName();
        const greetingResponse = `Hello ${userName}! 👋 How can I assist you today?`;
        
        // Replace the loading placeholder with the greeting response
        setChatHistory(prev => [
          ...prev.slice(0, placeholderIndex),
          { 
            type: 'bot', 
            text: greetingResponse,
            isStreaming: true,
            loadingIndicator: false
          }
        ]);
        
        // After a short delay, turn off streaming to complete animation
        setTimeout(() => {
          setChatHistory(prev => [
            ...prev.slice(0, placeholderIndex),
            {
              ...prev[placeholderIndex],
              isStreaming: false
            }
          ]);
        }, greetingResponse.length * 15);
        
        setChatIsLoading(false);
        return;
      }

      // Use the API service to send the message
      const response = await sendMessage(trimmedMessage, userEmail, csvMode, activeCSVFile);
      
      if (response.success) {
        // Update the chat history with the response
        setChatHistory(prev => [
          ...prev.slice(0, placeholderIndex),
          {
            type: 'bot',
            text: response.responseText,
            isStreaming: true,
            loadingIndicator: false,
            sourceDocument: response.sourceDocument,
            suggestedQuestions: response.suggestedQuestions,
            visualization: response.visualization,
            isCsvResponse: response.isCsvResponse
          }
        ]);
        
        // After a delay, turn off streaming to complete animation
        setTimeout(() => {
          setChatHistory(prev => [
            ...prev.slice(0, placeholderIndex),
            {
              ...prev[placeholderIndex],
              isStreaming: false
            }
          ]);
        }, response.responseText.length * 15); // Approximate time to finish the animation
      } else {
        // Handle error response
        setChatHistory(prev => [
          ...prev.slice(0, placeholderIndex),
          { 
            type: 'bot', 
            text: `## Error\n\nSorry, I encountered an error while processing your request.\n\n**Details:** ${response.error || 'Unknown error'}\n\nPlease try again later or contact support with this error message.`,
            isStreaming: false,
            loadingIndicator: false
          }
        ]);
      }
    } catch (error) {
      console.error('Unhandled error in sendMessage:', error);
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
              text: `## Error\n\nAn unexpected error occurred.\n\n**Details:** ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again.`,
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
              text: `## Error\n\nAn unexpected error occurred.\n\n**Details:** ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again.`,
              isStreaming: false,
              loadingIndicator: false
            }
          ];
        }
      });
    } finally {
      setChatIsLoading(false);
    }
  };

  const handleResetChat = () => {
    if (chatHistory.length === 0 && message === '') return;
    
    openAlert({
      title: 'Confirm Reset',
      message: 'Are you sure you want to reset the chat? This will clear all messages.',
      confirmLabel: 'Reset',
      cancelLabel: 'Cancel',
      showCancel: true,
      variant: 'warning',
      onConfirm: async () => {
        const success = await resetChat();
        if (success) {
          setMessage('');
          inputRef.current?.focus();
        }
      }
    });
  };

  // Dynamic Classes
  const chatWindowBaseClasses = "fixed shadow-lg border bg-background rounded-lg overflow-hidden flex flex-col transition-all duration-300 ease-out z-[100]";
  const chatWindowMobileClasses = "inset-x-0 bottom-0 w-full h-[90vh] max-h-[90vh] rounded-b-none";
  const chatWindowDesktopBase = "bottom-4 right-4 w-[400px] h-[600px] max-w-[95vw] max-h-[90vh]";
  const chatWindowDesktopMaximized = "bottom-4 right-4 left-4 top-4 w-auto h-auto max-w-none max-h-none rounded-lg";
  const chatWindowDesktopClasses = isMaximized ? chatWindowDesktopMaximized : chatWindowDesktopBase;

  return (
    <>
      {/* Add scrollbar styles */}
      <style>{scrollbarStyles}</style>
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept=".pdf,.csv"
      />
    
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              chatWindowBaseClasses,
              isMobile ? chatWindowMobileClasses : chatWindowDesktopClasses
            )}
            style={{ transformOrigin: 'bottom right' }}
          >
            {/* Header */}
            <ChatHeader 
              toggleChat={toggleChat}
              toggleMaximize={toggleMaximize}
              isMaximized={isMaximized}
              isMobile={isMobile}
            />

            {/* Chat Body */}
            <CardContent ref={chatBodyRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-muted/20 scrollbar-stable">
              {chatHistory.length === 0 ? (
                // Welcome Screen
                <WelcomeScreen 
                  isMobile={isMobile}
                  triggerFileUpload={triggerFileUpload}
                  toggleKnowledgeBase={toggleKnowledgeBase}
                  setChatHistory={setChatHistory}
                />
              ) : (
                // Chat History
                chatHistory.map((msg, index) => (
                  <ChatMessage key={index} message={msg} />
                ))
              )}
            </CardContent>

            {/* Footer / Input Area */}
            <CardFooter className="p-3 border-t bg-card flex-shrink-0">
              <MessageInput 
                onSendMessage={handleSendMessage}
                onReset={handleResetChat}
                triggerFileUpload={triggerFileUpload}
                toggleKnowledgeBase={toggleKnowledgeBase}
                toggleCsvMode={toggleCsvMode}
                message={message}
                setMessage={setMessage}
                isLoading={isLoading}
                useKnowledgeBase={useKnowledgeBase}
                csvMode={csvMode}
                activeCSVFile={activeCSVFile}
                chatHistoryLength={chatHistory.length}
                showCsvDropdown={showCsvDropdown}
                setShowCsvDropdown={setShowCsvDropdown}
                csvDropdownRef={csvDropdownRef}
                availableCSVFiles={availableCSVFiles}
                handleSelectCsvFile={handleSelectCsvFile}
                inputRef={inputRef}
              />
            </CardFooter>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <motion.div
          key="chat-button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <Button
            onClick={toggleChat}
            className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-md flex items-center justify-center hover:bg-primary/90"
            aria-label="Open chat assistant"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
      
      {/* Alert Dialog */}
      <AlertDialog
        isOpen={isAlertOpen}
        onClose={closeAlert}
        title={alertOptions.title}
        message={alertOptions.message}
        confirmLabel={alertOptions.confirmLabel}
        cancelLabel={alertOptions.cancelLabel}
        showCancel={alertOptions.showCancel}
        variant={alertOptions.variant}
        onConfirm={alertOptions.onConfirm}
      />
    </>
  );
};

// Function to get the ChatAssistant context
const useChatAssistant = () => {
  // This is a placeholder - in the real app, this would be from a context
  const [isOpen, setIsOpen] = useState(false);
  
  return { isOpen, setIsOpen };
};

// Export a function to add file upload messages to chat history
export const addDocumentUploadMessage = (fileName: string, fileType?: 'PDF' | 'CSV') => {
  // Determine file type if not explicitly provided
  const detectedType = fileType || (
    fileName.toLowerCase().endsWith('.pdf') ? 'PDF' :
    fileName.toLowerCase().endsWith('.csv') ? 'CSV' : 'PDF' // Default to PDF if unknown
  );
  
  // Create event with details about the uploaded document
  const event = new CustomEvent('document-uploaded', {
    detail: {
      fileName: fileName,
      fileType: detectedType,
      timestamp: new Date().toISOString()
    }
  });
  
  // Dispatch the event to be handled by the ChatAssistantButton component
  window.dispatchEvent(event);
};

// Export a function to notify the chat when a file is deleted
export const notifyFileDeleted = (fileName: string) => {
  // Create event with details about the deleted document
  const event = new CustomEvent('document-deleted', {
    detail: {
      fileName: fileName,
      timestamp: new Date().toISOString()
    }
  });
  
  // Dispatch the event to be handled by components
  window.dispatchEvent(event);
};

export { ChatAssistantButton, useChatAssistant }; 