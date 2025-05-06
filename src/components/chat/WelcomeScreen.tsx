import React from 'react';
import { Bot, FileText, Database, Table, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { WelcomeCard } from './WelcomeCard';

interface WelcomeScreenProps {
  isMobile: boolean;
  triggerFileUpload: () => void;
  toggleKnowledgeBase: () => Promise<void>;
  setChatHistory: React.Dispatch<React.SetStateAction<any[]>>;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  isMobile,
  triggerFileUpload,
  toggleKnowledgeBase,
  setChatHistory
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      className="flex flex-col items-center justify-center text-center h-full px-4"
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Bot className="h-6 w-6 text-primary" />
      </div>
      <h2 className="mb-2 text-xl font-medium">How can I help?</h2>
      <p className="mb-6 max-w-md text-sm text-muted-foreground">
        Ask me anything, upload documents for analysis, or connect your data.
      </p>
      <div className={`grid w-full max-w-md gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
        <WelcomeCard 
          icon={FileText} 
          title="PDF Documents" 
          description="Upload & analyze documents." 
          onClick={triggerFileUpload}
        />
        
        <WelcomeCard 
          icon={Database} 
          title="Knowledge Base" 
          description="Chat with your files."
          onClick={async () => {
            await toggleKnowledgeBase();
            setChatHistory(prev => [...prev, { 
              type: 'bot', 
              text: 'Knowledge Base has been activated. You can now ask questions about your uploaded documents. If you haven\'t uploaded any documents yet, you can do so using the paper clip icon in the chat input area.',
              suggestedQuestions: []
            }]);
          }} 
        />
        
        <WelcomeCard 
          icon={Table} 
          title="CSV Data" 
          description="Upload & query CSV files." 
          onClick={triggerFileUpload}
        />
        
        <WelcomeCard 
          icon={Globe} 
          title="Website Search" 
          description="Chat with your websites." 
        />
      </div>
    </motion.div>
  );
}; 