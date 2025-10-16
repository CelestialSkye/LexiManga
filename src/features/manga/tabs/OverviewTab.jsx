const OverviewTab = ({ manga }) => {
  return (
    <div className="p-2 pb-4 rounded-[16px] bg-white">
      <h2 className="text-xl font-bold mb-6">Overview</h2>
      
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
