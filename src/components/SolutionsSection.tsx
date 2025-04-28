
import React from 'react';
import { ArrowRight, FileText, Building, HardDrive, GraduationCap, HeartPulse, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SolutionsSection = () => {
  const solutions = [
    {
      id: 'legal',
      icon: Scale,
      title: 'Legal & Compliance',
      description: 'Process legal documents, contracts, and compliance reports with AI-powered analysis and extraction.',
      benefits: [
        'Contract analysis and review automation',
        'Legal research and case law exploration',
        'Compliance monitoring and risk assessment',
        'Document comparison and redlining'
      ],
      image: '/placeholder.svg'
    },
    {
      id: 'finance',
      icon: Building,
      title: 'Financial Services',
      description: 'Transform financial data processing with intelligent document extraction and analysis.',
      benefits: [
        'Financial statement analysis',
        'Investment research automation',
        'Regulatory filing processing',
        'Risk assessment and reporting'
      ],
      image: '/placeholder.svg'
    },
    {
      id: 'healthcare',
      icon: HeartPulse,
      title: 'Healthcare',
      description: 'Streamline medical record processing and healthcare documentation with AI assistance.',
      benefits: [
        'Medical record analysis and summarization',
        'Research paper insights extraction',
        'Patient data anonymization',
        'Healthcare compliance documentation'
      ],
      image: '/placeholder.svg'
    },
    {
      id: 'education',
      icon: GraduationCap,
      title: 'Education',
      description: 'Enhance learning environments with AI-powered document analysis and knowledge management.',
      benefits: [
        'Research paper analysis and summarization',
        'Course material organization',
        'Student performance analytics',
        'Administrative document processing'
      ],
      image: '/placeholder.svg'
    },
    {
      id: 'it',
      icon: HardDrive,
      title: 'IT & Technology',
      description: 'Optimize technical documentation and code analysis with intelligent AI processing.',
      benefits: [
        'Technical documentation analysis',
        'Code review and optimization',
        'Log file analysis and issue detection',
        'Architecture documentation management'
      ],
      image: '/placeholder.svg'
    },
  ];

  return (
    <section id="solutions" className="section-container">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Industry <span className="gradient-text">Solutions</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            CyberGen AURA adapts to various industries with specialized document processing and AI capabilities.
          </p>
        </div>

        <Tabs defaultValue="legal" className="w-full max-w-5xl mx-auto">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
            {solutions.map((solution) => (
              <TabsTrigger 
                key={solution.id} 
                value={solution.id}
                className="flex flex-col items-center py-3 gap-2 data-[state=active]:border-b-2 data-[state=active]:border-cybergen-primary"
              >
                <solution.icon className="h-5 w-5" />
                <span className="text-xs md:text-sm font-medium">{solution.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {solutions.map((solution) => (
            <TabsContent 
              key={solution.id} 
              value={solution.id}
              className="bg-card rounded-xl shadow-sm border border-border p-6 animate-fade-in"
            >
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <div className="inline-flex items-center justify-center p-2 bg-cybergen-primary/10 rounded-lg mb-4">
                    <solution.icon className="h-6 w-6 text-cybergen-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{solution.title}</h3>
                  <p className="text-muted-foreground mb-6">{solution.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Key Benefits:</h4>
                    <ul className="space-y-2">
                      {solution.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="inline-flex mt-1.5 h-1.5 w-1.5 rounded-full bg-cybergen-primary"></span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button className="group bg-cybergen-primary hover:bg-cybergen-secondary">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
                
                <div className="flex-1 flex justify-center">
                  <div className="relative w-full max-w-sm aspect-video bg-cybergen-light dark:bg-cybergen-primary/10 rounded-lg overflow-hidden">
                    <FileText className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 text-cybergen-primary/40" />
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default SolutionsSection;
