import React from 'react';
import { X, Minus, Maximize2, Bot, Database, Table2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  isMaximized: boolean;
  toggleMaximize: () => void;
  closeChat: () => void;
  useKnowledgeBase: boolean;
  csvMode: boolean;
  websiteMode: boolean;
  activeCSVFile: string | null;
  activeWebsiteUrl: string | null;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  isMaximized, 
  toggleMaximize, 
  closeChat,
  useKnowledgeBase,
  csvMode,
  websiteMode,
  activeCSVFile,
  activeWebsiteUrl
}) => {
  // Determine the active mode and its icon
  const renderModeIcon = () => {
    if (useKnowledgeBase) {
      return <Database className="h-4 w-4 text-primary" />;
    } else if (csvMode) {
      return <Table2 className="h-4 w-4 text-primary" />;
    } else if (websiteMode) {
      return <Globe className="h-4 w-4 text-primary" />;
    } else {
      return <Bot className="h-4 w-4 text-primary" />;
    }
  };

  // Generate subtitle text based on the active mode
  const getSubtitle = () => {
    if (useKnowledgeBase) {
      return "Knowledge Base Active";
    } else if (csvMode && activeCSVFile) {
      return `CSV: ${activeCSVFile}`;
    } else if (websiteMode && activeWebsiteUrl) {
      try {
        const url = new URL(activeWebsiteUrl);
        return url.hostname;
      } catch (e) {
        return "Website Search Active";
      }
    }
    return null;
  };

  const subtitle = getSubtitle();

  return (
    <CardHeader className="flex flex-row items-center justify-between p-3 border-b bg-card flex-shrink-0">
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-primary/10 items-center justify-center">
          {renderModeIcon()}
        </span>
        <div className="overflow-hidden">
          <h3 className="font-medium text-base">AI Assistant</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMaximize}
          className="h-7 w-7 text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label={isMaximized ? "Restore chat size" : "Maximize chat"}
          type="button"
        >
          {isMaximized ? <Minus className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={closeChat}
          className="h-7 w-7 text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Close chat"
          type="button"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  );
}; 