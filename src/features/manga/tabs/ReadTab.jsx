const ReadTab = ({ manga }) => {
  return (
    <div>
      
      {/* Reading options */}
      <div>
        <div className="p-2 rounded-[16px] mb-4">
          <h3 className="font-semibold mb-2">Reading Options</h3>
          <p className="text-gray-600 text-sm mb-3">
            Choose how you'd like to read this manga
          </p>
          
          <div className="space-y-2">
            <button className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium">Read Online</div>
              <div className="text-sm text-gray-500">Read chapters directly in the browser</div>
            </button>
            
            <button className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium">Download Chapters</div>
              <div className="text-sm text-gray-500">Download for offline reading</div>
            </button>
          </div>
        </div>
        
        {/* Chapter list placeholder */}
        <div className="p-2 rounded-lg mb-4">
          <h3 className="font-semibold mb-2">Chapters</h3>
          <p className="text-gray-600 text-sm">
            {manga.chapters ? `${manga.chapters} chapters available` : 'Chapter information not available'}
          </p>
        </div>
        
        {/* Reading progress */}
        <div className="p-2 rounded-lg">
          <h3 className="font-semibold mb-2">Reading Progress</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>0%</span>
            </div>
            <div className="w-full  rounded-full h-2">
              <div className=" h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
            <p className="text-xs text-gray-500">Start reading to track your progress</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadTab;
