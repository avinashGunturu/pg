import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * DataCard component for displaying detailed information in a card format
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string} [props.description] - Optional card description
 * @param {Object} props.data - Data object containing key-value pairs to display
 * @param {Array} [props.badges] - Optional array of badge objects with label and variant
 * @param {Array} [props.actions] - Optional array of action objects with label and onClick
 * @param {string} [props.footerText] - Optional text to display in the footer
 * @param {string} [props.className] - Optional additional CSS classes
 * @param {React.ReactNode} [props.icon] - Optional icon to display next to the title
 * @param {boolean} [props.loading] - Optional loading state
 */
const DataCard = ({
  title,
  description,
  data = {},
  badges = [],
  actions = [],
  footerText,
  className,
  icon,
  loading = false,
}) => {
  // Function to render different data types appropriately
  const renderValue = (value) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">Not available</span>;
    }
    
    if (typeof value === 'boolean') {
      return value ? (
        <span className="text-green-600 font-medium">Yes</span>
      ) : (
        <span className="text-red-600 font-medium">No</span>
      );
    }
    
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return value.toString();
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon && <div className="text-primary">{icon}</div>}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {badges.length > 0 && (
            <div className="flex space-x-2">
              {badges.map((badge, index) => (
                <Badge key={index} variant={badge.variant || 'default'}>
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-1/3 animate-pulse rounded bg-muted"></div>
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-3">
            {Object.entries(data).map(([key, value], index) => (
              <div key={index} className="flex justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                <span className="font-medium text-muted-foreground">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                </span>
                <span className="text-right font-medium">{renderValue(value)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {(actions.length > 0 || footerText) && (
        <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-x-2 sm:space-y-0">
          {footerText && <p className="text-sm text-muted-foreground">{footerText}</p>}
          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size={action.size || 'sm'}
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default DataCard;