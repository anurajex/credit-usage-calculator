
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter } from "lucide-react";

interface MessageTypeFilterProps {
  onFilterChange: (filters: string[]) => void;
}

export const MessageTypeFilter = ({ onFilterChange }: MessageTypeFilterProps) => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const messageTypes = [
    'Marketing',
    'Utility', 
    'Authentication'
  ];

  const handleFilterToggle = (messageType: string) => {
    const newFilters = selectedFilters.includes(messageType)
      ? selectedFilters.filter(f => f !== messageType)
      : [...selectedFilters, messageType];
    
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setSelectedFilters([]);
    onFilterChange([]);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter Messages
            {selectedFilters.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedFilters.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Message Types</h4>
              {selectedFilters.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {messageTypes.map((messageType) => (
                <div key={messageType} className="flex items-center space-x-2">
                  <Checkbox
                    id={messageType}
                    checked={selectedFilters.includes(messageType)}
                    onCheckedChange={() => handleFilterToggle(messageType)}
                  />
                  <label
                    htmlFor={messageType}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {messageType}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {selectedFilters.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedFilters.map((filter) => (
            <Badge key={filter} variant="secondary" className="text-xs">
              {filter}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
