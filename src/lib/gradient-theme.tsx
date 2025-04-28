import React from 'react';

// SVG Gradient Definition Component - can be used across the application
export const BlueGradientDefs = () => (
  <svg width="0" height="0" className="hidden">
    <defs>
      <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#1e40af" />
      </linearGradient>
      <linearGradient id="blueGradientHover" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0ea5e9" />
        <stop offset="100%" stopColor="#1e3a8a" />
      </linearGradient>
    </defs>
  </svg>
);

// Helper function to apply gradient to SVG paths
export const getGradientStrokeProps = (isHovered = false) => ({
  stroke: isHovered ? 'url(#blueGradientHover)' : 'url(#blueGradient)',
  fill: 'none',
});

// Helper function to apply gradient to SVG fills
export const getGradientFillProps = (isHovered = false) => ({
  fill: isHovered ? 'url(#blueGradientHover)' : 'url(#blueGradient)',
  stroke: 'none',
});

// CSS class strings for common gradient use cases
export const gradientClasses = {
  text: 'text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-600',
  bg: 'bg-gradient-to-b from-blue-400 to-blue-600',
  bgHover: 'hover:bg-gradient-to-b hover:from-blue-500 hover:to-blue-700',
  border: 'border border-transparent bg-gradient-to-b from-blue-400 to-blue-600 bg-clip-border',
  button: 'bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white transform hover:scale-105 transition-all duration-200',
  icon: 'text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-600',
  hoverEffect: 'transform hover:scale-[1.02] transition-all duration-200',
  focus: 'focus:ring-2 focus:ring-blue-400 focus:outline-none',
};

// Gradient context provider if needed
export const GradientThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <BlueGradientDefs />
      {children}
    </>
  );
};

export default GradientThemeProvider; 