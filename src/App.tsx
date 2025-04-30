import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import ChatPage from "./pages/ChatPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import UserProfile from "./pages/UserProfile";
import ChatAssistantButton from "./components/ChatAssistantButton";
import { ChatAssistantContext } from "./components/HeroSection";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  const [isOpen, setIsOpenOriginal] = useState(false);
  
  // Create a wrapped version of setIsOpen that logs when it's called
  const setIsOpen = (value: boolean | ((prevState: boolean) => boolean)) => {
    console.log("App - setIsOpen called with:", value);
    setIsOpenOriginal(value);
  };

  // Add debug logs
  useEffect(() => {
    console.log("App - isOpen state changed:", isOpen);
  }, [isOpen]);

  // Force light theme
  useEffect(() => {
    // Remove dark class if present
    document.documentElement.classList.remove('dark');
    // Set theme in localStorage
    localStorage.setItem('theme', 'light');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <ChatAssistantContext.Provider value={{ isOpen, setIsOpen }}>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/chat" element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } />
                <Route path="/auth" element={<AuthPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <ChatAssistantButton />
            </ChatAssistantContext.Provider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
