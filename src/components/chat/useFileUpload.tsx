import { useState, useRef, ChangeEvent } from 'react';
import { uploadFile, updateKnowledgeBaseState } from './api';
import { ChatMessageType } from './types';

interface UseFileUploadProps {
  userEmail: string | null;
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessageType[]>>;
  setUseKnowledgeBase: React.Dispatch<React.SetStateAction<boolean>>;
  setCsvMode: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveCSVFile: React.Dispatch<React.SetStateAction<string | null>>;
  setActiveFileId: React.Dispatch<React.SetStateAction<string | null>>;
  addCsvFileToAvailable: (fileName: string) => void;
}

export const useFileUpload = ({
  userEmail,
  setChatHistory,
  setUseKnowledgeBase,
  setCsvMode,
  setActiveCSVFile,
  setActiveFileId,
  addCsvFileToAvailable
}: UseFileUploadProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if user is authenticated and email is available
    if (!userEmail) {
      setChatHistory(prev => [...prev, { 
        type: 'bot', 
        text: 'Error: User email information is missing. Please sign out and sign in again.',
        suggestedQuestions: []
      }]);
      return;
    }

    // Check if file is PDF or CSV
    const isPDF = file.name.toLowerCase().endsWith('.pdf');
    const isCSV = file.name.toLowerCase().endsWith('.csv');
    
    if (!isPDF && !isCSV) {
      setChatHistory(prev => [...prev, { 
        type: 'bot', 
        text: 'Only PDF and CSV files are supported for document upload. Please upload a PDF or CSV file.',
        suggestedQuestions: []
      }]);
      return;
    }

    // Validate file size before upload - prevent server errors for large files
    const maxSizeMB = isPDF ? 5 : 2; // 5MB for PDFs, 2MB for CSVs
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    if (file.size > maxSizeBytes) {
      setChatHistory(prev => [...prev, { 
        type: 'bot', 
        text: `File too large. Maximum ${isPDF ? 'PDF' : 'CSV'} size is ${maxSizeMB}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`,
        suggestedQuestions: []
      }]);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Additional PDF validation if it's a PDF file
    if (isPDF) {
      // Simple PDF header check
      const firstBytes = await readFileHeader(file, 5);
      const isPDFFormat = firstBytes === '%PDF-';
      
      if (!isPDFFormat) {
        setChatHistory(prev => [...prev, { 
          type: 'bot', 
          text: `The file ${file.name} doesn't appear to be a valid PDF document. Make sure your file is not corrupted.`,
          suggestedQuestions: []
        }]);
        return;
      }
    }

    // Add file to chat history
    setChatHistory(prev => [...prev, { 
      type: 'user', 
      text: `I'd like to analyze this ${isPDF ? 'PDF document' : 'CSV file'}: ${file.name}`
    }]);
    
    setIsLoading(true);

    // Helper function to read first few bytes of a file
    async function readFileHeader(file: File, bytesToRead: number): Promise<string> {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = (e) => {
          if (e.target?.result) {
            const arr = new Uint8Array(e.target.result as ArrayBuffer);
            let result = '';
            for (let i = 0; i < Math.min(bytesToRead, arr.length); i++) {
              result += String.fromCharCode(arr[i]);
            }
            resolve(result);
          } else {
            resolve('');
          }
        };
        reader.readAsArrayBuffer(file.slice(0, bytesToRead));
      });
    }

    try {
      // Use the uploadFile API function
      const response = await uploadFile(file, userEmail);
      
      if (response.success) {
        // Automatically enable appropriate mode based on file type
        if (isPDF) {
          // For PDF files, enable knowledge base
          setUseKnowledgeBase(true);
          setCsvMode(false);
          localStorage.setItem('useKnowledgeBase', 'true');
          localStorage.setItem('csvMode', 'false');
          
          // Use the dedicated function to properly update knowledge base state on the backend
          try {
            const result = await updateKnowledgeBaseState(true, userEmail);
            if (result) {
              console.log('Knowledge base activated after document upload');
            } else {
              console.error('Failed to activate knowledge base after document upload');
            }
          } catch (kbError) {
            console.error('Error activating knowledge base:', kbError);
          }
        } else if (isCSV) {
          // For CSV files, enable CSV mode and set active file
          setUseKnowledgeBase(false);
          setCsvMode(true);
          setActiveCSVFile(file.name);
          localStorage.setItem('useKnowledgeBase', 'false');
          localStorage.setItem('csvMode', 'true');
          localStorage.setItem('activeCSVFile', file.name);
          
          // Add to available CSV files list
          addCsvFileToAvailable(file.name);
        }
        
        // Create a friendly success message with appropriate mode activation notification
        let successMessage = `${isPDF ? 'PDF document' : 'CSV file'} **${file.name}** has been uploaded successfully.`;
        
        if (isPDF) {
          successMessage += '\n\nThe knowledge base has been automatically activated. You can now ask questions about your document content.';
        } else if (isCSV) {
          successMessage += '\n\nCSV mode has been automatically activated. You can now ask questions about this CSV file.';
        }
        
        // Add success message to chat
        setChatHistory(prev => [...prev, { 
          type: 'bot',
          text: successMessage,
          fileInfo: {
            filename: file.name,
            fileType: isPDF ? 'PDF' : 'CSV',
          },
          sourceDocument: response.data?.source_document,
          suggestedQuestions: []
        }]);
        
        // Set active file ID for CSV files
        if (isCSV) {
          setActiveFileId(file.name);
        } else {
          setActiveFileId(null);
        }
      } else {
        // Handle upload failure
        const errorDetail = response.error || 'Unknown error occurred during file upload';
        setChatHistory(prev => [...prev, { 
          type: 'bot', 
          text: `## Error\n\nI encountered an error while processing your file.\n\n**Details:** ${errorDetail}`,
          suggestedQuestions: []
        }]);
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Unexpected error in file upload:', error);
      setChatHistory(prev => [...prev, { 
        type: 'bot', 
        text: `## Error\n\nAn unexpected error occurred while uploading your file.\n\n**Details:** ${error instanceof Error ? error.message : String(error)}`,
        suggestedQuestions: []
      }]);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';  // Reset the file input
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return {
    fileInputRef,
    isLoading,
    handleFileUpload,
    triggerFileUpload
  };
}; 