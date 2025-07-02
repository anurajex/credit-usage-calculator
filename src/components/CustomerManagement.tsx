
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types/customer";
import { Plus, Edit, Trash2, Users, Eye } from "lucide-react";

interface CustomerManagementProps {
  onCustomersChange: (customers: Customer[]) => void;
  onViewCustomer?: (customerId: string) => void;
}

export const CustomerManagement = ({ onCustomersChange, onViewCustomer }: CustomerManagementProps) => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    apiKey: '',
    managedAccountId: '',
    customerNumber: '',
    plan: '',
    email: '',
    openingCredit: 0,
    currentCredit: 0
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedCustomers = data.map(customer => ({
        id: customer.id,
        name: customer.name,
        apiKey: customer.api_key,
        managedAccountId: customer.managed_account_id,
        customerNumber: customer.customer_number,
        plan: customer.plan,
        email: customer.email,
        openingCredit: customer.opening_credit,
        currentCredit: customer.current_credit
      }));

      setCustomers(formattedCustomers);
      onCustomersChange(formattedCustomers);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch customers: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCustomer) {
        const { error } = await supabase
          .from('customers')
          .update({
            name: formData.name,
            api_key: formData.apiKey,
            managed_account_id: formData.managedAccountId,
            customer_number: formData.customerNumber || null,
            plan: formData.plan || null,
            email: formData.email || null,
            opening_credit: formData.openingCredit,
            current_credit: formData.currentCredit,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCustomer.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Customer updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('customers')
          .insert({
            name: formData.name,
            api_key: formData.apiKey,
            managed_account_id: formData.managedAccountId,
            customer_number: formData.customerNumber || null,
            plan: formData.plan || null,
            email: formData.email || null,
            opening_credit: formData.openingCredit,
            current_credit: formData.currentCredit,
            user_id: (await supabase.auth.getUser()).data.user?.id
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Customer created successfully.",
        });
      }

      setDialogOpen(false);
      setEditingCustomer(null);
      resetForm();
      fetchCustomers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save customer: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      apiKey: '',
      managedAccountId: '',
      customerNumber: '',
      plan: '',
      email: '',
      openingCredit: 0,
      currentCredit: 0
    });
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      apiKey: customer.apiKey,
      managedAccountId: customer.managedAccountId,
      customerNumber: customer.customerNumber || '',
      plan: customer.plan || '',
      email: customer.email || '',
      openingCredit: customer.openingCredit || 0,
      currentCredit: customer.currentCredit || 0
    });
    setDialogOpen(true);
  };

  const handleDelete = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Customer deleted successfully.",
      });

      fetchCustomers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete customer: " + error.message,
        variant: "destructive",
      });
    }
  };

  const openNewCustomerDialog = () => {
    setEditingCustomer(null);
    resetForm();
    setDialogOpen(true);
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-green-600" />
          Customer Management
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewCustomerDialog} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Customer Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerNumber">Customer Number</Label>
                  <Input
                    id="customerNumber"
                    value={formData.customerNumber}
                    onChange={(e) => setFormData({ ...formData, customerNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan">Plan</Label>
                <Select value={formData.plan} onValueChange={(value) => setFormData({ ...formData, plan: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Enterprise (USD)">Enterprise (USD)</SelectItem>
                    <SelectItem value="Growth (USD+5%)">Growth (USD+5%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="openingCredit">Opening Credit</Label>
                  <Input
                    id="openingCredit"
                    type="number"
                    step="0.0001"
                    value={formData.openingCredit}
                    onChange={(e) => setFormData({ ...formData, openingCredit: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentCredit">Current Credit</Label>
                  <Input
                    id="currentCredit"
                    type="number"
                    step="0.0001"
                    value={formData.currentCredit}
                    onChange={(e) => setFormData({ ...formData, currentCredit: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key *</Label>
                <Input
                  id="apiKey"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="managedAccountId">Managed Account ID *</Label>
                <Input
                  id="managedAccountId"
                  value={formData.managedAccountId}
                  onChange={(e) => setFormData({ ...formData, managedAccountId: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Add Customer'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {customers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No customers found. Add your first customer to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Customer #</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Credit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.customerNumber || 'N/A'}</TableCell>
                    <TableCell>{customer.plan || 'N/A'}</TableCell>
                    <TableCell>{customer.email || 'N/A'}</TableCell>
                    <TableCell>${customer.currentCredit?.toFixed(4) || '0.0000'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onViewCustomer && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewCustomer(customer.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(customer.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
