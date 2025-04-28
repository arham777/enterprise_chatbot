import React from 'react';
import { Button } from '@/components/ui/button'; // Assuming Button is correctly imported
import { ArrowRight, Sparkles } from 'lucide-react'; // Changed icon for primary CTA

// --- Context Definition (No style changes needed here) ---
export const ChatAssistantContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  isOpen: false,
  setIsOpen: () => {},
});

export const useChatAssistant = () => React.useContext(ChatAssistantContext);

// --- Hero Section Component ---
const HeroSection = () => {
  const { setIsOpen } = useChatAssistant();

  // Open the chat assistant
  const handleStartChatting = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Try the Assistant button clicked");
    console.log("Current context value:", { setIsOpen });
    setIsOpen(true);
    console.log("setIsOpen called with true");
  };

  // Scroll to the Enterprise Section
  const handleLearnMore = (e: React.MouseEvent) => {
    e.preventDefault();
    const enterpriseSection = document.getElementById('enterprise');
    if (enterpriseSection) {
      enterpriseSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Assume gradient-text class is defined globally or in your main CSS:
  // .gradient-text {
  //   background: linear-gradient(to right, hsl(var(--primary)), hsl(var(--secondary))); /* Adjust colors as needed */
  //   -webkit-background-clip: text;
  //   -webkit-text-fill-color: transparent;
  //   background-clip: text;
  //   text-fill-color: transparent;
  // }

  return (
    <section className="relative isolate min-h-screen flex items-center overflow-hidden bg-background"> {/* Use bg-background, isolate for stacking */}
      {/* Subtle Background Elements - Improved for light mode */}
      <div
        className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(theme(colors.muted)_1px,transparent_1px)] [background-size:20px_20px] opacity-30"
        aria-hidden="true"
      />
      <div
        className="absolute -top-40 -left-1/4 w-[1200px] h-[1200px] transform-gpu blur-3xl -z-10"
        aria-hidden="true"
      >
        <div
          className="aspect-[1155/678] w-full bg-gradient-to-tr from-primary/10 via-primary/5 to-secondary/10 opacity-50"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10 py-24 sm:py-32 lg:py-40"> {/* Increased padding */}
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16 lg:gap-24"> {/* Increased gap */}
          {/* Text Content Area */}
          <div className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-8 leading-tight sm:leading-tight lg:leading-tight"> {/* Use foreground color, adjusted margin */}
              Unlock Insights with
              <br className="hidden lg:inline" />{' '} {/* Line break on large screens */}
              <span className="gradient-text text-blue-400">AI-Powered Conversations</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-lg mx-auto lg:mx-0"> {/* Use muted-foreground, adjusted margin and max-width */}
              Engage with our cutting-edge AI assistant. Seamlessly analyze data, generate content, and find solutions through intuitive chat.
            </p>
            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                onClick={handleStartChatting}
                data-testid="chat-assistant-button"
                className="shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-shadow duration-300 relative z-50" // Added z-index
              >
                <Sparkles className="h-5 w-5 mr-2" /> {/* Different Icon */}
                Try the Assistant
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleLearnMore}
                className="group"
              >
                Learn More
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
              </Button>
            </div>
          </div>

          {/* Image/Visual Area - Enhanced for dark mode */}
          <div className="flex justify-center lg:justify-end w-full max-w-xl mx-auto lg:max-w-none lg:mx-0">
             {/* Optional: Add subtle animation wrapper */}
             {/* <div className="animate-subtle-float"> */}
                <img
                  src="/ai-chat-illustration.jpg" // Replace with your actual image path
                  alt="AI Assistant Interface"
                  className="w-full h-auto rounded-xl border border-blue-300 shadow-2xl shadow-blue-500/20 aspect-video object-cover" // Larger radius, neutral shadow, enforce aspect ratio
                  // Optional: Add loading="lazy" for performance
                />
             {/* </div> */}
             {/* Define animate-subtle-float in your global CSS if needed:
               @keyframes subtle-float {
                 0%, 100% { transform: translateY(0); }
                 50% { transform: translateY(-6px); }
               }
               .animate-subtle-float { animation: subtle-float 6s ease-in-out infinite; }
             */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;