
import React from 'react';
import { FileUp, Database, Brain, Lock, Zap, BarChart2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const FeaturesSection = () => {
  const features = [
    {
      title: 'Document Intelligence',
      description: 'Upload and analyze documents of any format. Extract insights, summarize content, and get answers from your files.',
      icon: FileUp,
    },
    {
      title: 'Knowledge Base',
      description: 'Build a searchable knowledge repository from your documents that your AI assistant can reference in conversations.',
      icon: Brain,
    },
    {
      title: 'Data Analytics',
      description: 'Upload spreadsheets and data files for instant analysis, visualization, and actionable insights.',
      icon: BarChart2,
    },
    {
      title: 'Enterprise Security',
      description: 'Bank-level encryption and security protocols to keep your data safe and confidential at all times.',
      icon: Lock,
    },
    {
      title: 'Lightning Fast',
      description: 'Optimized for speed with real-time responses and minimal latency even with large document sets.',
      icon: Zap,
    },
    {
      title: 'Custom Integrations',
      description: 'Connect with your existing tools and databases for a seamless workflow integration.',
      icon: Database,
    },
  ];

  return (
    <section id="features" className="section-container bg-muted/50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Advanced <span className="gradient-text">Enterprise Features</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our AI platform comes equipped with powerful capabilities designed specifically for enterprise needs and complex document workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="feature-card group">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-full bg-cybergen-primary/10 flex items-center justify-center mb-4 group-hover:animate-bounce-slow">
                  <feature.icon className="h-7 w-7 text-cybergen-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
