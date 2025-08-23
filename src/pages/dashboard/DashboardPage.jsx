import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Users, Package, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    properties: { total: 0, occupied: 0, vacant: 0, maintenance: 0 },
    tenants: { total: 0, active: 0, pending: 0, overdue: 0 },
    employees: { total: 0, active: 0 },
    inventory: { total: 0, lowStock: 0 },
    financial: { revenue: 0, expenses: 0, pending: 0 }
  });

  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', message: 'Rent payment overdue for 3 tenants', date: '2023-06-15' },
    { id: 2, type: 'info', message: 'Maintenance scheduled for Property #1024', date: '2023-06-18' },
    { id: 3, type: 'success', message: 'New tenant lease signed for Unit #304', date: '2023-06-14' },
    { id: 4, type: 'warning', message: 'Inventory item "Light Bulbs" running low', date: '2023-06-13' },
  ]);

  // Simulate fetching data
  useEffect(() => {
    // In a real application, this would be an API call
    setTimeout(() => {
      setStats({
        properties: { total: 24, occupied: 18, vacant: 4, maintenance: 2 },
        tenants: { total: 32, active: 28, pending: 1, overdue: 3 },
        employees: { total: 12, active: 11 },
        inventory: { total: 156, lowStock: 8 },
        financial: { revenue: 45600, expenses: 12400, pending: 3200 }
      });
    }, 1000);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Properties</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.properties.total}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stats.properties.occupied} Occupied, {stats.properties.vacant} Vacant
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tenants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.tenants.total}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stats.tenants.active} Active, {stats.tenants.overdue} Overdue
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inventory</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inventory.total}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stats.inventory.lowStock} Items Low Stock
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.financial.revenue.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  ${stats.financial.pending.toLocaleString()} Pending
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts Section */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>Important notifications requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`flex items-center p-3 rounded-lg ${alert.type === 'warning' ? 'bg-amber-50' : alert.type === 'success' ? 'bg-green-50' : 'bg-blue-50'}`}
                  >
                    {alert.type === 'warning' ? (
                      <AlertTriangle className={`h-5 w-5 mr-3 text-amber-500`} />
                    ) : alert.type === 'success' ? (
                      <CheckCircle className={`h-5 w-5 mr-3 text-green-500`} />
                    ) : (
                      <Building className={`h-5 w-5 mr-3 text-blue-500`} />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-gray-500">{alert.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>View detailed analytics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Analytics charts will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generate and view reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Reports functionality will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;