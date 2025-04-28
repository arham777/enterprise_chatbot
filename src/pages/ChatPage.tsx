import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  BarChart3, 
  Folder, 
  Upload, 
  Brain, 
  MessageSquare, 
  Settings, 
  ChevronLeft,
  Search,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { gradientClasses } from '@/lib/gradient-theme';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PremiumChatInterface from '@/components/PremiumChatInterface';

const ChatPage = () => {
  const [selectedTab, setSelectedTab] = useState("chat");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Minimal top navbar */}
      <div className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 shadow-sm fixed top-0 w-full z-10">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden" 
            onClick={toggleSidebar}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </Button>
          
          <a href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full blue-gradient flex items-center justify-center">
              <img 
                src="/lovable-uploads/e79b349f-9d4e-4ddd-bc6e-dfc271683c93.png" 
                alt="CyberGen" 
                className="h-6 w-auto"
              />
            </div>
            <span className={`font-bold text-xl hidden sm:block ${gradientClasses.text}`}>AURA Premium</span>
          </a>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative max-w-md w-full hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search conversations..."
              className="pl-10 pr-4 py-2 rounded-full w-full border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              aria-label="Search conversations"
            />
          </div>
          
          <div className="h-9 w-9 rounded-full bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium">
            U
          </div>
        </div>
      </div>
      
      <main className="flex-1 pt-16 flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 transform pt-16 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 z-10 
        ${isSidebarCollapsed ? "-translate-x-full" : "translate-x-0"} 
        ${isSidebarCollapsed ? "lg:w-20" : "lg:w-64"}`}>
          <Card className="h-full rounded-none lg:rounded-r-xl shadow-lg border-t-0 border-l-0 border-gray-200 bg-white">
            <div className={`p-4 border-b border-gray-200 ${isSidebarCollapsed ? "lg:p-3" : ""}`}>
              <div className="flex items-center gap-2 justify-between">
                {!isSidebarCollapsed && (
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center">
                      <img 
                        src="/lovable-uploads/e79b349f-9d4e-4ddd-bc6e-dfc271683c93.png" 
                        alt="CyberGen" 
                        className="h-5 w-auto"
                      />
                    </div>
                    <span className="font-bold text-lg">AURA</span>
                  </div>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hidden lg:flex h-8 w-8"
                  onClick={toggleSidebar}
                  aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className={`p-2 ${isSidebarCollapsed ? "lg:p-3" : ""} space-y-1`}>
              <Button 
                variant={selectedTab === "chat" ? "gradient" : "ghost"} 
                className={`w-full justify-${isSidebarCollapsed ? "center" : "start"} text-left`}
                onClick={() => setSelectedTab("chat")}
                aria-label="Chat tab"
              >
                <MessageSquare className={`${isSidebarCollapsed ? "" : "mr-2"} h-5 w-5`} />
                {!isSidebarCollapsed && <span>Chat</span>}
              </Button>
              
              <Button 
                variant={selectedTab === "documents" ? "gradient" : "ghost"} 
                className={`w-full justify-${isSidebarCollapsed ? "center" : "start"} text-left`}
                onClick={() => setSelectedTab("documents")}
                aria-label="Documents tab"
              >
                <FileText className={`${isSidebarCollapsed ? "" : "mr-2"} h-5 w-5`} />
                {!isSidebarCollapsed && <span>Documents</span>}
              </Button>
              
              <Button 
                variant={selectedTab === "analytics" ? "gradient" : "ghost"} 
                className={`w-full justify-${isSidebarCollapsed ? "center" : "start"} text-left`}
                onClick={() => setSelectedTab("analytics")}
                aria-label="Analytics tab"
              >
                <BarChart3 className={`${isSidebarCollapsed ? "" : "mr-2"} h-5 w-5`} />
                {!isSidebarCollapsed && <span>Analytics</span>}
              </Button>
              
              <Button 
                variant={selectedTab === "knowledge" ? "gradient" : "ghost"} 
                className={`w-full justify-${isSidebarCollapsed ? "center" : "start"} text-left`}
                onClick={() => setSelectedTab("knowledge")}
                aria-label="Knowledge Base tab"
              >
                <Brain className={`${isSidebarCollapsed ? "" : "mr-2"} h-5 w-5`} />
                {!isSidebarCollapsed && <span>Knowledge</span>}
              </Button>
              
              <Button 
                variant={selectedTab === "settings" ? "gradient" : "ghost"} 
                className={`w-full justify-${isSidebarCollapsed ? "center" : "start"} text-left`}
                onClick={() => setSelectedTab("settings")}
                aria-label="Settings tab"
              >
                <Settings className={`${isSidebarCollapsed ? "" : "mr-2"} h-5 w-5`} />
                {!isSidebarCollapsed && <span>Settings</span>}
              </Button>
            </div>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className={`flex-1 p-4 transition-all duration-300 ${isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"}`}>
          <Card className="h-[calc(100vh-5.5rem)] shadow-lg border border-gray-200 bg-white overflow-hidden">
            <CardContent className="p-0 h-full">
              {selectedTab === "chat" && <PremiumChatInterface />}
              
              {selectedTab === "documents" && (
                <div className="p-6 text-center h-full flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                    <FileText className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Document Intelligence</h3>
                  <p className="text-gray-500 mb-6 max-w-md">
                    Upload documents to analyze, extract data, and chat with your content
                  </p>
                  <Button className="blue-gradient-button">
                    <Upload className="mr-2 h-4 w-4" /> Upload Documents
                  </Button>
                </div>
              )}
              
              {selectedTab === "analytics" && (
                <div className="p-6 text-center h-full flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                    <BarChart3 className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Data Analytics</h3>
                  <p className="text-gray-500 mb-6 max-w-md">
                    Import data files for AI-powered analysis and visualization
                  </p>
                  <Button className="blue-gradient-button">
                    <Upload className="mr-2 h-4 w-4" /> Import Data
                  </Button>
                </div>
              )}
              
              {selectedTab === "knowledge" && (
                <div className="p-6 text-center h-full flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                    <Folder className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Knowledge Base</h3>
                  <p className="text-gray-500 mb-6 max-w-md">
                    Access your organization's knowledge base and documents
                  </p>
                  <Button className="blue-gradient-button">
                    <Folder className="mr-2 h-4 w-4" /> Browse Knowledge Base
                  </Button>
                </div>
              )}
              
              {selectedTab === "settings" && (
                <div className="p-6 text-center h-full flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                    <Settings className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Settings</h3>
                  <p className="text-gray-500 mb-6 max-w-md">
                    Configure your AI assistant and customize preferences
                  </p>
                  <Button className="blue-gradient-button">
                    <Settings className="mr-2 h-4 w-4" /> Manage Settings
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
