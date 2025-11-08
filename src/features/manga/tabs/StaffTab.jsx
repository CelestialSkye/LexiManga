const StaffTab = ({ manga }) => {
  return (
    <div className='p-4'>
      <h2 className='mb-4 text-xl font-bold'>Staff</h2>
      {manga.staff?.edges && manga.staff.edges.length > 0 ? (
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          {manga.staff.edges.map((edge, index) => (
            <div key={index} className='text-center'>
              {edge.node.image?.large && (
                <img
                  src={edge.node.image.large}
                  alt={edge.node.name.full}
                  className='mx-auto mb-2 h-16 w-16 rounded-[8px] object-cover'
                />
              )}
              <div className='text-sm font-medium'>{edge.node.name.full}</div>
              <div className='text-xs text-gray-500'>{edge.role}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className='text-gray-600'>No staff information available</p>
      )}
    </div>
  );
};

export default StaffTab;
