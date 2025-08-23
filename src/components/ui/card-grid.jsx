import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/hooks';
import { Card } from './card';

/**
 * CardGrid component for displaying items in a responsive grid
 * 
 * @param {Object} props - Component props
 * @param {Array} props.items - Array of items to display
 * @param {Function} props.renderItem - Function to render each item
 * @param {string} [props.className] - Additional CSS classes
 * @param {number} [props.cols] - Default number of columns
 * @param {number} [props.smCols] - Number of columns on small screens
 * @param {number} [props.mdCols] - Number of columns on medium screens
 * @param {number} [props.lgCols] - Number of columns on large screens
 * @param {number} [props.xlCols] - Number of columns on extra large screens
 * @param {string} [props.gap] - Gap between grid items
 * @param {boolean} [props.loading] - Whether the grid is loading
 * @param {number} [props.loadingItems] - Number of loading items to display
 */
const CardGrid = ({
  items = [],
  renderItem,
  className,
  cols = 1,
  smCols = 2,
  mdCols = 3,
  lgCols = 4,
  xlCols = 4,
  gap = '1rem',
  loading = false,
  loadingItems = 6,
}) => {
  const { current } = useBreakpoint();
  
  // Determine the number of columns based on the current breakpoint
  const getColumns = () => {
    switch (current) {
      case 'xs':
        return cols;
      case 'sm':
        return smCols;
      case 'md':
        return mdCols;
      case 'lg':
        return lgCols;
      case 'xl':
      case '2xl':
        return xlCols;
      default:
        return cols;
    }
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${getColumns()}, minmax(0, 1fr))`,
    gap,
  };

  // Generate loading placeholders
  const renderLoadingItems = () => {
    return Array(loadingItems)
      .fill(0)
      .map((_, index) => (
        <Card key={`loading-${index}`} className="animate-pulse">
          <div className="p-4 space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
          </div>
        </Card>
      ));
  };

  return (
    <div className={cn('w-full', className)} style={gridStyle}>
      {loading
        ? renderLoadingItems()
        : items.map((item, index) => (
            <div key={item.id || index}>
              {renderItem(item, index)}
            </div>
          ))}
    </div>
  );
};

export { CardGrid };