import React, { useState } from 'react';
import { MessageSquare, X, FileText, Table, Globe, Table2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { FormattedMarkdown } from './FormattedMarkdown';
import { StreamingText } from './StreamingText';
import { ChatMessageType } from './types';

interface ChatMessageProps {
  message: ChatMessageType;
  isLast?: boolean;
  onSuggestedQuestionClick?: (question: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isLast = false,
  onSuggestedQuestionClick 
}) => {
  const isUser = message.type === 'user';
  const [showSuggestedQuestions, setShowSuggestedQuestions] = useState(true);
  
  // Check if this is a CSV-related message
  const isCsvResponse = message.fileInfo?.fileType === 'CSV' || message.isCsvResponse;
  // Check if this is a website-related message
  const isWebsiteResponse = message.isWebsiteResponse;
  
  // Split multiple visualizations if they exist
  const visualizations = message.visualization 
    ? message.visualization.split("||VISUALIZATION_SEPARATOR||") 
    : [];

  // Handle clicking a suggested question
  const handleSuggestedQuestionClick = (question: string) => {
    if (onSuggestedQuestionClick) {
      onSuggestedQuestionClick(question);
    } else {
      // Fallback to the event dispatch method
      window.dispatchEvent(new CustomEvent('suggested-question-click', { 
        detail: { question }
      }));
    }
  };
    
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start', 'mb-4')}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'rounded-lg px-4 py-3 text-sm shadow-sm max-w-[85%]',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-card border border-border text-card-foreground rounded-bl-none'
        )}
      >
        <div className="space-y-2">
          {/* File upload info */}
          {message.fileInfo && (
            <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded mb-3">
              <Table className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">{message.fileInfo.filename}</p>
                {message.fileInfo.fileType === 'CSV' && message.fileInfo.rows !== undefined && message.fileInfo.columns !== undefined ? (
                  <p className="text-xs text-muted-foreground">{message.fileInfo.rows} rows · {message.fileInfo.columns.length} columns</p>
                ) : (
                  <p className="text-xs text-muted-foreground">{message.fileInfo.fileType} document</p>
                )}
              </div>
            </div>
          )}
          
          {/* Text content with streaming effect for bot messages */}
          {isUser ? (
            <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
          ) : message.loadingIndicator ? (
            <div className="bot-response relative flex items-center gap-2 h-6">
              <div className="text-sm text-muted-foreground">Analyzing request</div>
              <div className="flex items-center space-x-1">
                <div className="animate-pulse bg-primary h-1.5 w-1.5 rounded-full"></div>
                <div className="animate-pulse bg-primary h-1.5 w-1.5 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                <div className="animate-pulse bg-primary h-1.5 w-1.5 rounded-full" style={{ animationDelay: '0.4s' }}></div>
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

          {/* Source document info for bot messages */}
          {!isUser && !message.loadingIndicator && !message.isStreaming && (
            <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded mt-3">
              {!message.sourceDocument || message.sourceDocument === "N/A" ? (
                <>
                  {isCsvResponse ? (
                    <>
                      <Table2 className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">CSV search</p>
                      </div>
                    </>
                  ) : isWebsiteResponse && message.sourceUrl ? (
                    <>
                      <Globe className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Website: {(() => {
                            try {
                              const url = new URL(message.sourceUrl);
                              return url.hostname;
                            } catch {
                              return message.sourceUrl;
                            }
                          })()}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">web search</p>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Source: {message.sourceDocument}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Suggested questions */}
          {!isUser && !message.loadingIndicator && !message.isStreaming && message.suggestedQuestions && message.suggestedQuestions.length > 0 && showSuggestedQuestions && (
            <div className="mt-4 pt-3 border-t border-border">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-medium text-muted-foreground">Suggested questions</p>
                <button 
                  onClick={() => setShowSuggestedQuestions(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {message.suggestedQuestions
                  .flatMap(question => {
                    // Check if the question contains commas, which might indicate multiple questions
                    if (question.includes(',')) {
                      // Split by comma and trim whitespace from each question
                      return question.split(',').map(q => q.trim()).filter(q => q.length > 0);
                    }
                    // Return as a single item array if no commas
                    return [question];
                  })
                  .map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestionClick(question)}
                      className="text-left text-xs py-1.5 px-2.5 rounded bg-secondary/50 hover:bg-secondary text-foreground transition-colors"
                    >
                      {question}
                    </button>
                  ))}
              </div>
            </div>
          )}
          
          {/* Visualizations if available */}
          {!isUser && visualizations.length > 0 && (
            <div className="mt-4 space-y-3">
              {visualizations.map((visUrl, index) => (
                <div key={index} className="flex justify-center">
                  <img 
                    src={visUrl} 
                    alt={`Visualization ${index + 1}`}
                    className="max-w-full rounded border border-border"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}; 