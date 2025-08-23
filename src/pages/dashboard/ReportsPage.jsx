import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, Download, Printer, Filter } from 'lucide-react';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('financial');

  const reportTypes = {
    financial: [
      { id: 1, name: 'Monthly Revenue Report', date: '2023-06-01', status: 'Ready' },
      { id: 2, name: 'Quarterly Financial Summary', date: '2023-04-01', status: 'Ready' },
      { id: 3, name: 'Annual Financial Report', date: '2023-01-01', status: 'Ready' },
      { id: 4, name: 'Expense Breakdown', date: '2023-06-01', status: 'Ready' },
    ],
    property: [
      { id: 5, name: 'Property Occupancy Report', date: '2023-06-01', status: 'Ready' },
      { id: 6, name: 'Maintenance Cost Report', date: '2023-06-01', status: 'Ready' },
      { id: 7, name: 'Property Valuation Report', date: '2023-01-01', status: 'Ready' },
    ],
    tenant: [
      { id: 8, name: 'Tenant Payment History', date: '2023-06-01', status: 'Ready' },
      { id: 9, name: 'Lease Expiration Report', date: '2023-06-01', status: 'Ready' },
      { id: 10, name: 'Tenant Satisfaction Survey', date: '2023-05-15', status: 'Ready' },
    ],
    operational: [
      { id: 11, name: 'Employee Performance Report', date: '2023-06-01', status: 'Ready' },
      { id: 12, name: 'Inventory Status Report', date: '2023-06-01', status: 'Ready' },
      { id: 13, name: 'Maintenance Request Summary', date: '2023-06-01', status: 'Ready' },
    ],
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  const handleDownload = (reportId) => {
    console.log(`Downloading report ${reportId}`);
    // In a real application, this would trigger a download
  };

  const handlePrint = (reportId) => {
    console.log(`Printing report ${reportId}`);
    // In a real application, this would open a print dialog
  };

  const handleGenerateReport = () => {
    console.log(`Generating new ${activeTab} report`);
    // In a real application, this would trigger report generation
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <Button onClick={handleGenerateReport}>
          <FileText className="mr-2 h-4 w-4" />
          Generate New Report
        </Button>
      </div>

      <Tabs defaultValue="financial" className="space-y-4" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="property">Property</TabsTrigger>
          <TabsTrigger value="tenant">Tenant</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
        </TabsList>

        {Object.keys(reportTypes).map((reportCategory) => (
          <TabsContent key={reportCategory} value={reportCategory} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="capitalize">{reportCategory} Reports</CardTitle>
                    <CardDescription>
                      View and download {reportCategory.toLowerCase()} related reports
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 bg-muted p-4 font-medium">
                    <div className="col-span-5">Report Name</div>
                    <div className="col-span-3">Date</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                  {reportTypes[reportCategory].map((report) => (
                    <div key={report.id} className="grid grid-cols-12 p-4 border-t items-center">
                      <div className="col-span-5 font-medium">{report.name}</div>
                      <div className="col-span-3 text-gray-500">{report.date}</div>
                      <div className="col-span-2">
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                          {report.status}
                        </span>
                      </div>
                      <div className="col-span-2 flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(report.id)}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePrint(report.id)}
                          title="Print"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generate Custom {reportCategory} Report</CardTitle>
                <CardDescription>
                  Create a customized report with specific parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center border rounded-md">
                  <p className="text-muted-foreground">Custom report generation form will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ReportsPage;