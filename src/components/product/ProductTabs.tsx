import type { KeyboardEvent, ReactNode } from "react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export interface ProductTab {
  content: ReactNode;
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
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : event.key === "ArrowRight"
            ? (index + 1) % tabs.length
            : (index - 1 + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];

    if (nextTab) {
      onTabChange?.(nextTab.id);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="rounded-lg border border-maroon/10 bg-card p-3 shadow-lift sm:p-4">
      <div
        aria-label="Product information"
        className="flex gap-1 overflow-x-auto border-b border-maroon/10"
        role="tablist"
      >
        {tabs.map((tab, index) => (
          <button
            aria-controls={`${tab.id}-panel`}
            aria-selected={tab.id === activeTab}
            className={cn(
              "shrink-0 border-b-2 px-3 py-2.5 text-sm font-semibold transition sm:px-4",
              tab.id === activeTab
                ? "border-maroon text-maroon"
                : "border-transparent text-muted-foreground hover:text-charcoal",
            )}
            id={`${tab.id}-tab`}
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            role="tab"
            tabIndex={tab.id === activeTab ? 0 : -1}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      {selectedTab ? (
        <div
          aria-labelledby={`${selectedTab.id}-tab`}
          className="px-1 py-5 text-sm leading-7 text-muted-foreground sm:px-2 sm:py-6"
          id={`${selectedTab.id}-panel`}
          role="tabpanel"
          tabIndex={0}
        >
          {selectedTab.content}
        </div>
      ) : null}
    </div>
  );
}
