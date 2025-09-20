import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { Card } from "@/components/ui/card";
import { Coins, TrendingUp, BookOpen, Star, Users, Trophy, Gamepad2 } from "lucide-react";
import heroImage from "@/assets/hero-kids-learning.jpg";

export function HeroSection() {
  return (
    <section className="relative py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-12 animate-fade-in">
          {/* Hero Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-muted text-foreground px-4 py-2 rounded-full font-medium text-sm">
              <Star className="w-4 h-4 text-accent-yellow" />
              Financial Literacy for Kids
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-foreground font-display leading-tight">
              Learn Money
              <br />
              <span className="text-primary">The Fun Way</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Master investing with virtual coins in a safe, interactive environment. 
              Build financial confidence through gamified learning.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <AuthDialog 
              trigger={
                <Button variant="interactive" size="lg" className="px-10 py-4 text-lg font-bold">
                  Start Learning Free
                </Button>
              } 
              defaultMode="signup" 
            />
            <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-medium">
              Watch Demo
            </Button>
          </div>

          {/* Hero Image */}
          <div className="mt-16 relative">
            <div className="mx-auto max-w-4xl rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={heroImage} 
                alt="Kids learning about finance and investing with EduPlay" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            {/* Virtual Trading */}
            <Card className="p-8 hover:shadow-md transition-all duration-300 border-0 shadow-sm">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-accent-green/10 rounded-2xl flex items-center justify-center">
                  <Coins className="w-8 h-8 text-accent-green" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Virtual Trading</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Start with $10,000 virtual money to practice trading without any financial risk.
                </p>
              </div>
            </Card>

            {/* Real Market Data */}
            <Card className="p-8 hover:shadow-md transition-all duration-300 border-0 shadow-sm">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-accent-blue/10 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-accent-blue" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Real Market Data</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Learn with live stock prices and market movements in a safe environment.
                </p>
              </div>
            </Card>

            {/* Interactive Learning */}
            <Card className="p-8 hover:shadow-md transition-all duration-300 border-0 shadow-sm">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-accent-purple/10 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-accent-purple" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Interactive Learning</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Gamified courses with AR/VR experiences designed for young learners.
                </p>
              </div>
            </Card>
          </div>

          {/* Secondary Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="p-6 hover:shadow-sm transition-all duration-200 bg-muted/30 border-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent-pink/10 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent-pink" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Community</h3>
                  <p className="text-sm text-muted-foreground">Learn together</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-sm transition-all duration-200 bg-muted/30 border-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent-orange/10 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-accent-orange" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Achievements</h3>
                  <p className="text-sm text-muted-foreground">Earn rewards</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-sm transition-all duration-200 bg-muted/30 border-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent-yellow/10 rounded-xl flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-accent-yellow" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Gamification</h3>
                  <p className="text-sm text-muted-foreground">Fun challenges</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}