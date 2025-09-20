type TabType = 'market' | 'portfolio' | 'learn' | 'leaderboard' | 'community';

interface NavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  const tabs = [
    { id: 'market', label: 'Market' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'learn', label: 'Learn' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'community', label: 'Community' },
  ] as const;

  return (
    <div className="flex gap-2 bg-muted/50 p-2 rounded-xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === tab.id
              ? 'gradient-bg-primary text-white shadow-lg scale-105'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/80 hover:scale-102'
          }`}
        >
          <span className="font-fun">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}