import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from 'react-router-dom';

const Header = () => {
  const isMobile = useIsMobile();

  const navItems = [
    { name: 'Enterprise', href: '/#enterprise' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'Testimonials', href: '/#testimonials' },
  ];

  const Logo = () => (
    <Link to="/" className="flex items-center">
      <img 
        src="/cybergen-logo.png" 
        alt="Cybergen" 
        className="h-[160px] w-auto"
      />
    </Link>
  );

  const NavItems = () => (
    <nav className="hidden md:flex items-center gap-6">
      {navItems.map((item) => (
        <a 
          key={item.name} 
          href={item.href}
          className="text-foreground hover:text-cybergen-primary transition-colors font-medium"
        >
          {item.name}
        </a>
      ))}
    </nav>
  );

  const MobileNav = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-6">
          {navItems.map((item) => (
            <a 
              key={item.name} 
              href={item.href}
              className="text-foreground hover:text-cybergen-primary transition-colors font-medium text-lg py-2"
            >
              {item.name}
            </a>
          ))}
          <Link to="/auth">
            <Button className="mt-4 bg-cybergen-primary hover:bg-cybergen-secondary w-full">
              Sign In
            </Button>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="bg-background/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Logo />
        <NavItems />
        <div className="flex items-center gap-3">
          {!isMobile && (
            <Link to="/auth">
              <Button className="bg-cybergen-primary hover:bg-cybergen-secondary">
                Sign In
              </Button>
            </Link>
          )}
          <MobileNav />
        </div>
      </div>
    </header>
  );
};

export default Header;
