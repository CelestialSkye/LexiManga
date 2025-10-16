import { Table, Center, Loader } from '@mantine/core';

const DataTable = ({ 
    data, 
    columns, 
    loading = false,
    emptyMessage = "No data found",
    onRowClick,
    ...props 
  }) => {
    return (
      <div className="w-full overflow-x-auto ">
        <Table {...props} className="w-full table-fixed">
          <Table.Thead>
            <Table.Tr>
              {columns.map((col, index) => {
                const getColumnWidth = (index) => {
                  switch (index) {
                    case 0: return 'w-1/4'; 
                    case 1: return 'w-2/5'; 
                    case 2: return 'w-1/6';
                    case 3: return 'w-1/6';
                    default: return 'w-auto';
                  }
                };
                
                return (
                  <Table.Th key={index} className={`text-left px-4 py-3 ${getColumnWidth(index)}`}>
                    {col.header}
                  </Table.Th>
                );
              })}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length}>
                  <Center><Loader size="sm" /></Center>
                </Table.Td>
              </Table.Tr>
            ) : data.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length}>
                  <Center>{emptyMessage}</Center>
                </Table.Td>
              </Table.Tr>
            ) : (
              data.map((row, index) => (
                <Table.Tr key={index} onClick={() => onRowClick?.(row)} className="hover:bg-gray-50 cursor-pointer">
                  {columns.map((col, colIndex) => {
                    // Define column widths for better spacing
                    const getColumnWidth = (index) => {
                      switch (index) {
                        case 0: return 'w-1/4'; // Word - 25%
                        case 1: return 'w-2/5'; // Translation - 40%
                        case 2: return 'w-1/6'; // Chapter - 16%
                        case 3: return 'w-1/6'; // Status - 16%
                        default: return 'w-auto';
                      }
                    };
                    
                    return (
                      <Table.Td key={colIndex} className={`text-left px-4 py-3 ${getColumnWidth(colIndex)}`}>
                        {col.render ? col.render(row) : row[col.key]}
                      </Table.Td>
                    );
                  })}
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </div>
    );
  };

export default DataTable;