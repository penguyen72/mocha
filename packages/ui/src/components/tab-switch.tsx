import type { ReactNode } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

// Generic tab-switch primitive. Built for Explore's Chattanooga/Atlanta tabs; Session 3's Stay
// section needs an equivalent On-Estate/Downtown-Chattanooga tab switch — reuse this rather than
// building a second one.
export type TabSwitchProps = {
  tabs: { id: string; label: string; panel: ReactNode }[];
  defaultTabId?: string;
};

export function TabSwitch({ tabs, defaultTabId }: TabSwitchProps) {
  return (
    <Tabs defaultValue={defaultTabId ?? tabs[0]?.id}>
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id}>
          {tab.panel}
        </TabsContent>
      ))}
    </Tabs>
  );
}
