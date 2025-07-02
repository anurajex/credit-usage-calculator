
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, CreditCard, Mail, Hash } from "lucide-react";
import { Customer } from "@/types/customer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CustomerViewProps {
  customerId: string;
  onBack: () => void;
}

export const CustomerView = ({ customerId, onBack }: CustomerViewProps) => {
  const { toast } = useToast();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (error) throw error;

      setCustomer({
        id: data.id,
        name: data.name,
        apiKey: data.api_key,
        managedAccountId: data.managed_account_id,
        customerNumber: data.customer_number,
        plan: data.plan,
        email: data.email,
        openingCredit: data.opening_credit,
        currentCredit: data.current_credit
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch customer details: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Customer not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
        <h1 className="text-2xl font-bold">{customer.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Customer Name</label>
              <p className="font-medium">{customer.name}</p>
            </div>
            
            {customer.customerNumber && (
              <div>
                <label className="text-sm font-medium text-gray-500">Customer Number</label>
                <p className="font-medium flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  {customer.customerNumber}
                </p>
              </div>
            )}

            {customer.email && (
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {customer.email}
                </p>
              </div>
            )}

            {customer.plan && (
              <div>
                <label className="text-sm font-medium text-gray-500">Plan</label>
                <div className="mt-1">
                  <Badge variant="outline">{customer.plan}</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Credit Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Credit Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Opening Credit</label>
              <p className="text-2xl font-bold text-green-600">
                ${customer.openingCredit?.toFixed(4) || '0.0000'}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Current Credit</label>
              <p className="text-2xl font-bold text-blue-600">
                ${customer.currentCredit?.toFixed(4) || '0.0000'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Credit Used</label>
              <p className="text-lg font-medium text-red-600">
                ${((customer.openingCredit || 0) - (customer.currentCredit || 0)).toFixed(4)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">API Key</label>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                {customer.apiKey.substring(0, 20)}...
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Managed Account ID</label>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                {customer.managedAccountId}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
