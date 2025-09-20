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
    <div className="flex gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-primary text-white'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}