import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { Card } from "@/components/ui/card";
import { Coins, TrendingUp, BookOpen, Star } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              EduPlay Market
            </h1>
            <p className="text-xl md:text-2xl text-primary font-medium">
              Learn investing with virtual coins!
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A safe, fun way for kids to learn about the stock market using virtual money. 
              Build confidence and financial literacy through gamified learning.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <AuthDialog 
              trigger={
                <Button variant="eduplay" size="lg" className="px-8">
                  Start Learning Today
                </Button>
              } 
              defaultMode="signup" 
            />
            <Button variant="outline" size="lg" className="px-8">
              Watch Demo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Coins className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Virtual Coins</h3>
                <p className="text-muted-foreground">
                  Start with virtual money to practice trading without any real financial risk.
                </p>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold">Real Market Data</h3>
                <p className="text-muted-foreground">
                  Learn with real stock prices and market movements in a safe environment.
                </p>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-yellow-500" />
                </div>
                <h3 className="text-lg font-semibold">Educational Content</h3>
                <p className="text-muted-foreground">
                  Interactive lessons and tutorials designed specifically for young learners.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}