import { Tabs } from '@mantine/core';

const ScrollButtons = ({ 
  items = [], 
  activeItem, 
  onItemClick
}) => {
  return (
    <div className="overflow-x-auto scrollbar-hide w-full">
      <Tabs 
        value={activeItem} 
        onChange={onItemClick}
        classNames={{
          tab: 'custom-tab',
        }}
      >
        <Tabs.List className="min-w-max w-full md:w-full">
          {items.map((item) => (
            <Tabs.Tab 
              key={item.id} 
              value={item.id} 
              className="whitespace-nowrap flex-1 px-2 text-[9px]"
            >
              {item.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
    </div>
  );
};

export default ScrollButtons;