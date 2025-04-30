import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();

  // Official Cybergen links
  const footerLinks = [
    { name: 'About Us', href: 'https://www.cybergen.com/about-us' },
    { name: 'Contact Us', href: 'https://www.cybergen.com/contact-us' },
    { name: 'Blogs', href: 'https://www.cybergen.com/blog' },
    { name: 'Services', href: 'https://www.cybergen.com/services' },
    { name: 'Careers', href: 'https://www.cybergen.com/careers' },
  ];

  // Social media links
  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', ariaLabel: 'Cybergen on Facebook' },
    { icon: Twitter, href: 'https://twitter.com', ariaLabel: 'Cybergen on Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com', ariaLabel: 'Cybergen on LinkedIn' },
    { icon: Instagram, href: 'https://instagram.com', ariaLabel: 'Cybergen on Instagram' },
  ];

  return (
    <footer className="bg-black border-t border-gray-800 mt-auto">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center text-center mb-6">
          <a href="https://www.cybergen.com" target="_blank" rel="noopener noreferrer" aria-label="Cybergen Home">
            <img
              src="/cybergen-logo.png"
              alt="Cybergen Logo"
              className="h-[160px] w-auto mb-4 filter invert"
            />
          </a>
          <p className="text-gray-300 text-sm max-w-md">
            Empowering enterprises with AI-driven solutions. Process, analyze, and unlock insights effortlessly.
          </p>
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap justify-center gap-6 mb-6">
          {footerLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-300 hover:text-white hover:underline underline-offset-4"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Social Links */}
        {/* <div className="flex justify-center space-x-4 mb-6">
          {socialLinks.map((social, index) => (
            <a 
              key={index}
              href={social.href}
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label={social.ariaLabel}
              className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-800"
            >
              <social.icon className="h-5 w-5" />
            </a>
          ))}
        </div> */}

        <Separator className="mb-6 bg-gray-800" />

        {/* Copyright */}
        <div className="text-xs text-gray-400 text-center">
          © {year} Cybergen Systems Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;