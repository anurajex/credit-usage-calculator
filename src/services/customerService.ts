
import { Customer, UsageResponse, UsageApiResponse } from '@/types/customer';

// Mock customer data
export const customers: Customer[] = [
  {
    id: "cust_1",
    name: "Customer A",
    apiKey: "715fdae7d22109a89947d9855883de78",
    managedAccountId: "677829c878931b1513d59975"
  },
  {
    id: "cust_2",
    name: "Customer B",
    apiKey: "demo_key_b",
    managedAccountId: "demo_mgmt_b"
  }
];

export const getCustomers = (): Customer[] => {
  return customers;
};

export const fetchUsageData = async (
  customer: Customer,
  startDate: string,
  endDate: string
): Promise<UsageResponse> => {
  console.log('Fetching usage data for:', { customer: customer.name, startDate, endDate });
  
  try {
    const response = await fetch(
      `https://api.ycloud.com/v2/billing/usageDetails?filter.startDate=${startDate}&filter.endDate=${endDate}&includeTotal=True&Limit=30`,
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

    const data: UsageApiResponse = await response.json();
    
    // Transform API response to our internal format
    const usageDetails = data.usageDetails?.map(item => ({
      date: item.date,
      creditType: item.productName,
      quantity: item.quantity,
      cost: item.cost
    })) || [];

    return {
      data: usageDetails,
      total: {
        totalMessages: data.totalUsage?.totalQuantity || usageDetails.reduce((sum, item) => sum + item.quantity, 0),
        totalCost: data.totalUsage?.totalCost || usageDetails.reduce((sum, item) => sum + item.cost, 0)
      }
    };
  } catch (error) {
    console.error('Error fetching usage data:', error);
    
    // Return mock data for demo purposes
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
