import React, { useState, useRef, KeyboardEvent } from 'react';
import { Paperclip, Send, RefreshCw, Database, Table2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: () => void;
  onReset: () => void;
  triggerFileUpload: () => void;
  toggleKnowledgeBase: () => Promise<void>;
  toggleCsvMode: () => Promise<void>;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  useKnowledgeBase: boolean;
  csvMode: boolean;
  activeCSVFile: string | null;
  chatHistoryLength: number;
  showCsvDropdown: boolean;
  setShowCsvDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  csvDropdownRef: React.RefObject<HTMLDivElement>;
  availableCSVFiles: string[];
  handleSelectCsvFile: (fileName: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onReset,
  triggerFileUpload,
  toggleKnowledgeBase,
  toggleCsvMode,
  message,
  setMessage,
  isLoading,
  useKnowledgeBase,
  csvMode,
  activeCSVFile,
  chatHistoryLength,
  showCsvDropdown,
  setShowCsvDropdown,
  csvDropdownRef,
  availableCSVFiles,
  handleSelectCsvFile,
  inputRef
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-muted-foreground hover:text-primary flex-shrink-0" 
        aria-label="Upload document or data file"
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
          "h-8 w-8 flex-shrink-0 hover:text-primary relative",
          useKnowledgeBase ? "text-primary bg-primary/20 ring-1 ring-primary" : "text-muted-foreground"
        )}
        aria-label={useKnowledgeBase ? "Deactivate knowledge base" : "Activate knowledge base"}
        title={useKnowledgeBase ? "Knowledge base active" : "Activate knowledge base"}
        disabled={isLoading || csvMode}
      >
        <Database className="h-4 w-4" />
      </Button>
      
      {/* CSV Button with Dropdown */}
      <div className="flex flex-col items-center relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            // Just toggle the dropdown visibility
            setShowCsvDropdown(prev => !prev);
          }}
          className={cn(
            "h-8 w-8 flex-shrink-0 hover:text-primary",
            csvMode ? "text-primary bg-primary/20 ring-1 ring-primary" : "text-muted-foreground"
          )}
          aria-label={csvMode ? "CSV files menu" : "CSV files menu"}
          title={csvMode ? "CSV mode active - Click to view files" : "View CSV files"}
          disabled={isLoading || useKnowledgeBase}
        >
          <Table2 className="h-4 w-4" />
        </Button>
        
        {/* Show active file name */}
        {csvMode && activeCSVFile && (
          <div className="text-[7px] text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[40px]" title={activeCSVFile}>
            {activeCSVFile.split('.')[0]}
          </div>
        )}
        
        {/* CSV files dropdown */}
        {showCsvDropdown && (
          <div 
            ref={csvDropdownRef}
            className="absolute bottom-full left-0 mb-2 w-48 bg-card shadow-lg rounded-md border border-border p-1 z-10"
            style={{ overscrollBehavior: 'contain' }}
          >
            <div className="p-2 mb-1 text-xs font-medium text-muted-foreground border-b border-border flex justify-between items-center">
              <span>Select CSV File</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="text-muted-foreground hover:text-foreground"
                title="Refresh CSV file list"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            </div>
            
            {/* CSV Mode Controls */}
            {csvMode && (
              <div className="px-2 py-1.5 text-xs border-b border-border">
                <button 
                  onClick={() => {
                    toggleCsvMode(); // Will deactivate CSV mode
                    setShowCsvDropdown(false);
                  }}
                  className="w-full text-left text-xs py-1.5 px-2.5 rounded bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                >
                  Deactivate CSV Mode
                </button>
              </div>
            )}
            
            <div className="max-h-48 overflow-y-auto py-1 overflow-x-hidden" style={{ scrollbarWidth: 'thin' }}>
              {availableCSVFiles.length > 0 ? (
                availableCSVFiles.map((file, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectCsvFile(file);
                      setShowCsvDropdown(false);
                    }}
                    className={cn(
                      "w-full text-left text-xs py-1.5 px-2.5 rounded hover:bg-secondary text-foreground transition-colors",
                      activeCSVFile === file && "bg-secondary font-medium"
                    )}
                  >
                    {file}
                  </button>
                ))
              ) : (
                <div className="py-3 px-2 text-xs text-muted-foreground text-center">
                  No CSV files available.
                  <br />
                  <span className="text-primary">Upload a CSV file</span> to get started.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="relative flex-grow">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={csvMode ? "Ask about your CSV data..." : "Ask anything..."}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
          disabled={isLoading}
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onReset}
        className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
        aria-label="Reset chat"
        title="Reset chat"
        disabled={chatHistoryLength === 0 && message === '' || isLoading}
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        onClick={onSendMessage}
        className="h-8 w-8 bg-primary text-primary-foreground flex-shrink-0 hover:bg-primary/90 rounded-full"
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
  );
}; 