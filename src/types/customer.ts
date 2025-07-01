
export interface Customer {
  id: string;
  name: string;
  apiKey: string;
  managedAccountId: string;
}

export interface UsageDetail {
  date: string;
  creditType: string;
  quantity: number;
  cost: number;
}

export interface UsageResponse {
  data: UsageDetail[];
  total: {
    totalMessages: number;
    totalCost: number;
  };
}

export interface UsageApiResponse {
  usageDetails: Array<{
    date: string;
    productName: string;
    quantity: number;
    cost: number;
  }>;
  totalUsage?: {
    totalQuantity: number;
    totalCost: number;
  };
}
