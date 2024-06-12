import { Tabs, TabList, tabClasses, Tab, TabPanel } from "@mui/joy";

export type Tab = {
  label: string;
  content: React.ReactNode;
};

export function TabBar({
  tabs,
  tabValue,
  handleTabChange,
}: {
  tabs: Tab[];
  tabValue: number;
  handleTabChange: (
    _event: React.SyntheticEvent<Element, Event> | null,
    newValue: string | number | null,
  ) => void;
}) {
  return (
    <Tabs
      value={tabValue}
      onChange={handleTabChange}
      sx={{
        display: "flex",
        flexGrow: 1,
        bgcolor: "transparent",
      }}
    >
      <TabList
        tabFlex={1}
        size="sm"
        sx={{
          pl: { xs: 0, md: 4 },
          justifyContent: "left",
          [`&& .${tabClasses.root}`]: {
            fontWeight: "600",
            flex: "initial",
            color: "text.tertiary",
            [`&.${tabClasses.selected}`]: {
              bgcolor: "transparent",
              color: "text.primary",
              "&::after": {
                height: "2px",
                bgcolor: "primary.500",
              },
            },
          },
        }}
      >
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            sx={{ borderRadius: "6px 6px 0 0" }}
            indicatorInset
            value={index}
          >
            {tab.label}
          </Tab>
        ))}
      </TabList>
      {tabs.map((tab, index) => (
        <TabPanel key={index} value={index}>
          {tab.content}
        </TabPanel>
      ))}
    </Tabs>
  );
}
