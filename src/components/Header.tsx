import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { TrendingUp, Menu } from "lucide-react";

export function Header() {
  return (
    <header className="w-full border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-2xl font-black font-display">
              <span className="text-accent-orange">e</span>
              <span className="text-accent-green">d</span>
              <span className="text-accent-blue">u</span>
              <span className="text-accent-pink">p</span>
              <span className="text-accent-purple">l</span>
              <span className="text-accent-orange">a</span>
              <span className="text-accent-yellow">y</span>
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
            Features
          </a>
          <a href="#courses" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
            Courses
          </a>
          <a href="#community" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
            Community
          </a>
          <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
            About
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <AuthDialog 
            trigger={
              <Button variant="ghost" size="sm" className="font-medium">
                Sign In
              </Button>
            } 
            defaultMode="signin" 
          />
          <AuthDialog 
            trigger={
              <Button variant="interactive" size="sm" className="px-6 font-semibold">
                Get Started
              </Button>
            } 
            defaultMode="signup" 
          />
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}