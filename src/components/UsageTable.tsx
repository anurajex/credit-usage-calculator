
import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsageDetail } from "@/types/customer";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageTypeFilter } from "./MessageTypeFilter";

interface UsageTableProps {
  data: UsageDetail[];
  onExportCSV: () => void;
}

export const UsageTable = ({ data, onExportCSV }: UsageTableProps) => {
  const [messageTypeFilters, setMessageTypeFilters] = useState<string[]>([]);

  const filteredData = useMemo(() => {
    if (messageTypeFilters.length === 0) return data;
    
    return data.filter(item => {
      const creditType = item.creditType.toLowerCase();
      return messageTypeFilters.some(filter => 
        creditType.includes(filter.toLowerCase()) ||
        (filter === 'Authentication' && creditType.includes('auth')) ||
        (filter === 'Marketing' && creditType.includes('market')) ||
        (filter === 'Utility' && creditType.includes('util'))
      );
    });
  }, [data, messageTypeFilters]);

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No usage data available. Select a customer and date range to fetch data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Usage Details</CardTitle>
        <div className="flex items-center gap-2">
          <MessageTypeFilter onFilterChange={setMessageTypeFilters} />
          <Button variant="outline" size="sm" onClick={onExportCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Credit Type</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Cost ($)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{item.creditType}</TableCell>
                  <TableCell className="text-right">{item.quantity.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${item.cost.toFixed(4)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filteredData.length !== data.length && (
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredData.length} of {data.length} records
          </div>
        )}
      </CardContent>
    </Card>
  );
};
