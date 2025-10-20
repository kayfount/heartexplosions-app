
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TrifixSelectorModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelectTrifix: (trifix: string) => void;
}

const trifixData = {
  "Type 1 Dominant": [ "125", "126", "127", "135", "136", "137", "145", "146", "147" ],
  "Type 2 Dominant": [ "258", "259", "268", "269", "278", "279", "215", "216", "217" ],
  "Type 3 Dominant": [ "358", "359", "368", "369", "378", "379", "315", "316", "317" ],
  "Type 4 Dominant": [ "458", "459", "468", "469", "478", "479", "415", "416", "417" ],
  "Type 5 Dominant": [ "512", "513", "514", "528", "529", "538", "539", "548", "549" ],
  "Type 6 Dominant": [ "612", "613", "614", "628", "629", "638", "639", "648", "649" ],
  "Type 7 Dominant": [ "712", "713", "714", "728", "729", "738", "739", "748", "749" ],
  "Type 8 Dominant": [ "825", "826", "827", "835", "836", "837", "845", "846", "847" ],
  "Type 9 Dominant": [ "925", "926", "927", "935", "936", "937", "945", "946", "947" ]
};

export function TrifixSelectorModal({ isOpen, onOpenChange, onSelectTrifix }: TrifixSelectorModalProps) {
  // We'll generate all permutations from the core set for display purposes.
  const generatePermutations = (trifix: string) => {
    const chars = trifix.split('');
    const result: string[] = [];
    const permute = (arr: string[], l: number, r: number) => {
      if (l === r) {
        result.push(arr.join(''));
      } else {
        for (let i = l; i <= r; i++) {
          [arr[l], arr[i]] = [arr[i], arr[l]]; // swap
          permute(arr, l + 1, r);
          [arr[l], arr[i]] = [arr[i], arr[l]]; // backtrack
        }
      }
    };
    permute(chars, 0, chars.length - 1);
    return result;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Your Trifix</DialogTitle>
          <DialogDescription>
            Click on any permutation to select it. The list below shows the core Trifix followed by all its orderings.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 pr-6">
            {Object.entries(trifixData).map(([type, trifixes]) => (
              <div key={type}>
                <h3 className="text-lg font-bold font-headline text-primary mb-2">{type}</h3>
                <div className="space-y-3">
                  {trifixes.map((coreTrifix) => (
                    <div key={coreTrifix} className="p-3 bg-secondary/50 rounded-lg">
                      <p className="font-bold text-sm mb-2">{coreTrifix} Permutations:</p>
                      <div className="flex flex-wrap gap-2">
                        {generatePermutations(coreTrifix).sort().map((p) => (
                          <button
                            key={p}
                            onClick={() => onSelectTrifix(p)}
                            className="px-3 py-1 text-sm bg-background rounded-md hover:bg-primary hover:text-primary-foreground transition-colors border-2"
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
