import { Center, Loader, Table } from '@mantine/core';

const DataTable = ({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data found',
  onRowClick,
  ...props
}) => {
  return (
    <div className='w-full overflow-x-auto'>
      <Table {...props} className='w-full table-auto'>
        <Table.Thead>
          <Table.Tr>
            {columns.map((col, index) => (
              <Table.Th key={index} className='px-4 py-3 text-left whitespace-nowrap'>
                {col.header}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {loading ? (
            <Table.Tr>
              <Table.Td colSpan={columns.length}>
                <Center>
                  <Loader size='sm' />
                </Center>
              </Table.Td>
            </Table.Tr>
          ) : data.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={columns.length}>
                <Center>{emptyMessage}</Center>
              </Table.Td>
            </Table.Tr>
          ) : (
            data.map((row, rowIndex) => (
              <Table.Tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className='cursor-pointer hover:bg-gray-50'
              >
                {columns.map((col, colIndex) => (
                  <Table.Td key={colIndex} className='px-4 py-3 text-left whitespace-nowrap'>
                    {col.render ? col.render(row) : row[col.key]}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>
    </div>
  );
};

export default DataTable;
