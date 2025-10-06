const OverviewTab = ({ manga }) => {
  return (
    <div className="p-2 pb-4 rounded-[16px]">
      <h2 className="text-xl font-bold mb-6">Overview</h2>
      
      {/* description */}
      {manga.description && (
        <div 
          className="text-gray-700 leading-relaxed mb-4"
          dangerouslySetInnerHTML={{ __html: manga.description }}
        />
      )}
      
      {/* genres */}
      {manga.genres && (
        <div className="mb-4">
          <strong>Genres:</strong>
          <div className="flex flex-wrap gap-2 mt-1">
            {manga.genres.map((genre, index) => (
              <span key={index} className="bg-violet-100 text-violet-800 px-2 py-1 rounded text-sm">
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* release date */}
      {manga.startDate && (
        <div className="mb-4">
          <strong>Release Date:</strong> {manga.startDate.year}
          {manga.startDate.month && `/${manga.startDate.month}`}
          {manga.startDate.day && `/${manga.startDate.day}`}
          {manga.endDate && (
            <span> - {manga.endDate.year}
              {manga.endDate.month && `/${manga.endDate.month}`}
              {manga.endDate.day && `/${manga.endDate.day}`}
            </span>
          )}
        </div>
      )}
      
      {/* status */}
      {manga.status && (
        <div className="mb-4">
          <strong>Status:</strong> 
          <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm">
            {manga.status}
          </span>
        </div>
      )}
      
      {/* type */}
      {manga.format && (
        <div className="mb-4">
          <strong>Type:</strong> 
          <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm">
            {manga.format}
          </span>
        </div>
      )}
      
      {/* chapters and volunmes */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {manga.chapters && (
          <div>
            <strong>Chapters:</strong> 
            <span className="ml-2">{manga.chapters}</span>
          </div>
        )}
        {manga.volumes && (
          <div>
            <strong>Volumes:</strong> 
            <span className="ml-2">{manga.volumes}</span>
          </div>
        )}
      </div>
      
      {/* score */}
      {manga.averageScore && (
        <div className="mb-6">
          <strong>Average Score:</strong> 
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
            {manga.averageScore}/100
          </span>
        </div>
      )}
      
    </div>
  );
};

export default OverviewTab;
