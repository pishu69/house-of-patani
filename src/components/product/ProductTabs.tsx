import { cn } from "@/lib/utils";

export interface ProductTab {
  content: string;
  id: string;
  label: string;
}

interface ProductTabsProps {
  activeTab: string;
  onTabChange?: (tabId: string) => void;
  tabs: ProductTab[];
}

export function ProductTabs({
  activeTab,
  onTabChange,
  tabs,
}: ProductTabsProps) {
  const selectedTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <div>
      <div
        aria-label="Product information"
        className="flex gap-1 overflow-x-auto border-b border-maroon/10"
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            aria-controls={`${tab.id}-panel`}
            aria-selected={tab.id === activeTab}
            className={cn(
              "shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition",
              tab.id === activeTab
                ? "border-maroon text-maroon"
                : "border-transparent text-muted-foreground hover:text-charcoal",
            )}
            id={`${tab.id}-tab`}
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      {selectedTab ? (
        <div
          aria-labelledby={`${selectedTab.id}-tab`}
          className="py-6 text-sm leading-7 text-muted-foreground"
          id={`${selectedTab.id}-panel`}
          role="tabpanel"
        >
          {selectedTab.content}
        </div>
      ) : null}
    </div>
  );
}
