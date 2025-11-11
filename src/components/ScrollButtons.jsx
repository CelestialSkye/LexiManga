import { Tabs } from '@mantine/core';

const ScrollButtons = ({ items = [], activeItem, onItemClick }) => {
  return (
    <div className='scrollbar-hide w-full overflow-x-auto'>
      <Tabs
        value={activeItem}
        onChange={onItemClick}
        classNames={{
          tab: 'custom-tab',
        }}
      >
        <Tabs.List className='w-full min-w-max md:w-full'>
          {items.map((item) => (
            <Tabs.Tab
              key={item.id}
              value={item.id}
              className='flex-1 px-2 text-[9px] whitespace-nowrap'
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
