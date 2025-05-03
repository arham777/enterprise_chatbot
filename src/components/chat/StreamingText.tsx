import React, { useState, useEffect } from 'react';
import { FormattedMarkdown } from './FormattedMarkdown';

// Streaming text component with typing effect
export const StreamingText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Reset if text changes
    if (displayedText === '' && text) {
      setCurrentIndex(0);
      setDisplayedText('');
    }
    
    if (currentIndex < text.length) {
      // Determine character typing speed based on character type
      // Type faster for common characters, slower for punctuation, line breaks
      let delay = 15; // base delay
      
      const currentChar = text[currentIndex];
      if (currentChar === '\n') {
        delay = 300; // pause longer at line breaks
      } else if ('.,:;?!'.includes(currentChar)) {
        delay = 200; // pause at punctuation
      } else if (currentChar === '#' || currentChar === '*') {
        delay = 5; // speed through markdown syntax
      }
      
      // Type faster when a lot of text to show
      if (text.length > 500) {
        delay = Math.max(5, delay / 2);
      }
      
      const timeout = setTimeout(() => {
        // Add the current character to displayed text
        setDisplayedText(prev => prev + currentChar);
        setCurrentIndex(prev => prev + 1);
        
        // If we've reached the end, we're done
        if (currentIndex + 1 >= text.length) {
          // console.log('Streaming complete');
        }
      }, delay + (Math.random() * 10)); // Add small random variation
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, displayedText]);
  
  return <FormattedMarkdown>{displayedText}</FormattedMarkdown>;
}; 