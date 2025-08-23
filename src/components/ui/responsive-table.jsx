import { useState } from 'react';
import { useBreakpoint } from '@/hooks';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { Card } from './card';

/**
 * ResponsiveTable component that adapts to different screen sizes
 * On mobile, it transforms into a card-based layout
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of data objects to display
 * @param {Array} props.columns - Array of column definitions
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.striped] - Whether to use striped rows
 * @param {boolean} [props.hoverable] - Whether rows should have hover effect
 * @param {boolean} [props.bordered] - Whether to add borders
 * @param {Function} [props.onRowClick] - Function to call when a row is clicked
 */
const ResponsiveTable = ({
  data = [],
  columns = [],
  className,
  striped = true,
  hoverable = true,
  bordered = false,
  onRowClick,
}) => {
  const { isMd } = useBreakpoint();
  const [expandedRows, setExpandedRows] = useState({});

  // Toggle row expansion for mobile view
  const toggleRowExpansion = (rowId) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  };

  // Determine if a row is expanded
  const isRowExpanded = (rowId) => {
    return expandedRows[rowId] || false;
  };

  // Render as cards on mobile
  if (!isMd) {
    return (
      <div className={cn('space-y-4', className)}>
        {data.map((row, rowIndex) => {
          const rowId = row.id || rowIndex;
          const isExpanded = isRowExpanded(rowId);
          
          // Get the first few columns for the card header
          const mainColumn = columns[0];
          const secondaryColumn = columns.length > 1 ? columns[1] : null;
          
          return (
            <Card 
              key={rowId} 
              className={cn(
                'overflow-hidden',
                hoverable && 'hover:border-primary/50 transition-colors',
                onRowClick && 'cursor-pointer'
              )}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    {mainColumn && (
                      <div className="font-medium">
                        {typeof mainColumn.cell === 'function' 
                          ? mainColumn.cell({ row })
                          : row[mainColumn.accessorKey]}
                      </div>
                    )}
                    {secondaryColumn && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {typeof secondaryColumn.cell === 'function' 
                          ? secondaryColumn.cell({ row })
                          : row[secondaryColumn.accessorKey]}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRowExpansion(rowId);
                    }}
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </Button>
                </div>
                
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t space-y-2">
                    {columns.slice(2).map((column, colIndex) => (
                      <div key={colIndex} className="flex flex-col">
                        <span className="text-sm font-medium">{column.header}</span>
                        <span className="text-sm">
                          {typeof column.cell === 'function' 
                            ? column.cell({ row })
                            : row[column.accessorKey]}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

  // Render as traditional table on larger screens
  return (
    <div className={cn('w-full overflow-auto', className)}>
      <table className={cn(
        'w-full caption-bottom text-sm',
        bordered && 'border border-border'
      )}>
        <thead className="[&_tr]:border-b">
          <tr className="border-b transition-colors hover:bg-muted/50">
            {columns.map((column, index) => (
              <th
                key={index}
                className={cn(
                  'h-12 px-4 text-left align-middle font-medium text-muted-foreground',
                  bordered && 'border-r border-border',
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              className={cn(
                'border-b transition-colors',
                striped && rowIndex % 2 === 1 && 'bg-muted/50',
                hoverable && 'hover:bg-muted/50',
                onRowClick && 'cursor-pointer'
              )}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={cn(
                    'p-4 align-middle',
                    bordered && 'border-r border-border',
                    column.cellClassName
                  )}
                >
                  {typeof column.cell === 'function' 
                    ? column.cell({ row })
                    : row[column.accessorKey]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { ResponsiveTable };