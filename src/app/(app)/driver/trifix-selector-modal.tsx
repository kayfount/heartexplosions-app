
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { trifixData } from './trifix-data';

interface TrifixSelectorModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelectTrifix: (trifix: string) => void;
  dominantType: string | null;
}

export function TrifixSelectorModal({
  isOpen,
  onOpenChange,
  onSelectTrifix,
  dominantType,
}: TrifixSelectorModalProps) {
  const typeData = dominantType
    ? trifixData.find((t) => t.type === dominantType)
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] flex flex-col bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-headline">
            Select Your Trifix
          </DialogTitle>
          <DialogDescription>
            Click on any number to select your Trifix. The options below are filtered by your dominant type: Type {dominantType}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow min-h-0">
          <ScrollArea className="h-full pr-6">
            <div className="space-y-4">
              {typeData?.groups.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {group.permutations.map((p) => (
                      <button
                        key={p}
                        onClick={() => onSelectTrifix(p)}
                        className={cn(
                          "px-3 py-1 rounded-md transition-colors",
                          "bg-primary text-primary-foreground",
                          "hover:bg-card hover:text-primary hover:border-primary border-2 border-transparent"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
