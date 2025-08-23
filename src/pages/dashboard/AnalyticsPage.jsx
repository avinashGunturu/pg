import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Users, DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState({
    occupancy: { rate: 0, trend: 0, history: [] },
    revenue: { current: 0, previous: 0, trend: 0, history: [] },
    expenses: { current: 0, previous: 0, trend: 0, history: [] },
    tenants: { new: 0, leaving: 0, renewal: 0 }
  });

  // Simulate fetching data
  useEffect(() => {
    // In a real application, this would be an API call
    setTimeout(() => {
      setAnalyticsData({
        occupancy: { 
          rate: 75, 
          trend: 5, 
          history: [65, 68, 70, 72, 75, 73, 75] 
        },
        revenue: { 
          current: 45600, 
          previous: 42300, 
          trend: 7.8, 
          history: [38000, 39500, 41000, 42300, 43800, 45600] 
        },
        expenses: { 
          current: 12400, 
          previous: 13200, 
          trend: -6.1, 
          history: [14500, 14000, 13500, 13200, 12800, 12400] 
        },
        tenants: { 
          new: 4, 
          leaving: 2, 
          renewal: 8 
        }
      });
    }, 1000);
  }, []);

  // Helper function to render trend indicators
  const renderTrend = (value, inverse = false) => {
    const isPositive = value > 0;
    const isGood = inverse ? !isPositive : isPositive;
    
    return (
      <div className={`flex items-center ${isGood ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? (
          <TrendingUp className="h-4 w-4 mr-1" />
        ) : (
          <TrendingDown className="h-4 w-4 mr-1" />
        )}
        <span>{Math.abs(value)}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </div>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          {/* Performance Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.occupancy.rate}%</div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-muted-foreground">vs Last Month</span>
                  {renderTrend(analyticsData.occupancy.trend)}
                </div>
                <div className="h-10 mt-4 flex items-end space-x-1">
                  {analyticsData.occupancy.history.map((value, index) => (
                    <div 
                      key={index} 
                      className="bg-primary-100 rounded-sm w-full" 
                      style={{ height: `${value}%` }}
                    ></div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analyticsData.revenue.current.toLocaleString()}</div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-muted-foreground">vs Last Month</span>
                  {renderTrend(analyticsData.revenue.trend)}
                </div>
                <div className="h-10 mt-4 flex items-end space-x-1">
                  {analyticsData.revenue.history.map((value, index) => (
                    <div 
                      key={index} 
                      className="bg-green-100 rounded-sm w-full" 
                      style={{ height: `${(value / Math.max(...analyticsData.revenue.history)) * 100}%` }}
                    ></div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analyticsData.expenses.current.toLocaleString()}</div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-muted-foreground">vs Last Month</span>
                  {renderTrend(analyticsData.expenses.trend, true)}
                </div>
                <div className="h-10 mt-4 flex items-end space-x-1">
                  {analyticsData.expenses.history.map((value, index) => (
                    <div 
                      key={index} 
                      className="bg-red-100 rounded-sm w-full" 
                      style={{ height: `${(value / Math.max(...analyticsData.expenses.history)) * 100}%` }}
                    ></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tenant Movement Card */}
          <Card>
            <CardHeader>
              <CardTitle>Tenant Movement</CardTitle>
              <CardDescription>New, leaving, and renewing tenants this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                  <Users className="h-8 w-8 text-green-500 mb-2" />
                  <span className="text-2xl font-bold">{analyticsData.tenants.new}</span>
                  <span className="text-sm text-gray-500">New Tenants</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-red-50 rounded-lg">
                  <Users className="h-8 w-8 text-red-500 mb-2" />
                  <span className="text-2xl font-bold">{analyticsData.tenants.leaving}</span>
                  <span className="text-sm text-gray-500">Leaving</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                  <Calendar className="h-8 w-8 text-blue-500 mb-2" />
                  <span className="text-2xl font-bold">{analyticsData.tenants.renewal}</span>
                  <span className="text-sm text-gray-500">Renewals</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Analytics</CardTitle>
              <CardDescription>Detailed financial performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Financial analytics charts will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Occupancy Analytics</CardTitle>
              <CardDescription>Property occupancy rates and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Occupancy analytics charts will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;