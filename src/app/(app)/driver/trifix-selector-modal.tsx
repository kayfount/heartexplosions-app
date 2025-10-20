
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
import { Button } from '@/components/ui/button';
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
      <DialogContent className="sm:max-w-4xl max-h-[80vh] flex flex-col">
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
            <div className="space-y-6">
              {typeData?.groups.map((group, groupIndex) => (
                <div key={groupIndex}>
                    <p className="text-base text-foreground/80 leading-relaxed">
                    {group.permutations.map((p, pIndex) => (
                        <React.Fragment key={p}>
                        <button
                            onClick={() => onSelectTrifix(p)}
                            className="hover:underline hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring rounded"
                        >
                            {p}
                        </button>
                        {pIndex < group.permutations.length - 1 ? ', ' : ''}
                        </React.Fragment>
                    ))}
                    </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
