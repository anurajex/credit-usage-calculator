
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, DollarSign, TrendingUp } from "lucide-react";

interface UsageSummaryProps {
  totalMessages: number;
  totalCost: number;
}

export const UsageSummary = ({ totalMessages, totalCost }: UsageSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">Total Messages</CardTitle>
          <MessageSquare className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">{totalMessages.toLocaleString()}</div>
          <p className="text-xs text-green-600 mt-1">
            Credits consumed
          </p>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">Total Cost</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">${totalCost.toFixed(4)}</div>
          <p className="text-xs text-blue-600 mt-1">
            Total spending
          </p>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-800">Avg Cost per Message</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">
            ${totalMessages > 0 ? (totalCost / totalMessages).toFixed(4) : '0.0000'}
          </div>
          <p className="text-xs text-purple-600 mt-1">
            Cost efficiency
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
