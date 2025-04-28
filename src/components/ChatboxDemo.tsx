
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Maximize2, X, FileText, BarChart3, Folder, Send, MessageSquare } from 'lucide-react';

const ChatboxDemo = () => {
  return (
    <Card className="chat-container w-full overflow-hidden shadow-xl border border-border">
      <CardHeader className="flex flex-row items-center justify-between bg-card p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cybergen-primary animate-pulse-slow"></div>
          <h3 className="font-medium">AI Assistant</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-80 flex flex-col">
          <div className="flex-1 overflow-auto p-4 space-y-4">
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="mx-auto bg-cybergen-light dark:bg-cybergen-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <img 
                    src="/lovable-uploads/e79b349f-9d4e-4ddd-bc6e-dfc271683c93.png" 
                    alt="Cybergen" 
                    className="h-10 w-auto"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Assistant</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Ask me anything or upload files to analyze. I can help with information, file analysis, and data analytics all in one place.
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border p-4">
            <Tabs defaultValue="document">
              <TabsList className="mb-4 grid grid-cols-3">
                <TabsTrigger value="document" className="text-xs sm:text-sm">
                  <FileText className="h-4 w-4 mr-1" />
                  Document Analysis
                </TabsTrigger>
                <TabsTrigger value="data" className="text-xs sm:text-sm">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Data Analytics
                </TabsTrigger>
                <TabsTrigger value="knowledge" className="text-xs sm:text-sm">
                  <Folder className="h-4 w-4 mr-1" />
                  Knowledge Base
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="document" className="mt-0">
                <div className="flex gap-2">
                  <div className="border border-dashed border-border rounded-md flex-1 p-3 text-center bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      Upload PDF, TXT, or other text documents
                    </p>
                  </div>
                  <Button className="bg-cybergen-primary hover:bg-cybergen-secondary">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="data" className="mt-0">
                <div className="flex gap-2">
                  <div className="border border-dashed border-border rounded-md flex-1 p-3 text-center bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      Upload CSV, Excel or JSON data files
                    </p>
                  </div>
                  <Button className="bg-cybergen-primary hover:bg-cybergen-secondary">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="knowledge" className="mt-0">
                <div className="flex gap-2">
                  <div className="border border-dashed border-border rounded-md flex-1 p-3 text-center bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      Search and chat with your uploaded documents
                    </p>
                  </div>
                  <Button className="bg-cybergen-primary hover:bg-cybergen-secondary">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatboxDemo;
