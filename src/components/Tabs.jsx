import { createContext, useContext, useState } from 'react';

const TabsContext = createContext(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs.Tab must be used within Tabs');
  }
  return context;
}

function Tab({ value, label, icon }) {
  const { activeTab, onTabChange } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      onClick={() => onTabChange(value)}
      className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all flex items-center gap-1.5 ${
        isActive ? 'bg-[var(--color-teal)] text-white' : 'text-[var(--color-text-muted)]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function TabsRoot({ children, value, onChange }) {
  const [internalActiveTab, setInternalActiveTab] = useState(null);
  const isControlled = value !== undefined;
  const activeTab = isControlled ? value : internalActiveTab;

  function onTabChange(tabValue) {
    if (!isControlled) {
      setInternalActiveTab(tabValue);
    }
    onChange?.(tabValue);
  }

  return (
    <TabsContext.Provider value={{ activeTab, onTabChange }}>
      <div className="flex bg-[var(--input-bg)] border border-[var(--input-border)] rounded-full p-1">
        {children}
      </div>
    </TabsContext.Provider>
  );
}

const Tabs = Object.assign(TabsRoot, { Tab });

export default Tabs;
