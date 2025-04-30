import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, Trash2, RefreshCw, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { useChatAssistant } from './HeroSection';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://103.18.20.205:8070';

const DocumentSidebar = () => {
  const [documents, setDocuments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { setIsOpen: setChatOpen } = useChatAssistant();
  const { userEmail } = useAuth();
  const navigate = useNavigate();

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    
    // Check if user email is available
    if (!userEmail) {
      setIsLoading(false);
      return;
    }
    
    try {
      // Add email parameter to the endpoint
      const endpoint = `${API_URL}/get-all-documents/?email=${encodeURIComponent(userEmail)}`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        mode: 'cors'
      });

      if (!response.ok) {
        // Set appropriate error message based on status code
        if (response.status >= 500) {
          // For 500 errors, just set documents to empty array without setting an error
          // This will show the "No document uploaded yet" message instead of an error
          console.log(`Server error (${response.status}): The server is currently unavailable, showing empty document list.`);
        } else if (response.status === 404) {
          setError("API endpoint not found. Please try again later.");
        } else if (response.status === 401 || response.status === 403) {
          setError("Authentication error. Please sign in again.");
        } else {
          setError(`Error (${response.status}): Failed to load documents.`);
        }
        setDocuments([]);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      // Set network error message
      setError("Network error: Could not connect to the server. Please check your internet connection.");
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen]);

  const deleteDocument = async (fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }
    
    // Check if user email is available
    if (!userEmail) {
      alert('User email information is missing. Please sign out and sign in again.');
      return;
    }

    try {
      // Add email parameter to the endpoint
      const endpoint = `${API_URL}/delete-file/?file_name=${encodeURIComponent(fileName)}&email=${encodeURIComponent(userEmail)}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete document: ${response.status}`);
      }

      // Refresh the document list
      fetchDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
      alert(`Error deleting document: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchDocuments();
    }
  };

  const openChatWithDocument = (fileName: string) => {
    setChatOpen(true);
    
    // Post a message to the chat window about the selected document
    // We're using window.postMessage so components can communicate
    window.postMessage({
      type: 'SELECT_DOCUMENT',
      payload: {
        documentName: fileName
      }
    }, window.location.origin);
    
    // Close the sidebar after selecting a document
    setIsOpen(false);
  };

  return (
    <>
      {/* Document Panel Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed left-6 bottom-6 z-40"
      >
        <Button
          onClick={toggleSidebar}
          className="h-14 px-4 rounded-full blue-gradient-button shadow-lg flex items-center justify-center gap-2"
          aria-label="Knowledge Base"
        >
          <FileText className="h-5 w-5" />
          <span className="font-medium text-sm">Knowledge Base</span>
        </Button>
      </motion.div>

      {/* Document Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-500" />
                Documents
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {!userEmail ? (
                <div className="text-center text-gray-500 py-8">
                  <LogIn className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Sign in to access the documents history</p>
                </div>
              ) : isLoading ? (
                <div className="flex justify-center items-center h-20">
                  <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center text-red-500 py-8">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30 text-red-500" />
                  <p className="font-medium">Error Loading Documents</p>
                  <p className="text-sm mt-2">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchDocuments}
                    className="mt-4 text-blue-500 border-blue-200 hover:bg-blue-50"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              ) : documents.filter(doc => doc !== "chat_history.csv").length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No document uploaded yet</p>
                  <p className="text-sm mt-2">Upload documents using the chat assistant</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.filter(doc => doc !== "chat_history.csv").map((doc) => (
                    <div 
                      key={doc}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors relative group"
                    >
                      <div className="flex items-start">
                        <FileText className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <button 
                            onClick={() => openChatWithDocument(doc)}
                            className="text-left font-medium text-foreground hover:text-blue-600 w-full truncate"
                          >
                            {doc}
                          </button>
                          <p className="text-xs text-gray-500 mt-1">
                            PDF Document
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteDocument(doc)}
                          aria-label={`Delete ${doc}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t">
              {userEmail ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={async () => {
                      if (!confirm("Are you sure you want to delete ALL documents? This action cannot be undone.")) {
                        return;
                      }
                      
                      // Check if user email is available
                      if (!userEmail) {
                        alert('User email information is missing. Please sign out and sign in again.');
                        return;
                      }
                      
                      try {
                        const response = await fetch(`${API_URL}/delete-all-files/?email=${encodeURIComponent(userEmail)}`, {
                          method: 'POST',
                          headers: {
                            'Accept': 'application/json',
                            'Origin': window.location.origin,
                          },
                          mode: 'cors'
                        });
                        
                        if (!response.ok) {
                          const errorText = await response.text();
                          console.error('Server error:', errorText);
                          throw new Error(`Failed to delete all documents: ${response.status} - ${errorText || 'Unknown error'}`);
                        }
                        
                        // Refresh the document list
                        fetchDocuments();
                        alert('All documents have been deleted successfully.');
                      } catch (err) {
                        console.error('Error deleting all documents:', err);
                        alert(`Error deleting all documents: ${err instanceof Error ? err.message : 'Unknown error'}`);
                      }
                    }}
                    className={`w-full mb-2 ${documents.filter(doc => doc !== "chat_history.csv").length === 0 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200'}`}
                    disabled={documents.filter(doc => doc !== "chat_history.csv").length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Files
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setChatOpen(true);
                      setIsOpen(false);
                    }}
                    className="w-full"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Upload New Document
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/auth'); // Navigate to sign-in page
                  }}
                  className="w-full"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign in
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay when sidebar is open */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/20 z-40"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default DocumentSidebar; 