import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { TrendingUp } from "lucide-react";

export function Header() {
  return (
    <header className="w-full border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">EduPlay</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
          <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <AuthDialog 
            trigger={
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            } 
            defaultMode="signin" 
          />
          <AuthDialog 
            trigger={
              <Button variant="eduplay" size="sm">
                Sign Up
              </Button>
            } 
            defaultMode="signup" 
          />
        </div>
      </div>
    </header>
  );
}