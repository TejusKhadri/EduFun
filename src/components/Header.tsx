import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { TrendingUp, Menu } from "lucide-react";

export function Header() {
  return (
    <header className="w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-fun rounded-xl flex items-center justify-center shadow-card">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-foreground font-display">EduPlay</span>
            <span className="text-xs text-primary font-semibold -mt-1">Financial Literacy Revolution</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-muted-foreground hover:text-primary transition-colors font-medium">
            🎮 Features
          </a>
          <a href="#courses" className="text-muted-foreground hover:text-primary transition-colors font-medium">
            📚 Courses
          </a>
          <a href="#community" className="text-muted-foreground hover:text-primary transition-colors font-medium">
            👥 Community
          </a>
          <a href="#about" className="text-muted-foreground hover:text-primary transition-colors font-medium">
            ℹ️ About
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <AuthDialog 
            trigger={
              <Button variant="ghost" size="sm" className="font-semibold">
                Sign In
              </Button>
            } 
            defaultMode="signin" 
          />
          <AuthDialog 
            trigger={
              <Button variant="fun" size="sm" className="px-6">
                🚀 Join Free
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