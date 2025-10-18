const OverviewTab = ({ manga }) => {
  return (
    <div className="p-2 pb-4 rounded-[16px] bg-white">
      <h2 className='mb-4 text-xl font-bold pr-4 pt-4'>Overview</h2>
      
      {/* description */}
      {manga.description && (
        <div 
          className="text-gray-700 leading-relaxed mb-4"
          dangerouslySetInnerHTML={{ __html: manga.description }}
        />
      )}
      
     
  
      
    </div>
  );
};

export default OverviewTab;
