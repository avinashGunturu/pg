import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// This is a placeholder component that would use a chart library like Chart.js or Recharts
// In a real implementation, you would need to install and import the actual chart library
// For example: import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BarChart = ({
  title,
  data,
  categories = [],
  index,
  colors = ['#2563eb', '#16a34a', '#dc2626', '#ca8a04'],
  valueFormatter,
  layout = 'vertical',
  showLegend = true,
  showGridLines = true,
  height = 300,
  className,
}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    // This is where you would initialize your chart library
    // For example with Chart.js:
    // if (chartRef.current) {
    //   const chart = new Chart(chartRef.current, {
    //     type: 'bar',
    //     data: {
    //       labels: data.map(item => item[index]),
    //       datasets: categories.map((category, i) => ({
    //         label: category.name,
    //         data: data.map(item => item[category.key]),
    //         backgroundColor: colors[i % colors.length],
    //       })),
    //     },
    //     options: { ... }
    //   });
    //   return () => chart.destroy();
    // }

    // For now, we'll just log the data to show what would be rendered
    console.log('Bar Chart data:', { data, categories, index, layout });
  }, [data, categories, index, colors, layout, showGridLines]);

  // Placeholder for chart rendering
  const renderPlaceholderChart = () => {
    if (!data || data.length === 0) {
      return <div className="flex h-[200px] items-center justify-center">No data available</div>;
    }

    return (
      <div className="relative h-full w-full">
        {/* This is a placeholder visualization */}
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Bar Chart visualization would appear here.
            <br />
            Install a chart library like Recharts or Chart.js.
          </p>
        </div>
        <div className="absolute inset-0">
          <div className="flex h-full w-full justify-around items-end pb-10">
            {data.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div 
                  className="w-10 bg-primary/70 rounded-t-sm" 
                  style={{ 
                    height: `${Math.random() * 100 + 20}px`,
                    backgroundColor: colors[idx % colors.length]
                  }}
                ></div>
                <span className="text-xs mt-2 text-muted-foreground">
                  {item[index]?.toString().substring(0, 4) || `Item ${idx}`}
                </span>
              </div>
            ))}
          </div>
        </div>
        {showLegend && (
          <div className="absolute bottom-2 left-0 right-0 flex flex-wrap justify-center gap-4">
            {categories.map((category, i) => (
              <div key={category.key} className="flex items-center">
                <div
                  className="mr-1.5 h-3 w-3 rounded-sm"
                  style={{ backgroundColor: colors[i % colors.length] }}
                />
                <span className="text-xs">{category.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div style={{ height: `${height}px` }} className="w-full">
          {/* In a real implementation, you would render your chart library here */}
          {/* <canvas ref={chartRef} /> */}
          {renderPlaceholderChart()}
        </div>
      </CardContent>
    </Card>
  );
};

export default BarChart;