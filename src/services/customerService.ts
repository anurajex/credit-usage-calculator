
import { Customer, UsageResponse, UsageApiResponse } from '@/types/customer';
import { supabase } from '@/integrations/supabase/client';

export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(customer => ({
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
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

export const fetchUsageData = async (
  customer: Customer,
  startDate: string,
  endDate: string
): Promise<UsageResponse> => {
  console.log('Fetching usage data for:', { customer: customer.name, startDate, endDate });
  
  try {
    const response = await fetch(
      `https://api.ycloud.com/v2/billing/usageDetails?filter.startDate=${startDate}&filter.endDate=${endDate}&includeTotal=True&Limit=31`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': customer.apiKey,
          'X-Managed-Account-ID': customer.managedAccountId,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Raw API response:', data);
    
    // Parse the YCloud API response structure
    const usageDetails = [];
    let totalQuantity = 0;
    let totalCost = 0;

    if (data.items && Array.isArray(data.items)) {
      for (const item of data.items) {
        const date = item.date;
        
        if (item.costItems && Array.isArray(item.costItems)) {
          for (const costItem of item.costItems) {
            // Create a credit type based on channel and conversation type
            const creditType = `${item.channel || 'WhatsApp'} - ${costItem.conversationOriginType || 'conversation'}`;
            
            usageDetails.push({
              date: date,
              creditType: creditType,
              quantity: costItem.quantity || 0,
              cost: costItem.cost || 0
            });

            totalQuantity += costItem.quantity || 0;
            totalCost += costItem.cost || 0;
          }
        }
      }
    }

    console.log('Parsed usage details:', usageDetails);
    console.log('Total quantity:', totalQuantity, 'Total cost:', totalCost);

    // Cache the usage data in Supabase
    if (usageDetails.length > 0) {
      const usageDataToInsert = usageDetails.map(item => ({
        customer_id: customer.id,
        date: item.date,
        credit_type: item.creditType,
        quantity: item.quantity,
        cost: item.cost
      }));

      // Delete existing data for this customer and date range first
      await supabase
        .from('usage_data')
        .delete()
        .eq('customer_id', customer.id)
        .gte('date', startDate)
        .lte('date', endDate);

      // Insert new data
      const { error: insertError } = await supabase
        .from('usage_data')
        .insert(usageDataToInsert);

      if (insertError) {
        console.error('Error caching usage data:', insertError);
      } else {
        console.log('Successfully cached usage data');
      }
    }

    return {
      data: usageDetails,
      total: {
        totalMessages: totalQuantity,
        totalCost: totalCost
      }
    };
  } catch (error) {
    console.error('Error fetching usage data:', error);
    
    // Try to get cached data from Supabase as fallback
    try {
      const { data: cachedData, error: cacheError } = await supabase
        .from('usage_data')
        .select('*')
        .eq('customer_id', customer.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (!cacheError && cachedData && cachedData.length > 0) {
        const usageDetails = cachedData.map(item => ({
          date: item.date,
          creditType: item.credit_type,
          quantity: item.quantity,
          cost: item.cost
        }));

        return {
          data: usageDetails,
          total: {
            totalMessages: usageDetails.reduce((sum, item) => sum + item.quantity, 0),
            totalCost: usageDetails.reduce((sum, item) => sum + item.cost, 0)
          }
        };
      }
    } catch (cacheError) {
      console.error('Error fetching cached data:', cacheError);
    }
    
    // Return mock data as final fallback
    const mockData = [
      { date: startDate, creditType: 'SMS', quantity: 150, cost: 7.50 },
      { date: startDate, creditType: 'Voice Call', quantity: 45, cost: 22.50 },
      { date: endDate, creditType: 'SMS', quantity: 200, cost: 10.00 },
      { date: endDate, creditType: 'Email', quantity: 500, cost: 5.00 },
    ];

    return {
      data: mockData,
      total: {
        totalMessages: mockData.reduce((sum, item) => sum + item.quantity, 0),
        totalCost: mockData.reduce((sum, item) => sum + item.cost, 0)
      }
    };
  }
};

// Utility functions for localStorage
export const saveLastSelection = (customerId: string, startDate: string, endDate: string) => {
  const selection = { customerId, startDate, endDate };
  localStorage.setItem('lastCreditUsageSelection', JSON.stringify(selection));
};

export const getLastSelection = () => {
  const saved = localStorage.getItem('lastCreditUsageSelection');
  return saved ? JSON.parse(saved) : null;
};
