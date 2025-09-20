import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { Card } from "@/components/ui/card";
import { Coins, TrendingUp, BookOpen, Star, Users, Trophy, Gamepad2 } from "lucide-react";
import heroImage from "@/assets/hero-kids-learning.jpg";
import virtualCoinsIcon from "@/assets/virtual-coins-icon.jpg";

export function HeroSection() {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-fun rounded-full opacity-20 animate-bounce-gentle"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-success rounded-full opacity-20 animate-pulse-soft"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-secondary/30 rounded-full animate-bounce-gentle" style={{animationDelay: "1s"}}></div>
      </div>

      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-8 animate-slide-up">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-gradient-fun text-white px-6 py-2 rounded-full font-semibold text-sm shadow-fun">
              <Star className="w-4 h-4" />
              Financial Literacy Revolution
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-foreground font-display leading-tight">
              <span className="bg-gradient-fun bg-clip-text text-transparent">EduPlay</span>{" "}
              <span className="text-foreground">Market</span>
            </h1>
            
            <p className="text-2xl md:text-3xl font-bold text-primary">
              🪙 Learn investing with virtual coins! 🚀
            </p>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A safe, super fun way for kids aged 8-21 to master the stock market using virtual money. 
              Build confidence and financial literacy through exciting gamified learning with real market data!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <AuthDialog 
              trigger={
                <Button variant="eduplay" size="lg" className="px-10 py-4 text-lg">
                  🎮 Start Your Adventure
                </Button>
              } 
              defaultMode="signup" 
            />
            <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold">
              📺 Watch Demo
            </Button>
          </div>

          {/* Hero Image */}
          <div className="mt-12 relative">
            <div className="mx-auto max-w-4xl rounded-3xl overflow-hidden shadow-fun">
              <img 
                src={heroImage} 
                alt="Kids learning about finance and investing with EduPlay" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <Card className="p-8 hover:shadow-fun transition-all duration-300 transform hover:-translate-y-2 bg-gradient-card border-0">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-fun rounded-full flex items-center justify-center shadow-glow">
                  <Coins className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground">💰 Virtual Coins</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Start with $10,000 virtual money to practice trading without any real financial risk. Learn by doing!
                </p>
              </div>
            </Card>

            <Card className="p-8 hover:shadow-fun transition-all duration-300 transform hover:-translate-y-2 bg-gradient-card border-0">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-success rounded-full flex items-center justify-center shadow-glow">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground">📈 Real Market Data</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Trade with real stock prices and market movements. Experience the thrill safely with AI-powered analytics!
                </p>
              </div>
            </Card>

            <Card className="p-8 hover:shadow-fun transition-all duration-300 transform hover:-translate-y-2 bg-gradient-card border-0">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-secondary/90 rounded-full flex items-center justify-center shadow-glow">
                  <Gamepad2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground">🎮 Gamified Learning</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Compete on leaderboards, earn achievements, and join challenges. Learning finance has never been this fun!
                </p>
              </div>
            </Card>
          </div>

          {/* Additional Features Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <Card className="p-6 hover:shadow-card transition-all duration-300 bg-white/60 border border-primary/10">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-warning" />
                </div>
                <h3 className="text-lg font-semibold">📚 Interactive Courses</h3>
                <p className="text-muted-foreground text-sm">
                  Fun lessons with AR/VR experiences designed specifically for young learners.
                </p>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-card transition-all duration-300 bg-white/60 border border-primary/10">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-lg font-semibold">👥 Community Learning</h3>
                <p className="text-muted-foreground text-sm">
                  Connect with peers worldwide and learn together in our vibrant community platform.
                </p>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-card transition-all duration-300 bg-white/60 border border-primary/10">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">🏆 Achievements</h3>
                <p className="text-muted-foreground text-sm">
                  Earn certificates and badges as you master different financial concepts and trading strategies.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}