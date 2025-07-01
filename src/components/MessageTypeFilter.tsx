
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";

interface MessageTypeFilterProps {
  onFilterChange: (activeFilters: string[]) => void;
}

export const MessageTypeFilter = ({ onFilterChange }: MessageTypeFilterProps) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const messageTypes = [
    { id: 'marketing', label: 'Marketing', value: 'marketing' },
    { id: 'utility', label: 'Utility', value: 'utility' },
    { id: 'authentication', label: 'Authentication', value: 'authentication' }
  ];

  const handleFilterToggle = (filterValue: string, checked: boolean) => {
    let newFilters;
    if (checked) {
      newFilters = [...activeFilters, filterValue];
    } else {
      newFilters = activeFilters.filter(f => f !== filterValue);
    }
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Filter className="h-4 w-4" />
          Message Type Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          {messageTypes.map((type) => (
            <div key={type.id} className="flex items-center space-x-2">
              <Checkbox
                id={type.id}
                checked={activeFilters.includes(type.value)}
                onCheckedChange={(checked) => 
                  handleFilterToggle(type.value, checked as boolean)
                }
              />
              <Label htmlFor={type.id} className="text-sm font-medium">
                {type.label}
              </Label>
            </div>
          ))}
        </div>
        {activeFilters.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Filtering by: {activeFilters.join(', ')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
