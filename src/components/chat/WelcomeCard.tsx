import React from 'react';

// Helper component for Welcome Screen Cards
export const WelcomeCard = ({ icon: Icon, title, description, onClick }: { 
  icon: React.ElementType, 
  title: string, 
  description: string,
  onClick?: () => void
}) => (
  <div 
    className="group cursor-pointer rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/30"
    onClick={onClick}
  >
    <div className="mb-3 flex justify-center">
      <Icon className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
    </div>
    <h3 className="mb-1 text-center font-medium">{title}</h3>
    <p className="text-center text-xs text-muted-foreground">{description}</p>
  </div>
); 