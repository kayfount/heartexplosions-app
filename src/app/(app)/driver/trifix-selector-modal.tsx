
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { trifixData } from './trifix-data';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface TrifixSelectorModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelect: (trifix: string) => void;
  enneagramType: string | null;
}

export function TrifixSelectorModal({
  isOpen,
  onOpenChange,
  onSelect,
  enneagramType,
}: TrifixSelectorModalProps) {
  const permutationGroups = useMemo(() => {
    if (!enneagramType) return [];
    const typeData = trifixData.find(t => t.type === enneagramType);
    return typeData ? typeData.groups : [];
  }, [enneagramType]);

  const handleSelect = (permutation: string) => {
    onSelect(permutation);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card">
        <DialogHeader>
          <DialogTitle>Select Your Trifix/Tritype</DialogTitle>
          <DialogDescription>
            Based on your dominant type: {enneagramType || 'N/A'}. Click to select.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-4">
          <ScrollArea className="h-full">
            <div className="space-y-4 p-1">
              {permutationGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="grid grid-cols-6 gap-3">
                  {group.permutations.map((p) => (
                    <button
                        key={p}
                        onClick={() => handleSelect(p)}
                        className={cn(
                            "flex h-12 w-20 items-center justify-center rounded-md font-mono text-lg font-bold transition-colors",
                            "bg-primary text-primary-foreground",
                            "hover:bg-card hover:text-primary hover:border-primary border-2 border-transparent"
                        )}
                        >
                        {p}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
