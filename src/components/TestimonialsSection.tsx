import React from 'react';
import { motion } from 'framer-motion'; // Import motion
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar'; // Removed AvatarImage as it wasn't used
import { Star } from 'lucide-react';
import { cn } from "@/lib/utils"; // Import cn utility if you use it for class merging

const testimonials = [
    {
      quote: "CyberGen AURA has transformed how our legal team processes documents. We've reduced review time by 70% and improved accuracy significantly.",
      author: "Sarah Johnson",
      title: "Legal Director, LexCorp International",
      avatar: "SJ"
    },
    {
      quote: "The data analysis capabilities are impressive. Our financial team can now process quarterly reports in minutes instead of days.",
      author: "Michael Chen",
      title: "CFO, FinanceWorks",
      avatar: "MC"
    },
    {
      quote: "Implementing AURA across our healthcare system has improved document processing efficiency while maintaining strict compliance requirements.",
      author: "Dr. Emily Rodriguez",
      title: "CIO, MedTech Solutions",
      avatar: "ER"
    },
    {
      quote: "The knowledge base feature has become essential for our research team. It's like having an AI research assistant that knows everything we've ever documented.",
      author: "James Wilson",
      title: "Research Director, TechInnovate",
      avatar: "JW"
    },
    // Add more testimonials if needed to fill space better
];

// Duplicate testimonials for seamless looping animation
const duplicatedTestimonials = [...testimonials, ...testimonials];

const StarRating = () => (
  <div className="flex gap-1 mb-4">
    {[...Array(5)].map((_, i) => (
      // Assuming you have cybergen-accent defined in your tailwind.config.js
      // If not, replace with a standard color like 'text-yellow-400 fill-yellow-400'
      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
    ))}
  </div>
);

const TestimonialCard = ({ testimonial, className }: { testimonial: typeof testimonials[0], className?: string }) => (
  <Card
    className={cn(
        "flex-shrink-0 w-[80vw] sm:w-[400px] md:w-[450px] snap-center", // Define width and prevent shrinking
        "border bg-card hover:shadow-lg transition-shadow duration-300",
        className
    )}
  >
    <CardContent className="p-6 flex flex-col h-full"> {/* Ensure content takes full height */}
      <StarRating />
      <blockquote className="mb-6 text-base md:text-lg italic flex-grow"> {/* Use flex-grow to push footer down */}
        "{testimonial.quote}"
      </blockquote>
      <div className="flex items-center gap-4 mt-auto"> {/* mt-auto pushes to bottom */}
        <Avatar>
          {/* Define fallback bg/text colors in tailwind.config or use standard ones */}
          <AvatarFallback className="bg-primary/10 text-primary">
            {testimonial.avatar}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold">{testimonial.author}</div>
          <div className="text-sm text-muted-foreground">{testimonial.title}</div>
        </div>
      </div>
    </CardContent>
  </Card>
);


const TestimonialsSection = () => {
  // Adjust duration based on the number of testimonials to maintain consistent speed
  // More items = longer duration for the same speed
  const animationDuration = testimonials.length * 10; // e.g., 4 items * 10 = 40 seconds

  const marqueeVariants = {
    animate: {
      x: ['0%', '-100%'], // Move from start to the beginning of the duplicated content
      transition: {
        x: {
          repeat: Infinity,
          repeatType: 'loop',
          duration: animationDuration,
          ease: 'linear',
        },
      },
    },
  };

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-background overflow-hidden"> {/* Add overflow-hidden here */}
      <div className="container mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {/* Assuming gradient-text class provides styling */}
            Trusted by <span className="text-cybergen-secondary">Industry Leaders</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            See what our customers have to say about how CyberGen AURA has transformed their document processes.
          </p>
        </div>
      </div>

      {/* Marquee Container */}
      <div
         className="relative w-full overflow-hidden" // Mask the overflow
         // Optional: Add gradient masks for fading edges
         style={{
            maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
         }}
      >
        <motion.div
          className="flex gap-6 w-max" // Use w-max to allow content to determine width, add gap
          variants={marqueeVariants}
          animate="animate"
        >
          {duplicatedTestimonials.map((testimonial, index) => (
            <TestimonialCard
                key={index} // Using index is acceptable for duplicated static list
                testimonial={testimonial}
                // Add margin if gap isn't sufficient or preferred
                // className="mr-6"
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;