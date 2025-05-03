import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Paperclip, Send, RefreshCw, Database, Table2, Loader2, Globe, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  inputRef: React.RefObject<HTMLInputElement>;
  isFullscreen?: boolean;
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
  availableCSVFiles,
  availableWebsiteUrls,
  handleSelectCsvFile,
  handleSelectWebsite,
  addWebsiteUrlToAvailable,
  inputRef,
  isFullscreen = false
}) => {
  const [tempWebsiteUrl, setTempWebsiteUrl] = useState(activeWebsiteUrl || "");
  const [showWebsiteDropdown, setShowWebsiteDropdown] = useState(false);
  const websiteDropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
            <Paperclip className="h-4 w-4 mr-1" />
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
            onClick={() => {
              setShowCsvDropdown(prev => !prev);
              setShowWebsiteDropdown(false);
            }}
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
            onClick={onSendMessage}
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
          className="absolute bottom-24 left-16 bg-background border border-border rounded-md shadow-lg p-2 z-50 w-48"
        >
          <div className="text-sm font-medium mb-2">Available CSV Files</div>
          {availableCSVFiles.length === 0 ? (
            <div className="text-xs text-muted-foreground italic">No CSV files available. Upload a CSV file first.</div>
          ) : (
            <div className="max-h-40 overflow-y-auto">
              {availableCSVFiles.map((file, index) => (
                <div
                  key={index}
                  className={`text-sm px-2 py-1 rounded cursor-pointer hover:bg-accent ${activeCSVFile === file ? 'bg-accent' : ''}`}
                  onClick={() => {
                    handleSelectCsvFile(file);
                    setShowCsvDropdown(false);
                  }}
                >
                  {file}
                </div>
              ))}
            </div>
          )}
          <div className="mt-2 pt-1 border-t">
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={toggleCsvMode}>
              {csvMode ? 'Deactivate CSV mode' : 'Activate CSV mode'}
            </Button>
          </div>
        </div>
      )}
      
      {/* Website URLs dropdown - update position to match new layout */}
      {showWebsiteDropdown && (
        <div
          ref={websiteDropdownRef}
          className="absolute bottom-24 left-16 bg-background border border-border rounded-md shadow-lg p-2 z-50 w-72"
        >
          <div className="text-sm font-medium mb-2">Available Websites</div>
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
              </div>
            ))}
          </div>
          <div className="mt-2 pt-1 border-t flex flex-col gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs"
              onClick={() => {
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
          className="absolute bottom-24 left-16 bg-background border border-border rounded-md shadow-lg p-2 z-50 w-72"
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
            <div className="text-xs text-muted-foreground">Note: First request may take longer as embeddings are created.</div>
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