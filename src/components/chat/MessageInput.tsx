import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Plus, Send, RefreshCw, Database, Table2, Loader2, Globe, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import axios from 'axios';

// Define API URL constant
const API_URL = import.meta.env.VITE_API_URL || 'http://103.18.20.205:8070';

interface MessageInputProps {
  onSendMessage: () => void;
  onReset: () => void;
  triggerFileUpload: () => void;
  toggleKnowledgeBase: () => Promise<void>;
  toggleCsvMode: () => Promise<void>;
  toggleWebsiteMode: () => Promise<void>;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  useKnowledgeBase: boolean;
  csvMode: boolean;
  websiteMode: boolean;
  activeCSVFile: string | null;
  activeWebsiteUrl: string | null;
  setActiveWebsiteUrl: React.Dispatch<React.SetStateAction<string | null>>;
  chatHistoryLength: number;
  showCsvDropdown: boolean;
  setShowCsvDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  showWebsiteModal: boolean;
  setShowWebsiteModal: React.Dispatch<React.SetStateAction<boolean>>;
  websiteModalRef: React.RefObject<HTMLDivElement>;
  csvDropdownRef: React.RefObject<HTMLDivElement>;
  availableCSVFiles: string[];
  availableWebsiteUrls: string[];
  handleSelectCsvFile: (fileName: string) => void;
  handleSelectWebsite: (url: string) => void;
  addWebsiteUrlToAvailable: (url: string) => void;
  removeWebsiteUrl: (url: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  isFullscreen?: boolean;
  isAuthenticated: boolean;
  userEmail: string;
}

// Define the document type
type DocumentItem = string | {
  name?: string;
  fileName?: string;
  filename?: string;
  [key: string]: unknown;
};

// Define the response type
interface DocumentsResponse {
  documents?: DocumentItem[];
  files?: DocumentItem[];
  items?: DocumentItem[];
  data?: DocumentItem[];
  [key: string]: unknown;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onReset,
  triggerFileUpload,
  toggleKnowledgeBase,
  toggleCsvMode,
  toggleWebsiteMode,
  message,
  setMessage,
  isLoading,
  useKnowledgeBase,
  csvMode,
  websiteMode,
  activeCSVFile,
  activeWebsiteUrl,
  setActiveWebsiteUrl,
  chatHistoryLength,
  showCsvDropdown,
  setShowCsvDropdown,
  showWebsiteModal,
  setShowWebsiteModal,
  websiteModalRef,
  csvDropdownRef,
  availableCSVFiles: propAvailableCSVFiles,
  availableWebsiteUrls,
  handleSelectCsvFile,
  handleSelectWebsite,
  addWebsiteUrlToAvailable,
  removeWebsiteUrl,
  inputRef,
  isFullscreen = false,
  isAuthenticated,
  userEmail
}) => {
  const [tempWebsiteUrl, setTempWebsiteUrl] = useState(activeWebsiteUrl || "");
  const [showWebsiteDropdown, setShowWebsiteDropdown] = useState(false);
  const [csvFiles, setCsvFiles] = useState<string[]>([]);
  const [isFetchingCsvFiles, setIsFetchingCsvFiles] = useState(false);
  const websiteDropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Memoize the fetchCsvFiles function to avoid dependency issues
  const fetchCsvFiles = React.useCallback(async () => {
    if (!isAuthenticated || !userEmail) {
      console.log('Not fetching CSV files - user not authenticated or email missing');
      return;
    }
    
    setIsFetchingCsvFiles(true);
    try {
      // Use the same endpoint format as in DocumentSidebar
      const endpoint = `${API_URL}/get-all-documents/?email=${encodeURIComponent(userEmail)}`;
      console.log('Fetching CSV files from endpoint:', endpoint);
      
      const response = await axios.get(endpoint);
      console.log('CSV files response status:', response.status);
      console.log('CSV files response data type:', typeof response.data);
      
      // If response is HTML, log a portion of it to debug
      if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE')) {
        console.error('Received HTML response instead of JSON. First 100 chars:',
          response.data.substring(0, 100));
        setCsvFiles([]);
        return;
      }
      
      if (typeof response.data === 'string') {
        try {
          // Try parsing if it's a JSON string
          const parsedData = JSON.parse(response.data);
          console.log('Parsed string response:', parsedData);
          
          if (Array.isArray(parsedData)) {
            const filteredCsvFiles = parsedData
              .filter((file: string) => 
                typeof file === 'string' && 
                file.toLowerCase().endsWith('.csv') && 
                file !== 'chat_history.csv')
              .map((file: string) => file);
            
            console.log('Filtered CSV files from string:', filteredCsvFiles);
            setCsvFiles(filteredCsvFiles);
            return;
          }
        } catch (parseError) {
          console.error('Error parsing response string:', parseError);
          // If we can't parse the string and it's HTML-like, log more details
          if (response.data.includes('<html') || response.data.includes('<!DOCTYPE')) {
            console.error('Response appears to be HTML, not JSON. This indicates an error with the endpoint.');
          } else {
            console.error('First 100 characters of response:', response.data.substring(0, 100));
          }
          setCsvFiles([]);
          return;
        }
      }
      
      // Check the structure of the response data
      if (response.data) {
        let csvFilesData: DocumentItem[] = [];
        
        // Handle different response formats
        if (Array.isArray(response.data)) {
          console.log('Response is an array with', response.data.length, 'items');
          csvFilesData = response.data;
        } else if (typeof response.data === 'object' && response.data !== null) {
          console.log('Response is an object with keys:', Object.keys(response.data).join(', '));
          
          // Try different possible response structures
          const data = response.data as DocumentsResponse;
          
          if (data.documents && Array.isArray(data.documents)) {
            console.log('Found documents array with', data.documents.length, 'items');
            csvFilesData = data.documents;
          } else if (data.files && Array.isArray(data.files)) {
            console.log('Found files array with', data.files.length, 'items');
            csvFilesData = data.files;
          } else if (data.items && Array.isArray(data.items)) {
            console.log('Found items array with', data.items.length, 'items');
            csvFilesData = data.items;
          } else if (data.data && Array.isArray(data.data)) {
            console.log('Found data array with', data.data.length, 'items');
            csvFilesData = data.data;
          }
        }
        
        if (csvFilesData.length === 0) {
          console.log('No CSV data found in response');
        } else {
          console.log('CSV data before filtering:', csvFilesData);
        }
        
        // Filter for CSV files only and exclude chat_history.csv
        const filteredCsvFiles = csvFilesData
          .filter((file: DocumentItem) => {
            // Handle if file is an object or string
            const fileName = typeof file === 'string' ? file : (file.name || file.fileName || file.filename || '');
            const isCSV = fileName.toLowerCase().endsWith('.csv');
            const isNotChatHistory = fileName !== 'chat_history.csv';
            const result = isCSV && isNotChatHistory;
            console.log(`File "${fileName}": isCSV=${isCSV}, isNotChatHistory=${isNotChatHistory}, included=${result}`);
            return result;
          })
          .map((file: DocumentItem) => typeof file === 'string' ? file : (file.name || file.fileName || file.filename || ''));
        
        console.log('Filtered CSV files:', filteredCsvFiles);
        setCsvFiles(filteredCsvFiles);
      } else {
        console.log('Response data is empty or invalid');
      }
    } catch (error) {
      console.error('Error fetching CSV files:', error);
      
      // Check if the error is Axios error and log more details
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Status text:', error.response?.statusText);
        console.error('Error message:', error.message);
        
        // Log the response data if available
        if (error.response?.data) {
          if (typeof error.response.data === 'string') {
            console.error('Response data (first 100 chars):', error.response.data.substring(0, 100));
          } else {
            console.error('Response data:', error.response.data);
          }
        }
      }
      
      setCsvFiles([]);
    } finally {
      setIsFetchingCsvFiles(false);
    }
  }, [isAuthenticated, userEmail]);

  // Add useEffect to fetch CSV files when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchCsvFiles();
    }
  }, [isAuthenticated, fetchCsvFiles]);

  // Make sure showCsvDropdown triggers fetchCsvFiles
  const handleToggleCsvDropdown = () => {
    const newState = !showCsvDropdown;
    setShowCsvDropdown(newState);
    setShowWebsiteDropdown(false);
    
    if (newState) {
      fetchCsvFiles();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize the textarea based on content
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      
      // Calculate the new height (with max height for 4 lines)
      const newHeight = Math.min(textareaRef.current.scrollHeight, 96); // approx 24px per line * 4 lines
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  // Update textarea height when component mounts or message changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 96);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [message]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const validateAndAddWebsite = () => {
    // Don't allow adding websites if user is not authenticated
    if (!isAuthenticated || !userEmail) {
      alert("Please sign in to add websites");
      setShowWebsiteModal(false);
      return;
    }
    
    if (tempWebsiteUrl) {
      try {
        // Validate URL
        new URL(tempWebsiteUrl);
        
        // Set as active and add to available list
        setActiveWebsiteUrl(tempWebsiteUrl);
        addWebsiteUrlToAvailable(tempWebsiteUrl);
        
        // Activate website mode
        if (!websiteMode) {
          toggleWebsiteMode();
        }
        
        // Close modal
        setShowWebsiteModal(false);
      } catch (err) {
        // Invalid URL
        alert("Please enter a valid website URL");
      }
    } else {
      alert("Please enter a website URL");
    }
  };

  // Effect to handle clicking outside website dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (websiteDropdownRef.current && !websiteDropdownRef.current.contains(event.target as Node)) {
        setShowWebsiteDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add function to handle website search errors
  const handleWebsiteSearchError = (url: string, errorMessage: string) => {
    // If error contains indication that embedding failed
    if (errorMessage.includes("failed") || 
        errorMessage.includes("unavailable") || 
        errorMessage.includes("incorrect")) {
      // Remove the problematic URL
      removeWebsiteUrl(url);
      
      // Also deactivate website mode if the current URL is the one that failed
      if (activeWebsiteUrl === url) {
        setActiveWebsiteUrl(null);
        if (websiteMode) {
          toggleWebsiteMode();
        }
      }
      
      // Notify user
      alert(`The website "${url}" could not be embedded and has been removed from your list.`);
    }
  };

  // Pass this handler to parent component through onSendMessage
  const handleSendMessage = () => {
    // If in website mode and there's an error, check for embedding issues
    if (websiteMode && activeWebsiteUrl) {
      // The parent component should call handleWebsiteSearchError if embedding fails
      onSendMessage();
    } else {
      onSendMessage();
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="relative">
        <textarea
          ref={textareaRef}
          placeholder="Type your message here..."
          className={cn(
            "w-full min-h-[36px] max-h-[96px] px-3 py-2 bg-muted/30 border border-border rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground resize-none overflow-y-auto",
            isLoading && "opacity-60"
          )}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={1}
        />
      </div>
      
      {/* Action buttons row below input */}
      <div className="flex items-center justify-between gap-2 mt-1">
        {/* Left side buttons */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size={isFullscreen ? "sm" : "icon"}
            className={cn(
              "text-muted-foreground hover:text-primary flex-shrink-0", 
              isFullscreen ? "h-8 px-3" : "h-8 w-8"
            )}
            aria-label="Upload document or data file"
            onClick={triggerFileUpload}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-1" />
            {isFullscreen && <span className="text-xs">Upload</span>}
          </Button>
          
          <Button
            variant="ghost"
            size={isFullscreen ? "sm" : "icon"}
            onClick={toggleKnowledgeBase}
            className={cn(
              "flex-shrink-0 hover:text-primary relative",
              useKnowledgeBase ? "text-primary bg-primary/20 ring-1 ring-primary" : "text-muted-foreground",
              isFullscreen ? "h-8 px-3" : "h-8 w-8"
            )}
            aria-label={useKnowledgeBase ? "Deactivate knowledge base" : "Activate knowledge base"}
            title={useKnowledgeBase ? "Knowledge base active" : "Activate knowledge base"}
            disabled={isLoading || csvMode || websiteMode}
          >
            <Database className="h-4 w-4 mr-1" />
            {isFullscreen && <span className="text-xs">Knowledge</span>}
          </Button>
          
          {/* CSV Button with Dropdown */}
          <Button
            variant="ghost"
            size={isFullscreen ? "sm" : "icon"}
            onClick={handleToggleCsvDropdown}
            className={cn(
              "flex-shrink-0 hover:text-primary",
              csvMode ? "text-primary bg-primary/20 ring-1 ring-primary" : "text-muted-foreground",
              isFullscreen ? "h-8 px-3" : "h-8 w-8"
            )}
            aria-label={csvMode ? "CSV files menu" : "CSV files menu"}
            title={csvMode ? "CSV mode active - Click to view files" : "View CSV files"}
            disabled={isLoading || useKnowledgeBase || websiteMode}
          >
            <Table2 className="h-4 w-4 mr-1" />
            {isFullscreen && <span className="text-xs">CSV Data</span>}
          </Button>
          
          {/* Show active CSV file name - only in compact mode */}
          {!isFullscreen && csvMode && activeCSVFile && (
            <div className="text-[7px] text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[40px]" title={activeCSVFile}>
              {activeCSVFile.split('.')[0]}
            </div>
          )}
          
          {/* Website Button */}
          <Button
            variant="ghost"
            size={isFullscreen ? "sm" : "icon"}
            onClick={() => {
              // If we already have website URLs, show the dropdown
              if (availableWebsiteUrls.length > 0) {
                setShowWebsiteDropdown(prev => !prev);
                setShowCsvDropdown(false);
              } else {
                // Otherwise show the modal to add a new URL
                setShowWebsiteModal(prev => !prev);
              }
            }}
            className={cn(
              "flex-shrink-0 hover:text-primary",
              websiteMode ? "text-primary bg-primary/20 ring-1 ring-primary" : "text-muted-foreground",
              isFullscreen ? "h-8 px-3" : "h-8 w-8"
            )}
            aria-label={websiteMode ? "Website search active" : "Search from website"}
            title={websiteMode ? "Website mode active" : "Search from website"}
            disabled={isLoading || useKnowledgeBase || csvMode}
          >
            <Globe className="h-4 w-4 mr-1" />
            {isFullscreen && <span className="text-xs">Web search</span>}
          </Button>
          
          {/* Show active website URL - only in compact mode */}
          {!isFullscreen && websiteMode && activeWebsiteUrl && (
            <div className="text-[7px] text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[40px]" title={activeWebsiteUrl}>
              {(() => {
                try {
                  return new URL(activeWebsiteUrl).hostname;
                } catch {
                  return activeWebsiteUrl;
                }
              })()}
            </div>
          )}
        </div>
        
        {/* Right side buttons */}
        <div className="flex items-center gap-2">
          {chatHistoryLength > 1 && (
            <Button 
              variant="ghost" 
              size={isFullscreen ? "sm" : "icon"}
              className={cn(
                "text-muted-foreground hover:text-primary",
                isFullscreen ? "h-8 px-3" : "h-8 w-8"
              )}
              onClick={onReset}
              aria-label="Reset chat"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              {isFullscreen && <span className="text-xs">Reset</span>}
            </Button>
          )}
          
          <Button
            variant="default"
            size={isFullscreen ? "sm" : "icon"}
            className={cn(
              isFullscreen ? "h-8 rounded-full px-4" : "h-8 w-8 rounded-full"
            )}
            disabled={message.trim() === '' || isLoading}
            onClick={handleSendMessage}
            aria-label="Send message"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                {isFullscreen && <span className="text-xs">Sending</span>}
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-1" />
                {isFullscreen && <span className="text-xs">Send</span>}
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* CSV files dropdown - update position to match new layout */}
      {showCsvDropdown && (
        <div
          ref={csvDropdownRef}
          className={`absolute ${isFullscreen ? 'bottom-28' : 'bottom-24'} left-1/2 transform -translate-x-1/2 bg-background border border-border rounded-md shadow-lg p-2 z-50 w-48`}
        >
          <div className="text-sm font-medium mb-2">Available CSV Files</div>
          {isFetchingCsvFiles ? (
            <div className="flex justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : csvFiles.length === 0 ? (
            <div className="text-xs text-muted-foreground italic">
              No CSV files available. Upload a CSV file first.
            </div>
          ) : (
            <div className="max-h-40 overflow-y-auto">
              {csvFiles.map((file, index) => (
                <div
                  key={index}
                  className={`text-sm px-2 py-1 rounded cursor-pointer hover:bg-accent flex items-center ${activeCSVFile === file ? 'bg-accent' : ''}`}
                  onClick={() => {
                    handleSelectCsvFile(file);
                    setShowCsvDropdown(false);
                  }}
                >
                  <div className="text-primary mr-1">
                    <Table2 className="h-3 w-3" />
                  </div>
                  <span className="truncate" title={file}>
                    {file}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-2 pt-1 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs" 
              onClick={toggleCsvMode}
              disabled={csvFiles.length === 0 && !csvMode}
            >
              {csvMode ? 'Deactivate CSV mode' : 'Activate CSV mode'}
            </Button>
          </div>
        </div>
      )}
      
      {/* Website URLs dropdown - update position to match new layout */}
      {showWebsiteDropdown && (
        <div
          ref={websiteDropdownRef}
          className={`absolute ${isFullscreen ? 'bottom-28' : 'bottom-24'} left-1/2 transform -translate-x-1/2 bg-background border border-border rounded-md shadow-lg p-2 z-50 w-72`}
        >
          <div className="text-sm font-medium mb-2">Available Websites</div>
          {availableWebsiteUrls.length === 0 ? (
            <div className="text-xs text-muted-foreground italic">No websites available. Add a website to search.</div>
          ) : (
            <div className="max-h-40 overflow-y-auto">
              {availableWebsiteUrls.map((url, index) => (
                <div
                  key={index}
                  className={`text-sm px-2 py-1 rounded cursor-pointer hover:bg-accent flex justify-between items-center ${activeWebsiteUrl === url ? 'bg-accent' : ''}`}
                >
                  <span 
                    className="truncate flex-1"
                    title={url}
                    onClick={() => {
                      handleSelectWebsite(url);
                      setShowWebsiteDropdown(false);
                    }}
                  >
                    {(() => {
                      try {
                        return new URL(url).hostname;
                      } catch {
                        return url;
                      }
                    })()}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs bg-primary/20 text-primary px-1 rounded">
                      Embedded
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeWebsiteUrl(url);
                      }}
                      title="Remove website"
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-2 pt-1 border-t flex flex-col gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs"
              onClick={() => {
                setTempWebsiteUrl("");
                setShowWebsiteModal(true);
                setShowWebsiteDropdown(false);
              }}
            >
              Add new website
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs" 
              onClick={toggleWebsiteMode}
            >
              {websiteMode ? 'Deactivate Website mode' : 'Activate Website mode'}
            </Button>
          </div>
        </div>
      )}
      
      {/* Website input modal - update position to match new layout */}
      {showWebsiteModal && (
        <div
          ref={websiteModalRef}
          className={`absolute ${isFullscreen ? 'bottom-28' : 'bottom-24'} left-1/2 transform -translate-x-1/2 bg-background border border-border rounded-md shadow-lg p-2 z-50 w-72`}
        >
          <div className="text-sm font-medium mb-2">Search from Website</div>
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Enter the website URL:</div>
            <input 
              type="url" 
              className="w-full text-sm px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="https://example.com"
              value={tempWebsiteUrl}
              onChange={(e) => setTempWebsiteUrl(e.target.value)}
            />
            <div className="text-xs text-muted-foreground">
              Note: First request may take longer as embeddings are created.
              {availableWebsiteUrls.length > 0 && (
                <div className="mt-1 text-xs text-primary-foreground bg-primary/20 p-1 rounded">
                  You already have {availableWebsiteUrls.length} website{availableWebsiteUrls.length !== 1 ? 's' : ''} with embeddings ready to use.
                </div>
              )}
            </div>
          </div>
          <div className="mt-2 pt-1 border-t flex gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-1/2 text-xs" 
              onClick={() => setShowWebsiteModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="w-1/2 text-xs" 
              onClick={validateAndAddWebsite}
            >
              Add & Activate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}; 