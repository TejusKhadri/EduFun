import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Gift, Crown, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BuyCoinsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPlan: (coins: number, price: number) => void;
}

const coinPackages = [
  {
    id: 'free',
    name: 'Daily Bonus',
    coins: 500,
    price: 0,
    description: 'Get free coins every day!',
    icon: Gift,
    badge: 'FREE',
    badgeVariant: 'secondary' as const,
    popular: false
  },
  {
    id: 'starter',
    name: 'Starter Pack',
    coins: 1000,
    price: 10,
    description: 'Perfect for beginners',
    icon: Coins,
    badge: null,
    badgeVariant: null,
    popular: false
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    coins: 5000,
    price: 40,
    description: 'Most popular choice',
    icon: Star,
    badge: 'POPULAR',
    badgeVariant: 'default' as const,
    popular: true
  },
  {
    id: 'ultimate',
    name: 'Ultimate Pack',
    coins: 12000,
    price: 80,
    description: 'Maximum value',
    icon: Crown,
    badge: 'BEST VALUE',
    badgeVariant: 'destructive' as const,
    popular: false
  }
];

export function BuyCoinsDialog({ open, onOpenChange, onSelectPlan }: BuyCoinsDialogProps) {
  const handleSelectPlan = (pkg: typeof coinPackages[0]) => {
    if (pkg.price === 0) {
      // Handle free coins
      onSelectPlan(pkg.coins, 0);
    } else {
      // For now, just show a message since Stripe isn't integrated
      alert(`Stripe integration coming soon! You selected ${pkg.name} for $${pkg.price}`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Get Virtual Coins</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {coinPackages.map((pkg) => {
            const IconComponent = pkg.icon;
            return (
              <Card 
                key={pkg.id} 
                className={`relative cursor-pointer transition-all hover:shadow-lg ${
                  pkg.popular ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleSelectPlan(pkg)}
              >
                {pkg.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge variant={pkg.badgeVariant}>{pkg.badge}</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-3">
                  <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="text-center">
                  <div className="mb-4">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Coins className="w-5 h-5 text-amber-500" />
                      <span className="text-2xl font-bold">{pkg.coins.toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">Virtual Coins</div>
                  </div>
                  
                  <div className="mb-4">
                    {pkg.price === 0 ? (
                      <span className="text-2xl font-bold text-green-600">FREE</span>
                    ) : (
                      <div>
                        <span className="text-2xl font-bold">${pkg.price}</span>
                        <div className="text-xs text-muted-foreground">
                          ${(pkg.price / pkg.coins * 1000).toFixed(1)} per 1K coins
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full" 
                    variant={pkg.popular ? 'default' : 'outline'}
                  >
                    {pkg.price === 0 ? 'Claim Free' : 'Buy Now'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Virtual coins are for educational purposes only and have no real monetary value.</p>
          <p>Payment processing via Stripe (integration coming soon)</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}