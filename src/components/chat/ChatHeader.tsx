import React from 'react';
import { X, Minus, Maximize2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardHeader } from '@/components/ui/card';

interface ChatHeaderProps {
  toggleChat: () => void;
  toggleMaximize: () => void;
  isMaximized: boolean;
  isMobile: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  toggleChat, 
  toggleMaximize, 
  isMaximized, 
  isMobile 
}) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between p-3 border-b bg-card flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-primary/10 items-center justify-center">
          <Bot className="h-4 w-4 text-primary"/>
        </span>
        <h3 className="font-medium text-base">AI Assistant</h3>
      </div>
      <div className="flex items-center gap-1">
        {!isMobile && (
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
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleChat}
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