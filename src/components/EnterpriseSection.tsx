import React from 'react';
import { CheckCircle2, Shield, Users, Server, Briefcase, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Assuming Button is correctly imported
import { Badge } from '@/components/ui/badge'; // Assuming Badge is correctly imported
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'; // Assuming Card components are correctly imported

const EnterpriseSection = () => {
  const features = [
    {
      icon: Shield,
      title: 'Enterprise-Grade Security',
      description: 'End-to-end encryption, SOC 2 compliance, and flexible deployment options (cloud/on-premise).' // Refined description
    },
    {
      icon: Users,
      title: 'Advanced Collaboration Tools', // Refined title
      description: 'Shared knowledge bases, role-based access control, and collaborative AI workspaces.' // Refined description
    },
    {
      icon: Server,
      title: 'Scalable Infrastructure', // Refined title
      description: 'Deploy on your private cloud or on-premise hardware for full data control.' // Refined description
    },
    {
      icon: Briefcase, // Consider a more fitting icon like Paintbrush or Palette for branding
      title: 'Custom Branding & Integration', // Refined title
      description: 'White-label the platform and integrate seamlessly with your existing SSO and tools.' // Refined description
    },
    {
      icon: Clock,
      title: 'Dedicated 24/7 Support & SLA', // Refined title
      description: 'Priority technical support, dedicated account managers, and service level agreements.' // Refined description
    },
  ];

  // Assume gradient-text class is defined globally or in your main CSS:
  // .gradient-text { ... } (same as in Hero section)

  return (
    <section id="enterprise" className="relative isolate overflow-hidden bg-background py-24 sm:py-32"> {/* Use isolate, bg-background, more padding */}
      {/* Subtle Background Elements (similar to Hero) */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary/20 via-primary/10 to-secondary/20 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" // Adjusted gradient shape/colors
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center"> {/* Increased gap */}

          {/* Left Column: Feature Details */}
          <div>
            <Badge variant="outline" className="border-primary/50 text-primary mb-6 py-1.5 px-4 text-sm font-medium"> {/* Use Badge component */}
              <Shield className="h-4 w-4 mr-2" />
              Enterprise Solutions
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6 leading-tight"> {/* Use foreground, larger size */}
              Power Your Organization with Secure, <span className="gradient-text">Tailored AI</span>
            </h2>
            <p className="text-lg lg:text-xl text-muted-foreground mb-10"> {/* Use muted-foreground, adjusted margin */}
              CyberGen AURA for Enterprise provides robust security, advanced collaboration, custom integrations, and dedicated support designed for complex organizational needs.
            </p>

            {/* Feature List */}
            <ul className="space-y-6"> {/* Increased spacing */}
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-4"> {/* Align items start */}
                  <div className="flex-shrink-0 w-6 h-6 mt-1 bg-primary/10 text-primary rounded-full flex items-center justify-center"> {/* Styled icon container */}
                    <feature.icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base lg:text-lg text-foreground">{feature.title}</h3> {/* Use foreground */}
                    <p className="text-muted-foreground text-sm lg:text-base">{feature.description}</p> {/* Slightly larger text */}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Call to Action / Summary Card */}
          <div className="flex justify-center lg:justify-end"> {/* Align card */}
            <Card className="w-full max-w-md shadow-xl border-border/80"> {/* Use Card, set max-width */}
              <CardHeader className="p-6 pb-4"> {/* Adjust padding */}
                <CardTitle className="text-2xl font-semibold">Ready for Enterprise Scale?</CardTitle>
                <CardDescription className="pt-2">
                  Discuss your specific requirements with our solutions team.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0"> {/* Adjust padding */}
                 {/* Optional: Add 1-2 key benefit bullet points if needed, but avoid full list */}
                 {/* Example:
                 <ul className="space-y-3 text-sm text-muted-foreground mb-6 border-t pt-6 mt-4">
                     <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Full Data Control & Privacy</li>
                     <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Dedicated Support & SLA</li>
                 </ul>
                 */}
                 <p className="text-sm text-muted-foreground mb-6">
                    Custom pricing and deployment options available based on your organization's size and needs.
                 </p>
                 <Button size="lg" className="w-full group"> {/* Use default variant, full width */}
                    Contact Sales
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
                 </Button>
              </CardContent>
              {/* Removed CardFooter as button is now in CardContent for this layout */}
              {/* Removed redundant feature list and complex pricing display - focus on CTA */}
            </Card>
             {/* Removed decorative background elements behind card */}
          </div>
        </div>
      </div>

       {/* Additional subtle background gradient element */}
       <div
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-secondary/20 via-primary/10 to-primary/10 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" // Another gradient shape
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </section>
  );
};

export default EnterpriseSection;