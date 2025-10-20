const OverviewTab = ({ manga }) => {
  return (
    <div className='rounded-[16px] bg-white p-2 pb-4'>
      <h2 className='mb-4 pt-4 pr-4 text-xl font-bold'>Overview</h2>

      {/* description */}
      {manga.description && (
        <div
          className='mb-4 leading-relaxed text-gray-700'
          dangerouslySetInnerHTML={{ __html: manga.description }}
        />
      )}
    </div>
  );
};

export default OverviewTab;
