import { useState, useRef, useEffect } from 'react';
import { fetchChatHistory, convertHistoryToChatMessages, updateKnowledgeBaseState, deleteChatHistory } from './api';
import { ChatMessageType } from './types';

export const useChatState = (userEmail: string | null, isAuthenticated: boolean) => {
  // Initialize knowledge base state from localStorage if available, default to false
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(() => {
    try {
      // Default to false for all users
      return false;
    } catch (e) {
      return false; // Default to false if localStorage access fails
    }
  });

  // Initialize CSV mode from localStorage if available, default to false
  const [csvMode, setCsvMode] = useState(() => {
    try {
      // Default to false for all users
      return false;
    } catch (e) {
      return false; // Default to false if localStorage access fails
    }
  });

  // Initialize website mode from localStorage if available, default to false
  const [websiteMode, setWebsiteMode] = useState(() => {
    try {
      // Default to false for all users
      return false;
    } catch (e) {
      return false; // Default to false if localStorage access fails
    }
  });

  // Track current active CSV file
  const [activeCSVFile, setActiveCSVFile] = useState<string | null>(() => {
    try {
      return localStorage.getItem('activeCSVFile');
    } catch (e) {
      return null;
    }
  });

  // Track current active website URL
  const [activeWebsiteUrl, setActiveWebsiteUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem('activeWebsiteUrl');
    } catch (e) {
      return null;
    }
  });

  // Track available CSV files
  const [availableCSVFiles, setAvailableCSVFiles] = useState<string[]>(() => {
    try {
      const savedFiles = localStorage.getItem('availableCSVFiles');
      return savedFiles ? JSON.parse(savedFiles) : [];
    } catch (e) {
      return [];
    }
  });

  // Track available website URLs - user specific
  const [availableWebsiteUrls, setAvailableWebsiteUrls] = useState<string[]>([]);

  // Initialize with empty array first, we'll load from sessionStorage in useEffect
  const [chatHistory, setChatHistory] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Track if we've already attempted to load chat history
  const [historyLoadAttempted, setHistoryLoadAttempted] = useState(false);
  
  // Use refs to keep track of state that shouldn't cause re-renders
  const isResetting = useRef<boolean>(false);
  const sessionId = useRef<string>(localStorage.getItem('sessionId') || `session_${Date.now()}`);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    // Load knowledge base setting
    const knowledgeBaseSetting = localStorage.getItem('useKnowledgeBase');
    if (knowledgeBaseSetting === 'true') {
      setUseKnowledgeBase(true);
    }
    
    // Load CSV mode setting
    const csvModeSetting = localStorage.getItem('csvMode');
    if (csvModeSetting === 'true') {
      setCsvMode(true);
    }
    
    // Load active CSV file
    const storedActiveCSVFile = localStorage.getItem('activeCSVFile');
    if (storedActiveCSVFile) {
      setActiveCSVFile(storedActiveCSVFile);
    }
    
    // Load available CSV files
    try {
      const storedCSVFiles = localStorage.getItem('availableCSVFiles');
      if (storedCSVFiles) {
        const parsedFiles = JSON.parse(storedCSVFiles);
        if (Array.isArray(parsedFiles)) {
          setAvailableCSVFiles(parsedFiles);
        }
      }
    } catch (e) {
      console.error('Failed to load available CSV files from localStorage', e);
    }
    
    // Load website mode setting
    const websiteModeSetting = localStorage.getItem('websiteMode');
    if (websiteModeSetting === 'true') {
      setWebsiteMode(true);
    }
    
    // Load active website URL
    const storedActiveWebsiteUrl = localStorage.getItem('activeWebsiteUrl');
    if (storedActiveWebsiteUrl) {
      setActiveWebsiteUrl(storedActiveWebsiteUrl);
    }
    
    // Website URLs are now loaded in the authentication state change effect
  }, []);

  // Effect to save chat history to session storage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0 && isAuthenticated && userEmail) {
      // Save chat history to user-specific session storage for persistence
      sessionStorage.setItem(`chatHistory_${userEmail}`, JSON.stringify(chatHistory));
    }
  }, [chatHistory, isAuthenticated, userEmail]);

  // Effect to handle authentication changes and clearing user data
  useEffect(() => {
    // If user is not authenticated, deactivate the knowledge base and clear user-specific data
    if (!isAuthenticated) {
      // Deactivate all modes
      setUseKnowledgeBase(false);
      setCsvMode(false);
      setWebsiteMode(false);
      
      // Clear active items
      setActiveWebsiteUrl(null);
      setActiveCSVFile(null);
      
      // Clear the available website URLs list so they don't appear for other users
      setAvailableWebsiteUrls([]);
      
      // Remove from localStorage
      localStorage.removeItem('useKnowledgeBase');
      localStorage.removeItem('csvMode');
      localStorage.removeItem('websiteMode');
      localStorage.removeItem('activeCSVFile');
      localStorage.removeItem('activeWebsiteUrl');
      
      // If we have a previous user email, clear their specific data
      const prevUserEmail = localStorage.getItem('prevUserEmail');
      if (prevUserEmail) {
        localStorage.removeItem(`availableWebsiteUrls_${prevUserEmail}`);
      }
      
      // If we have access to the backend, also update it there
      if (userEmail) {
        localStorage.setItem('prevUserEmail', userEmail); // Store previous email for cleanup
        updateKnowledgeBaseState(false, userEmail).catch(error => {
          console.error('Failed to deactivate knowledge base on sign out:', error);
        });
      }
    } else if (isAuthenticated && userEmail) {
      // User is authenticated - load their specific website URLs
      try {
        // Set the current user email for later cleanup if needed
        localStorage.setItem('prevUserEmail', userEmail);
        
        // Load available website URLs
        const availableWebsitesKey = `availableWebsiteUrls_${userEmail}`;
        const storedAvailableUrls = localStorage.getItem(availableWebsitesKey);
        
        // Load embedded websites URLs (URLs that have successful embeddings)
        const embeddedWebsitesKey = `embeddedWebsites_${userEmail}`;
        const storedEmbeddedUrls = localStorage.getItem(embeddedWebsitesKey);
        
        // Combine both sources, prioritizing the embedded websites
        let combinedUrls: string[] = [];
        
        if (storedAvailableUrls) {
          try {
            const parsedUrls = JSON.parse(storedAvailableUrls);
            if (Array.isArray(parsedUrls)) {
              combinedUrls = [...parsedUrls];
            }
          } catch (e) {
            console.error('Failed to parse available website URLs', e);
          }
        }
        
        if (storedEmbeddedUrls) {
          try {
            const parsedUrls = JSON.parse(storedEmbeddedUrls);
            if (Array.isArray(parsedUrls)) {
              // Add embedded URLs and remove duplicates
              combinedUrls = [...new Set([...combinedUrls, ...parsedUrls])];
            }
          } catch (e) {
            console.error('Failed to parse embedded website URLs', e);
          }
        }
        
        // Update the state with user-specific URLs
        setAvailableWebsiteUrls(combinedUrls);
      } catch (e) {
        console.error('Failed to load user-specific website URLs:', e);
      }
    }
  }, [isAuthenticated, userEmail]);

  // Effect to load chat history from sessionStorage when auth data is available
  useEffect(() => {
    if (isAuthenticated && userEmail) {
      // Check if we have a cached history for this user
      const savedHistory = sessionStorage.getItem(`chatHistory_${userEmail}`);
      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory);
          if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
            // Load chat history from sessionStorage
            setChatHistory(parsedHistory);
            // Mark history as loaded since we found it in sessionStorage
            setHistoryLoadAttempted(true);
            console.log('Loaded chat history from sessionStorage for user:', userEmail);
            
            // Ensure buttons are deactivated by default
            setUseKnowledgeBase(false);
            setCsvMode(false);
            setWebsiteMode(false);
          } else {
            // If cached history exists but is empty, attempt to load from backend
            setHistoryLoadAttempted(false);
          }
        } catch (error) {
          console.error('Error parsing chat history from sessionStorage:', error);
          // Invalid cache, clear it
          sessionStorage.removeItem(`chatHistory_${userEmail}`);
          setHistoryLoadAttempted(false);
        }
      } else {
        // No cached history, will attempt to load from backend
        // historyLoadAttempted flag is already false by default
        console.log('No cached chat history found for user:', userEmail);
      }
    } else if (!isAuthenticated) {
      // Clear chat history when logged out
      setChatHistory([]);
      setHistoryLoadAttempted(false);
    }
  }, [isAuthenticated, userEmail]);

  // Load user-specific chat history 
  useEffect(() => {
    // Reset history load attempted flag when user changes
    if (userEmail) {
      const hasAttemptedForCurrentUser = sessionStorage.getItem(`historyLoadAttempted_${userEmail}`) === 'true';
      setHistoryLoadAttempted(hasAttemptedForCurrentUser);
    }
    
    // Try to load chat history only if needed conditions are met
    if (userEmail && chatHistory.length === 0 && !historyLoadAttempted && !isLoading) {
      console.log('Attempting to load chat history for user:', userEmail);
      
      const loadChatHistory = async () => {
        setIsLoading(true);
        try {
          // Mark that we've attempted to load history for this user
          sessionStorage.setItem(`historyLoadAttempted_${userEmail}`, 'true');
          setHistoryLoadAttempted(true);
          
          const result = await fetchChatHistory(userEmail);
          if (result.success && result.data) {
            // Convert to our format
            const formattedHistory = convertHistoryToChatMessages(result.data);
            if (formattedHistory.length > 0) {
              setChatHistory(formattedHistory);
              console.log(`Chat history loaded successfully: ${formattedHistory.length} messages`);
            }
          }
        } catch (error) {
          console.error('Error loading chat history:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadChatHistory();
    }
  }, [userEmail, chatHistory.length, historyLoadAttempted, isLoading]);

  // Effect to listen for file deletion events
  useEffect(() => {
    // Handler for CSV file deletion
    const handleFileDeleted = (event: CustomEvent) => {
      const { fileName } = event.detail;
      
      // Check if this is a CSV file
      if (fileName && fileName.toLowerCase().endsWith('.csv')) {
        // Remove the file from the available files list
        setAvailableCSVFiles(prev => {
          const newList = prev.filter(file => file !== fileName);
          
          // Save updated list to localStorage
          try {
            localStorage.setItem('availableCSVFiles', JSON.stringify(newList));
          } catch (e) {
            console.error('Failed to update available CSV files in localStorage', e);
          }
          
          return newList;
        });
        
        // If this was the active file, reset CSV mode
        if (activeCSVFile === fileName) {
          setCsvMode(false);
          setActiveCSVFile(null);
          localStorage.removeItem('csvMode');
          localStorage.removeItem('activeCSVFile');
        }
      }
    };
    
    // Add event listener
    window.addEventListener('document-deleted', handleFileDeleted as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('document-deleted', handleFileDeleted as EventListener);
    };
  }, [activeCSVFile]);

  // Helper function to toggle knowledge base
  const toggleKnowledgeBase = async () => {
    // Toggle state first for immediate UI feedback
    const newState = !useKnowledgeBase;
    setUseKnowledgeBase(newState);
    
    // If turning on knowledge base, turn off other modes
    if (newState) {
      setCsvMode(false);
      setWebsiteMode(false);
      try {
        localStorage.setItem('csvMode', 'false');
        localStorage.setItem('websiteMode', 'false');
      } catch (e) {
        console.error('Failed to update other modes while toggling knowledge base', e);
      }
    }
    
    // Persist the knowledge base state in localStorage
    try {
      localStorage.setItem('useKnowledgeBase', newState ? 'true' : 'false');
    } catch (e) {
      console.error('Failed to save knowledge base state to localStorage', e);
    }
    
    // Update the backend with the new state if user is authenticated
    if (userEmail) {
      await updateKnowledgeBaseState(newState, userEmail);
    }
  };

  // Toggle CSV mode
  const toggleCsvMode = async () => {
    // Toggle state for immediate UI feedback
    const newState = !csvMode;
    setCsvMode(newState);
    
    // If turning on CSV mode, turn off other modes
    if (newState) {
      setUseKnowledgeBase(false);
      setWebsiteMode(false);
      try {
        localStorage.setItem('useKnowledgeBase', 'false');
        localStorage.setItem('websiteMode', 'false');
        if (userEmail) {
          await updateKnowledgeBaseState(false, userEmail);
        }
      } catch (e) {
        console.error('Failed to update other modes while toggling CSV mode', e);
      }
    }
    
    // Persist the CSV mode state in localStorage
    try {
      localStorage.setItem('csvMode', newState ? 'true' : 'false');
    } catch (e) {
      console.error('Failed to save CSV mode state to localStorage', e);
    }
  };

  // Toggle Website mode
  const toggleWebsiteMode = async () => {
    // Toggle state for immediate UI feedback
    const newState = !websiteMode;
    setWebsiteMode(newState);
    
    // If turning on Website mode, turn off other modes
    if (newState) {
      setUseKnowledgeBase(false);
      setCsvMode(false);
      try {
        localStorage.setItem('useKnowledgeBase', 'false');
        localStorage.setItem('csvMode', 'false');
        if (userEmail) {
          await updateKnowledgeBaseState(false, userEmail);
        }
      } catch (e) {
        console.error('Failed to update other modes while toggling Website mode', e);
      }
    }
    
    // Persist the Website mode state in localStorage
    try {
      localStorage.setItem('websiteMode', newState ? 'true' : 'false');
    } catch (e) {
      console.error('Failed to save Website mode state to localStorage', e);
    }
  };

  // Function to reset chat
  const resetChat = async () => {
    if (chatHistory.length === 0) return;
    
    // Set resetting flag to prevent immediate refetch of chat history
    isResetting.current = true;
    
    // Check if there's any PDF document or CSV file in the chat history
    const hasPdfDocument = chatHistory.some(
      msg => msg.fileInfo?.fileType === 'PDF'
    );
    
    const hasCsvFile = chatHistory.some(
      msg => msg.fileInfo?.fileType === 'CSV'
    );
    
    // Check if there's any website search in the chat history
    const hasWebsiteSearch = chatHistory.some(
      msg => msg.isWebsiteResponse
    );
    
    // Delete the chat_history.csv file if user is authenticated
    if (userEmail) {
      await deleteChatHistory(userEmail);
    }
    
    // Clear chat history and reset state
    setChatHistory([]);
    
    // Reset history load attempted flag so we can try loading history again
    setHistoryLoadAttempted(false);
    
    // Also remove session storage entries to ensure saved chat is completely deleted
    if (userEmail) {
      // Remove the history load attempted flag for this user
      sessionStorage.removeItem(`historyLoadAttempted_${userEmail}`);
      // Remove any saved chat history
      sessionStorage.removeItem(`chatHistory_${userEmail}`);
    }
    
    // Only reset knowledge base if there's no PDF document
    if (!hasPdfDocument) {
      setUseKnowledgeBase(false);
    }
    
    // Only reset CSV mode if there's no CSV file
    if (!hasCsvFile) {
      setCsvMode(false);
      setActiveCSVFile(null);
      localStorage.removeItem('csvMode');
      localStorage.removeItem('activeCSVFile');
    }
    
    // Only reset website mode if there's no website search
    if (!hasWebsiteSearch) {
      setWebsiteMode(false);
      setActiveWebsiteUrl(null);
      localStorage.removeItem('websiteMode');
      localStorage.removeItem('activeWebsiteUrl');
    }
    
    // Reset active file ID
    setActiveFileId(null);
    
    // Reset the flag after a short delay
    setTimeout(() => {
      isResetting.current = false;
    }, 1000);

    return true;
  };

  // Function to add a new CSV file to the available files list
  const addCsvFileToAvailable = (fileName: string) => {
    // Only add if it's not already in the list
    setAvailableCSVFiles(prev => {
      if (!prev.includes(fileName)) {
        const newList = [...prev, fileName];
        // Save to localStorage
        try {
          localStorage.setItem('availableCSVFiles', JSON.stringify(newList));
        } catch (e) {
          console.error('Failed to save available CSV files to localStorage', e);
        }
        return newList;
      }
      return prev;
    });
  };
  
  // Function to handle selecting a CSV file from the dropdown
  const handleSelectCsvFile = (fileName: string) => {
    setActiveCSVFile(fileName);
    setCsvMode(true);
    localStorage.setItem('activeCSVFile', fileName);
    localStorage.setItem('csvMode', 'true');
    
    // Notify the user that the file has been selected
    setChatHistory(prev => [...prev, { 
      type: 'bot', 
      text: `CSV mode activated for file: **${fileName}**. You can now ask questions about this data.`,
      isCsvResponse: true,
      suggestedQuestions: []
    }]);
  };

  // Function to clear all CSV files from the available list
  const clearCsvFilesList = () => {
    setAvailableCSVFiles([]);
    // If CSV mode is active, deactivate it
    if (csvMode) {
      setCsvMode(false);
      localStorage.setItem('csvMode', 'false');
    }
    setActiveCSVFile(null);
    localStorage.removeItem('availableCSVFiles');
    localStorage.removeItem('activeCSVFile');

    // Notify the user
    setChatHistory(prev => [...prev, { 
      type: 'bot', 
      text: 'CSV file list has been cleared.',
      isCsvResponse: false,
      suggestedQuestions: []
    }]);
  };

  // Function to add a new website URL to the available URLs list
  const addWebsiteUrlToAvailable = (url: string) => {
    // Only add if it's not already in the list and user is authenticated
    if (!isAuthenticated || !userEmail) return;
    
    setAvailableWebsiteUrls(prev => {
      if (!prev.includes(url)) {
        const newList = [...prev, url];
        
        // Save to both regular availability list and embedded websites list
        try {
          // Regular availability list
          localStorage.setItem(`availableWebsiteUrls_${userEmail}`, JSON.stringify(newList));
          
          // Embedded websites list (for tracking which have successfully created embeddings)
          const embeddedKey = `embeddedWebsites_${userEmail}`;
          const currentEmbedded = localStorage.getItem(embeddedKey);
          let embeddedList = [];
          
          if (currentEmbedded) {
            embeddedList = JSON.parse(currentEmbedded);
            if (!Array.isArray(embeddedList)) embeddedList = [];
          }
          
          if (!embeddedList.includes(url)) {
            embeddedList.push(url);
            localStorage.setItem(embeddedKey, JSON.stringify(embeddedList));
          }
        } catch (e) {
          console.error('Failed to save website URLs to localStorage', e);
        }
        
        return newList;
      }
      return prev;
    });
  };
  
  // Function to handle selecting a website from the dropdown
  const handleSelectWebsite = (url: string) => {
    setActiveWebsiteUrl(url);
    setWebsiteMode(true);
    localStorage.setItem('activeWebsiteUrl', url);
    localStorage.setItem('websiteMode', 'true');
    
    // Notify the user that the website has been selected
    setChatHistory(prev => [...prev, { 
      type: 'bot', 
      text: `Website mode activated for: **${url}**. You can now ask questions about this website.`,
      isWebsiteResponse: true,
      suggestedQuestions: []
    }]);
  };

  // Function to clear all website URLs from the available list
  const clearWebsiteUrlsList = () => {
    if (!isAuthenticated || !userEmail) return;
    
    setAvailableWebsiteUrls([]);
    // If website mode is active, deactivate it
    if (websiteMode) {
      setWebsiteMode(false);
      localStorage.setItem('websiteMode', 'false');
    }
    setActiveWebsiteUrl(null);
    
    // Clear both localStorage keys
    localStorage.removeItem(`availableWebsiteUrls_${userEmail}`);
    localStorage.removeItem(`embeddedWebsites_${userEmail}`);
    localStorage.removeItem('activeWebsiteUrl');

    // Notify the user
    setChatHistory(prev => [...prev, { 
      type: 'bot', 
      text: 'Website URL list has been cleared.',
      isWebsiteResponse: false,
      suggestedQuestions: []
    }]);
  };

  // Function to remove a single website URL from available list
  const removeWebsiteUrl = (url: string) => {
    if (!isAuthenticated || !userEmail) return;
    
    // Remove from state
    setAvailableWebsiteUrls(prev => {
      const newList = prev.filter(item => item !== url);
      
      // Save updated list to localStorage
      try {
        // Update regular availability list
        localStorage.setItem(`availableWebsiteUrls_${userEmail}`, JSON.stringify(newList));
        
        // Update embedded websites list
        const embeddedKey = `embeddedWebsites_${userEmail}`;
        const currentEmbedded = localStorage.getItem(embeddedKey);
        
        if (currentEmbedded) {
          const embeddedList = JSON.parse(currentEmbedded);
          if (Array.isArray(embeddedList)) {
            const updatedEmbedded = embeddedList.filter(item => item !== url);
            localStorage.setItem(embeddedKey, JSON.stringify(updatedEmbedded));
          }
        }
      } catch (e) {
        console.error('Failed to update website URLs in localStorage', e);
      }
      
      return newList;
    });
    
    // If this is the active URL, deactivate website mode
    if (activeWebsiteUrl === url) {
      setActiveWebsiteUrl(null);
      localStorage.removeItem('activeWebsiteUrl');
      
      if (websiteMode) {
        setWebsiteMode(false);
        localStorage.setItem('websiteMode', 'false');
      }
    }
  };

  return {
    useKnowledgeBase,
    setUseKnowledgeBase,
    csvMode,
    setCsvMode,
    websiteMode,
    setWebsiteMode,
    activeCSVFile,
    setActiveCSVFile,
    activeWebsiteUrl,
    setActiveWebsiteUrl,
    availableCSVFiles,
    setAvailableCSVFiles,
    availableWebsiteUrls,
    setAvailableWebsiteUrls,
    chatHistory,
    setChatHistory,
    isLoading,
    setIsLoading,
    historyLoadAttempted,
    setHistoryLoadAttempted,
    activeFileId,
    setActiveFileId,
    toggleKnowledgeBase,
    toggleCsvMode,
    toggleWebsiteMode,
    resetChat,
    addCsvFileToAvailable,
    handleSelectCsvFile,
    clearCsvFilesList,
    addWebsiteUrlToAvailable,
    handleSelectWebsite,
    clearWebsiteUrlsList,
    removeWebsiteUrl,
    isResetting
  };
}; 