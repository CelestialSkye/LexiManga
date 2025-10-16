const CharactersTab = ({ manga }) => {
  return (
    <div className="rounded-[16px] bg-white p-2 pb-4">
      <h2 className="text-xl font-bold mb-4">Characters</h2>
      {manga.characters?.edges && manga.characters.edges.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {manga.characters.edges.map((edge, index) => (
            <div key={index} className="text-center">
              {edge.node.image?.large && (
                <img 
                  src={edge.node.image.large} 
                  alt={edge.node.name.full}
                  className="w-16 h-16 rounded-[8px] mx-auto mb-2 object-cover"
                />
              )}
              <div className="text-sm font-medium">{edge.node.name.full}</div>
              <div className="text-xs text-gray-500">{edge.role}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No character information available</p>
      )}
    </div>
  );
};

export default CharactersTab;
