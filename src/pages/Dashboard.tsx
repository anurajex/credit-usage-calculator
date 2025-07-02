
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCustomers, fetchUsageData, saveLastSelection, getLastSelection } from "@/services/customerService";
import { Customer, UsageDetail } from "@/types/customer";
import { UsageTable } from "@/components/UsageTable";
import { UsageSummary } from "@/components/UsageSummary";
import { CustomerManagement } from "@/components/CustomerManagement";
import { CustomerView } from "@/components/CustomerView";
import { Sidebar } from "@/components/Sidebar";
import { DatePicker } from "@/components/DatePicker";
import { Settings } from "@/components/Settings";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [usageData, setUsageData] = useState<UsageDetail[]>([]);
  const [totalMessages, setTotalMessages] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeModule, setActiveModule] = useState<string>('usage');
  const [viewingCustomerId, setViewingCustomerId] = useState<string | null>(null);

  // Load customers and last selection on component mount
  useEffect(() => {
    loadCustomers();
    loadLastSelection();
  }, []);

  const loadCustomers = async () => {
    const customerList = await getCustomers();
    setCustomers(customerList);
  };

  const loadLastSelection = () => {
    const lastSelection = getLastSelection();
    if (lastSelection) {
      const customer = customers.find(c => c.id === lastSelection.customerId);
      if (customer) {
        setSelectedCustomer(customer);
        setStartDate(lastSelection.startDate);
        setEndDate(lastSelection.endDate);
      }
    } else {
      // Set default dates to current month
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(lastDay.toISOString().split('T')[0]);
    }
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

    if (new Date(startDate) > new Date(endDate)) {
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
      const response = await fetchUsageData(selectedCustomer, startDate, endDate);
      setUsageData(response.data);
      setTotalMessages(response.total.totalMessages);
      setTotalCost(response.total.totalCost);

      // Save selection to localStorage
      saveLastSelection(selectedCustomer.id, startDate, endDate);

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
    a.download = `usage-report-${selectedCustomer?.name}-${startDate}-${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Usage data has been exported to CSV.",
    });
  };

  const renderContent = () => {
    if (viewingCustomerId) {
      return (
        <CustomerView
          customerId={viewingCustomerId}
          onBack={() => setViewingCustomerId(null)}
        />
      );
    }

    switch (activeModule) {
      case 'customers':
        return (
          <CustomerManagement
            onCustomersChange={handleCustomersChange}
            onViewCustomer={setViewingCustomerId}
          />
        );
      
      case 'usage':
        return (
          <div className="space-y-6">
            {/* Controls */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  Usage Query
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
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

                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={setStartDate}
                    placeholder="Select start date"
                  />

                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                    placeholder="Select end date"
                  />

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
        );

      case 'settings':
        return <Settings />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      <Sidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        onSignOut={handleSignOut}
      />
      
      <div className="flex-1 lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-slate-900">Credit Usage Dashboard</h1>
            <p className="text-slate-600">Welcome back, {user?.email}</p>
          </div>

          {/* Content */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
