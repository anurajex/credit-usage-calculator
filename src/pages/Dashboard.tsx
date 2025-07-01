
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCustomers, fetchUsageData, saveLastSelection, getLastSelection } from "@/services/customerService";
import { Customer, UsageDetail } from "@/types/customer";
import { UsageTable } from "@/components/UsageTable";
import { UsageSummary } from "@/components/UsageSummary";
import { CustomerManagement } from "@/components/CustomerManagement";
import { DatePicker } from "@/components/DatePicker";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [usageData, setUsageData] = useState<UsageDetail[]>([]);
  const [totalMessages, setTotalMessages] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [showCustomerManagement, setShowCustomerManagement] = useState<boolean>(false);

  // Load customers and set default dates on component mount
  useEffect(() => {
    loadCustomers();
    setDefaultDates();
  }, []);

  const loadCustomers = async () => {
    const customerList = await getCustomers();
    setCustomers(customerList);
  };

  const setDefaultDates = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(firstDay);
    setEndDate(lastDay);
  };

  const handleCustomersChange = (newCustomers: Customer[]) => {
    setCustomers(newCustomers);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleFetchUsage = async () => {
    if (!selectedCustomer) {
      toast({
        title: "Customer Required",
        description: "Please select a customer before fetching usage data.",
        variant: "destructive",
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: "Date Range Required",
        description: "Please select both start and end dates.",
        variant: "destructive",
      });
      return;
    }

    if (startDate > endDate) {
      toast({
        title: "Invalid Date Range",
        description: "Start date must be before end date.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    console.log('Fetching usage data...');

    try {
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const response = await fetchUsageData(selectedCustomer, startDateStr, endDateStr);
      setUsageData(response.data);
      setTotalMessages(response.total.totalMessages);
      setTotalCost(response.total.totalCost);

      // Save selection to localStorage
      saveLastSelection(selectedCustomer.id, startDateStr, endDateStr);

      toast({
        title: "Success",
        description: `Fetched ${response.data.length} usage records for ${selectedCustomer.name}.`,
      });
    } catch (error) {
      console.error('Error fetching usage data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch usage data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (usageData.length === 0) {
      toast({
        title: "No Data",
        description: "No usage data available to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = ['Date', 'Credit Type', 'Quantity', 'Cost'];
    const csvContent = [
      headers.join(','),
      ...usageData.map(row => [
        row.date,
        row.creditType,
        row.quantity,
        row.cost.toFixed(4)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usage-report-${selectedCustomer?.name}-${startDate?.toISOString().split('T')[0]}-${endDate?.toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Usage data has been exported to CSV.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-slate-900">Credit Usage Dashboard</h1>
            <p className="text-slate-600">Welcome back, {user?.email}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCustomerManagement(!showCustomerManagement)}
            >
              {showCustomerManagement ? 'Hide' : 'Manage'} Customers
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Customer Management */}
        {showCustomerManagement && (
          <CustomerManagement onCustomersChange={handleCustomersChange} />
        )}

        {/* Controls */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-green-600" />
              Usage Query
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="customer-select">Customer</Label>
                <Select value={selectedCustomer?.id || ''} onValueChange={(value) => {
                  const customer = customers.find(c => c.id === value);
                  setSelectedCustomer(customer || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <DatePicker
                  date={startDate}
                  onDateChange={setStartDate}
                  placeholder="Select start date"
                />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <DatePicker
                  date={endDate}
                  onDateChange={setEndDate}
                  placeholder="Select end date"
                />
              </div>

              <Button 
                onClick={handleFetchUsage} 
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Fetch Usage
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        {(totalMessages > 0 || totalCost > 0) && (
          <UsageSummary totalMessages={totalMessages} totalCost={totalCost} />
        )}

        {/* Usage Table */}
        <UsageTable data={usageData} onExportCSV={exportToCSV} />
      </div>
    </div>
  );
};

export default Dashboard;
