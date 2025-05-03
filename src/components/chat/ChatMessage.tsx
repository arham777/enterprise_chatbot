import React, { useState } from 'react';
import { MessageSquare, X, FileText, Table, Globe, Table2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';
import { FormattedMarkdown } from './FormattedMarkdown';
import { StreamingText } from './StreamingText';
import { ChatMessageType } from './types';

export const ChatMessage = ({ message }: { message: ChatMessageType }) => {
  const isUser = message.type === 'user';
  const [showSuggestedQuestions, setShowSuggestedQuestions] = useState(true);
  // Check if this is a CSV-related message
  const isCsvResponse = message.fileInfo?.fileType === 'CSV' || message.isCsvResponse;
  
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
          {!isUser && !message.isStreaming && !message.loadingIndicator && (
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
          {!isUser && !message.isStreaming && !message.loadingIndicator && message.suggestedQuestions && Array.isArray(message.suggestedQuestions) && message.suggestedQuestions.length > 0 && showSuggestedQuestions && (
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
          {visualizations.length > 0 && (
            <div className="mt-3 rounded-md overflow-hidden border border-border bg-card p-3">
              <h4 className="text-sm font-medium mb-2">Data Visualization</h4>
              
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
                    <div key={index} className="border border-border rounded-md p-2 visualization-item">
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
          
          {(message.inputCost !== undefined || message.outputCost !== undefined) && (
            <div className="text-right text-xs text-muted-foreground mt-2">
              Cost: ${((Number(message.inputCost) || 0) + (Number(message.outputCost) || 0)).toFixed(4)}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}; 