import React from 'react';
import { Check, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Assuming Button is correctly imported
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'; // Using more specific Card components
import { Badge } from '@/components/ui/badge'; // Assuming Badge is correctly imported

// Define your theme colors (replace with your actual theme variables if possible)
// If these are defined in your tailwind.config.js, you don't need these variables here.
// const CYBERGEN_PRIMARY = '#YOUR_PRIMARY_COLOR'; // e.g., 'hsl(var(--primary))'
// const CYBERGEN_SECONDARY = '#YOUR_SECONDARY_COLOR'; // e.g., 'hsl(var(--secondary))'

const PricingSection = () => {
  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      priceSuffix: '/month',
      description: 'Perfect for individuals and small teams just getting started.',
      features: [
        { included: true, name: 'Basic document analysis' },
        { included: true, name: 'Up to 100 documents/month' }, // Added clarity
        { included: true, name: '2 GB cloud storage' },       // Added clarity
        { included: true, name: 'Standard email support' },   // Added clarity
        { included: false, name: 'API access' },
        { included: false, name: 'Custom model training' },  // Refined wording
        { included: false, name: 'On-premise deployment' },
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 99,
      priceSuffix: '/month',
      description: 'For growing teams that need more power and features.',
      features: [
        { included: true, name: 'Advanced document analysis' },
        { included: true, name: 'Up to 1,000 documents/month' },
        { included: true, name: '10 GB cloud storage' },
        { included: true, name: 'Priority email & chat support' }, // Added clarity
        { included: true, name: 'API access (Rate limited)' },      // Added clarity
        { included: true, name: 'Basic model training' },
        { included: false, name: 'On-premise deployment' },
      ],
      cta: 'Choose Professional', // More specific CTA
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      priceSuffix: '', // No suffix for custom
      description: 'Tailored solutions for large organizations with specific needs.',
      features: [
        { included: true, name: 'Full document intelligence suite' }, // Refined wording
        { included: true, name: 'Unlimited documents' },
        { included: true, name: 'Unlimited cloud storage' },
        { included: true, name: '24/7 Dedicated support & SLA' }, // Added clarity
        { included: true, name: 'Full API access & higher limits' }, // Added clarity
        { included: true, name: 'Advanced custom model training' }, // Refined wording
        { included: true, name: 'On-premise or private cloud deployment' }, // Refined wording
      ],
      cta: 'Contact Sales',
      popular: false,
    }
  ];

  return (
    <section id="pricing" className="py-16 md:py-24 bg-muted/30"> {/* Increased padding, slightly lighter bg */}
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Simple, Transparent Pricing
          </h2>
          {/* Removed gradient span for cleaner look, focus on typography */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that fits your scale. From solo projects to enterprise solutions, we've got you covered.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 max-w-7xl mx-auto items-stretch"> {/* Changed md breakpoint, increased gap, max-width, align items */}
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`flex flex-col relative overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02] ${
                plan.popular ? 'border-2 border-primary shadow-lg shadow-primary/20' : 'border' // Enhanced popular styling, default border for others
              }`}
            >
              {plan.popular && (
                <Badge
                  variant="default" // Use primary color by default
                  className="absolute top-0 right-0 rounded-none rounded-bl-lg px-4 py-1.5 text-sm font-semibold"
                >
                  <Zap className="h-4 w-4 mr-1.5" />
                  Most Popular
                </Badge>
              )}

              <CardHeader className="p-6"> {/* Increased padding */}
                <CardTitle className="text-2xl font-semibold mb-2">{plan.name}</CardTitle> {/* Larger title */}
                <div className="flex items-baseline gap-x-2">
                  {typeof plan.price === 'number' ? (
                    <>
                      <span className="text-4xl md:text-5xl font-bold tracking-tight">${plan.price}</span>
                      <span className="text-muted-foreground">{plan.priceSuffix}</span>
                    </>
                  ) : (
                    <span className="text-4xl md:text-5xl font-bold tracking-tight">{plan.price}</span>
                  )}
                </div>
                 <CardDescription className="pt-3 text-base">{plan.description}</CardDescription> {/* Increased top padding */}
              </CardHeader>

              <CardContent className="flex-grow p-6 space-y-5 border-t"> {/* Added border-t, increased padding + spacing, flex-grow */}
                <p className="text-sm font-medium text-foreground mb-4">Features include:</p> {/* Added subheading for features */}
                <ul className="space-y-3 text-sm"> {/* Use ul for semantics */}
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3"> {/* Use li, align items start for long text */}
                      <div className="flex-shrink-0 w-5 h-5 mt-0.5"> {/* Wrapper for icon alignment */}
                        {feature.included ? (
                          <Check className="h-full w-full text-green-500" />
                        ) : (
                          <X className="h-full w-full text-muted-foreground/70" /> // Slightly dimmer X
                        )}
                      </div>
                      <span className={feature.included ? 'text-foreground' : 'text-muted-foreground line-through'}> {/* Line-through for excluded */}
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="p-6 mt-auto border-t"> {/* Added border-t, padding, push to bottom */}
                <Button
                  size="lg" // Larger button
                  className="w-full"
                  variant={
                    plan.popular
                      ? 'default' // Primary button for popular
                      : plan.id === 'enterprise'
                        ? 'outline' // Outline button for enterprise
                        : 'secondary' // Secondary button for starter
                    }
                  // Add specific hover styles if needed, e.g., hover:bg-primary/90 for default
                  // The variants should handle hover states reasonably well by default
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;