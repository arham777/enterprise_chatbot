// Define API base URL and CORS proxy functionality
const ORIGINAL_API_URL = import.meta.env.VITE_API_URL || 'http://103.18.20.205:8070';

// Helper function to create a CORS proxy URL if needed
export const createProxiedUrl = (url: string): string => {
  // Simplified to always return direct URL regardless of environment
  // If direct connection works, no proxy is needed
  return url;
};

// Determine the API URL to use (with proxy if needed)
export const API_BASE_URL = createProxiedUrl(ORIGINAL_API_URL);

// Function to fetch chat history for the user
export const fetchChatHistory = async (email: string) => {
  // Return a promise that resolves to either a chat history array or null if error
  return new Promise<{ success: boolean; data?: any[] }>((resolve) => {
    try {
      // We're going to use a simple approach - any error is treated as "chat history is empty"
      const historyEndpoint = `${API_BASE_URL}/chat-history/${encodeURIComponent(email)}`;
      
      // Use XMLHttpRequest to access both status and response text even in error cases
      const xhr = new XMLHttpRequest();
      xhr.open('GET', historyEndpoint, true);
      xhr.setRequestHeader('Accept', 'text/csv, application/json');
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) { // Request is done
          if (xhr.status === 200) {
            // Success case - valid data returned
            try {
              const responseData = xhr.responseText;
              if (!responseData || responseData.trim() === '') {
                resolve({ success: false });
                return;
              }
              
              const jsonData = JSON.parse(responseData);
              // Check for valid history structure
              if (!jsonData || !jsonData.history || !Array.isArray(jsonData.history)) {
                resolve({ success: false });
                return;
              }
              
              // Check for empty history array
              if (jsonData.history.length === 0) {
                resolve({ success: false });
                return;
              }
              
              resolve({ success: true, data: jsonData.history });
            } catch (parseError) {
              resolve({ success: false });
            }
          } else {
            // For any error status, just log and return empty chat
            console.log('The chat history is Empty');
            resolve({ success: false });
          }
        }
      };
      
      // Handle network errors
      xhr.onerror = function() {
        console.log('The chat history is Empty');
        resolve({ success: false });
      };
      
      // Set a timeout to handle stalled requests
      setTimeout(() => {
        if (xhr.readyState < 4) {
          xhr.abort();
          console.log('The chat history is Empty - request timed out');
          resolve({ success: false });
        }
      }, 10000); // 10 second timeout
      
      // Send the request
      xhr.send();
    } catch (error) {
      // Catch any other errors we didn't anticipate
      console.log('The chat history is empty - could not process data');
      resolve({ success: false });
    }
  });
};

// Helper function to convert API history format to our ChatMessageType format
export const convertHistoryToChatMessages = (history: any[]) => {
  const chatMessages: any[] = [];
  
  // Process history items in pairs (system+user)
  for (let i = 0; i < history.length; i++) {
    const item = history[i];
    
    if (item.role === 'user') {
      // Add user message
      chatMessages.push({
        type: 'user',
        text: item.content,
      });
      
      // Check if there's a bot response after this user message
      if (i + 1 < history.length && history[i + 1].role === 'assistant') {
        chatMessages.push({
          type: 'bot',
          text: history[i + 1].content,
          // Add any additional properties if available in the data
        });
        i++; // Skip the assistant message we just processed
      }
    }
  }
  
  return chatMessages;
};

// Function to update knowledge base state on the backend
export const updateKnowledgeBaseState = async (activate: boolean, userEmail: string) => {
  // Check if user is authenticated and email is available
  if (!userEmail) {
    console.error('Cannot update knowledge base state: user email is missing');
    return false;
  }
  
  try {
    // Call the knowledge base endpoint
    const knowledgeBaseEndpoint = `${ORIGINAL_API_URL}/set-knowledge-base/`;
    
    console.log(`Setting knowledge base state: activate=${activate}`);
    
    const response = await fetch(knowledgeBaseEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin,
      },
      body: JSON.stringify({
        activate: activate, // Explicit boolean value - true to activate, false to deactivate
        email: userEmail
      }),
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`Failed to ${activate ? 'activate' : 'deactivate'} knowledge base: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Knowledge base ${activate ? 'activated' : 'deactivated'}: `, data);
    return true;
    
  } catch (error) {
    console.error(`Error ${activate ? 'activating' : 'deactivating'} knowledge base:`, error);
    return false;
  }
};

// Function to delete chat history
export const deleteChatHistory = async (userEmail: string) => {
  if (!userEmail) {
    return false;
  }
  
  try {
    const deleteUrl = `${ORIGINAL_API_URL}/delete-file/?file_name=${encodeURIComponent("chat_history.csv")}&email=${encodeURIComponent(userEmail)}`;
    
    const response = await fetch(deleteUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
      mode: 'cors'
    });
    
    if (!response.ok) {
      console.error('Failed to delete chat history file:', response.status);
      return false;
    } else {
      console.log('Chat history file deleted successfully');
      return true;
    }
  } catch (err) {
    console.error('Error deleting chat history file:', err);
    return false;
  }
};

// Function to handle file upload
export const uploadFile = async (file: File, userEmail: string) => {
  if (!userEmail || !file) {
    return {
      success: false,
      error: 'Missing user email or file'
    };
  }

  // Check if file is PDF or CSV
  const isPDF = file.name.toLowerCase().endsWith('.pdf');
  const isCSV = file.name.toLowerCase().endsWith('.csv');
  
  if (!isPDF && !isCSV) {
    return {
      success: false,
      error: 'Only PDF and CSV files are supported for document upload.'
    };
  }

  // Create FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('email', userEmail);

  // For CSV files, add the additional parameters from the API spec
  if (isCSV) {
    formData.append('prompt', `Analyze the CSV file ${file.name}`);
    formData.append('filename', file.name);
  }

  try {
    // Select the appropriate endpoint based on file type
    const uploadEndpoint = isPDF 
      ? `${ORIGINAL_API_URL}/upload-pdf/`
      : `${ORIGINAL_API_URL}/upload-csv/`;
    
    // Try to upload file with improved headers
    const response = await fetch(uploadEndpoint, {
      method: 'POST',
      body: formData,
      mode: 'cors',
      headers: {
        // Don't set Content-Type when using FormData, browser will set it with boundary
        'Accept': 'application/json',
        'Origin': window.location.origin,
      },
      credentials: 'omit'
    });

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 500) {
        throw new Error(`Server error: The ${isPDF ? 'PDF document' : 'CSV file'} might be too complex, ${isPDF ? 'password-protected,' : ''} or in an unsupported format.`);
      } else if (response.status === 413) {
        throw new Error(`File too large: The ${isPDF ? 'PDF document' : 'CSV file'} exceeds the server's size limit.`);
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    }

    // Parse the response
    const text = await response.text();
    let data;
    try {
      // Try to parse as JSON
      data = JSON.parse(text);
    } catch (e) {
      // If not JSON, use text directly
      data = text;
    }

    return {
      success: true,
      data,
      fileType: isPDF ? 'PDF' : 'CSV',
      fileName: file.name
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      fileType: isPDF ? 'PDF' : 'CSV',
      fileName: file.name
    };
  }
};

// Function to send a message and get a response
export const sendMessage = async (message: string, userEmail: string, csvMode: boolean, activeCSVFile: string | null) => {
  if (!message.trim() || !userEmail) {
    return {
      success: false,
      error: 'Missing message or user email'
    };
  }

  try {
    // Determine which endpoint to use based on mode
    let apiEndpoint = '';
    let requestBody;
    let response: Response;

    // Choose endpoint and prepare request body based on active mode
    if (csvMode && activeCSVFile) {
      // Use ask-csv endpoint when in CSV mode and we have an active CSV file
      apiEndpoint = `${ORIGINAL_API_URL}/ask-csv/`;
      
      // Format as form data instead of JSON
      const formData = new FormData();
      formData.append('email', userEmail);
      formData.append('prompt', message);
      formData.append('filename', activeCSVFile);
      
      // Try using FormData instead of JSON
      response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Origin': window.location.origin,
        }
      });
      
      if (!response.ok) {
        // If FormData approach fails, try with JSON
        console.log('FormData approach failed, trying with JSON...');
        requestBody = JSON.stringify({ 
          email: userEmail,
          prompt: message,
          filename: activeCSVFile
        });
        
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': window.location.origin,
          },
          body: requestBody,
          mode: 'cors'
        });
      }
    } else {
      // Use standard endpoint for all other scenarios
      apiEndpoint = `${ORIGINAL_API_URL}/generate-response/?email=${encodeURIComponent(userEmail)}`;
      requestBody = JSON.stringify({ 
        query: message
      });
      
      // For non-CSV mode, proceed with the normal request
      response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        body: requestBody,
        mode: 'cors'
      });
    }

    // Check response status
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', response.status, errorText);
      throw new Error(`API error: ${response.status} - ${errorText || 'No error details'}`);
    }

    // Parse the response
    const data = await response.json();
    
    // Extract the response text from the data object
    let responseText = '';
    let visualization: string | undefined = undefined;
    
    // Handle different response formats from the two endpoints
    if (csvMode && data.text && Array.isArray(data.text)) {
      // For /ask-csv/ endpoint, the response contains a "text" array
      responseText = data.text.join('\n\n');
      
      // Extract base64 images if available
      if (data.images_base64 && Array.isArray(data.images_base64) && data.images_base64.length > 0) {
        // For multiple images, join them with a separator that ChatMessage component can parse
        visualization = data.images_base64.map((base64: string) => {
          // Check if this is already a data URL or needs to be converted
          if (base64.startsWith('data:image/')) {
            return base64;
          } else {
            // Default to PNG if image type is not specified
            return `data:image/png;base64,${base64}`;
          }
        }).join('||VISUALIZATION_SEPARATOR||');
        
        console.log('Extracted visualization data from CSV response');
      }
      
      console.log('Received response from ask-csv endpoint:', data);
    } else {
      // For /generate-response/ endpoint, the response contains a "response" field
      responseText = data.response || 'No response received';
      console.log('Received response from generate-response endpoint:', data);
    }

    return {
      success: true,
      responseText,
      sourceDocument: data.source_document || data.source,
      suggestedQuestions: data.suggested_questions,
      visualization: visualization,
      isCsvResponse: csvMode
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// Function to chat with a website
export const chatWithWebsite = async (email: string, url: string, prompt: string) => {
  if (!email || !url || !prompt) {
    return {
      success: false,
      error: 'Missing required parameters: email, url, or prompt'
    };
  }

  try {
    // Call the chat with website endpoint
    const chatWebsiteEndpoint = `${ORIGINAL_API_URL}/chat-with-website/`;
    
    console.log(`Sending request to chat with website: ${url}`);
    
    // Try multiple approaches with different parameter names
    
    // Approach 1: FormData with email/url/prompt
    try {
      console.log('Trying FormData with email/url/prompt');
      const formData = new FormData();
      formData.append('email', email);
      formData.append('url', url);
      formData.append('prompt', prompt);
      
      const response = await fetch(chatWebsiteEndpoint, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Origin': window.location.origin,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Approach 1 succeeded:', data);
        return {
          success: true,
          responseText: data.response || 'No response received',
          sourceUrl: url,
          suggestedQuestions: data.suggested_questions || []
        };
      } else {
        console.log(`Approach 1 failed (${response.status})`);
      }
    } catch (error) {
      console.error('Approach 1 error:', error);
    }
    
    // Approach 2: FormData with alternate parameter names
    try {
      console.log('Trying FormData with email/website/query');
      const formData = new FormData();
      formData.append('email', email);
      formData.append('website', url);  // Try different parameter name
      formData.append('query', prompt);  // Try different parameter name
      
      const response = await fetch(chatWebsiteEndpoint, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Origin': window.location.origin,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Approach 2 succeeded:', data);
        return {
          success: true,
          responseText: data.response || 'No response received',
          sourceUrl: url,
          suggestedQuestions: data.suggested_questions || []
        };
      } else {
        console.log(`Approach 2 failed (${response.status})`);
      }
    } catch (error) {
      console.error('Approach 2 error:', error);
    }
    
    // Approach 3: JSON with email/url/prompt
    try {
      console.log('Trying JSON with email/url/prompt');
      const response = await fetch(chatWebsiteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        body: JSON.stringify({
          email: email,
          url: url,
          prompt: prompt
        }),
        mode: 'cors'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Approach 3 succeeded:', data);
        return {
          success: true,
          responseText: data.response || 'No response received',
          sourceUrl: url,
          suggestedQuestions: data.suggested_questions || []
        };
      } else {
        console.log(`Approach 3 failed (${response.status})`);
      }
    } catch (error) {
      console.error('Approach 3 error:', error);
    }
    
    // Approach 4: JSON with alternate parameter names
    try {
      console.log('Trying JSON with email/website/query');
      const response = await fetch(chatWebsiteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin,
        },
        body: JSON.stringify({
          email: email,
          website: url,  // Try different parameter name
          query: prompt  // Try different parameter name
        }),
        mode: 'cors'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Approach 4 succeeded:', data);
        return {
          success: true,
          responseText: data.response || 'No response received',
          sourceUrl: url,
          suggestedQuestions: data.suggested_questions || []
        };
      } else {
        console.log(`Approach 4 failed (${response.status})`);
      }
    } catch (error) {
      console.error('Approach 4 error:', error);
    }
    
    // All approaches failed
    throw new Error("All attempts to chat with website failed. The API might be temporarily unavailable or the URL format might be incorrect.");
  } catch (error) {
    console.error('Error in chat with website:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}; 