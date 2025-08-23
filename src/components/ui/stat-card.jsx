import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const trendVariants = cva(
  'flex items-center text-xs font-medium',
  {
    variants: {
      trend: {
        up: 'text-green-600',
        down: 'text-red-600',
        neutral: 'text-gray-600',
      },
    },
    defaultVariants: {
      trend: 'neutral',
    },
  }
);

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend = 'neutral',
  trendValue,
  trendLabel,
  className,
  valueClassName,
  iconClassName,
  onClick,
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUp className="mr-1 h-3 w-3" />;
    if (trend === 'down') return <ArrowDown className="mr-1 h-3 w-3" />;
    return <Minus className="mr-1 h-3 w-3" />;
  };

  return (
    <Card 
      className={cn(
        'overflow-hidden transition-all hover:shadow-md', 
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className={cn("h-4 w-4 text-muted-foreground", iconClassName)} />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          <span className={cn(valueClassName)}>{value}</span>
        </div>
        {(trendValue || trendLabel) && (
          <div className={trendVariants({ trend })}>
            {getTrendIcon()}
            {trendValue && <span className="mr-1">{trendValue}</span>}
            {trendLabel && <span className="text-muted-foreground">{trendLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;