// Extended type for chat messages to support different content types
export type ChatMessageType = {
  type: 'user' | 'bot';
  text: string;
  visualization?: string; // Base64 encoded image or multiple images separated by marker
  fileId?: string; // Reference to uploaded file
  fileInfo?: {
    filename: string;
    fileType: string; // PDF or CSV
    columns?: string[];
    rows?: number;
  };
  isStreaming?: boolean; // Whether the message is currently being streamed
  loadingIndicator?: boolean; // Whether to show loading indicator instead of content
  sourceDocument?: string; // Optional source document information
  sourceUrl?: string; // Optional source URL for website search
  suggestedQuestions?: string[]; // Optional suggested follow-up questions
  inputCost?: number;
  outputCost?: number;
  isCsvResponse?: boolean; // Optional flag to indicate CSV response
  isWebsiteResponse?: boolean; // Optional flag to indicate website response
}; 