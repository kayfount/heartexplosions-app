'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface TrifixSelectorModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelectTrifix: (trifix: string) => void;
}

const trifixData = {
    "Type 1 Dominant": [
        "125, 152, 215, 251, 512, 521", "126, 162, 216, 261, 612, 621", "127, 172, 217, 271, 712, 721",
        "135, 153, 315, 351, 513, 531", "136, 163, 316, 361, 613, 631", "137, 173, 317, 371, 713, 731",
        "145, 154, 415, 451, 514, 541", "146, 164, 416, 461, 614, 641", "147, 174, 417, 471, 714, 741"
    ],
    "Type 2 Dominant": [
        "251, 215, 521, 512, 125, 152", "261, 216, 621, 612, 126, 162", "271, 217, 721, 712, 127, 172",
        "258, 285, 528, 582, 825, 852", "268, 286, 628, 682, 826, 862", "278, 287, 728, 782, 827, 872",
        "259, 295, 529, 592, 925, 952", "269, 296, 629, 692, 926, 962", "279, 297, 729, 792, 927, 972"
    ],
    "Type 3 Dominant": [
        "351, 315, 531, 513, 135, 153", "361, 316, 631, 613, 136, 163", "371, 317, 731, 713, 137, 173",
        "358, 385, 538, 583, 835, 853", "368, 386, 638, 683, 836, 863", "378, 387, 738, 783, 837, 873",
        "359, 395, 539, 593, 935, 953", "369, 396, 639, 693, 936, 963", "379, 397, 739, 793, 937, 973"
    ],
    "Type 4 Dominant": [
        "451, 415, 541, 514, 145, 154", "461, 416, 641, 614, 146, 164", "471, 417, 741, 714, 147, 174",
        "458, 485, 548, 584, 845, 854", "468, 486, 648, 684, 846, 864", "478, 487, 748, 784, 847, 874",
        "459, 495, 549, 594, 945, 954", "469, 496, 649, 694, 946, 964", "479, 497, 749, 794, 947, 974"
    ],
    "Type 5 Dominant": [
        "521, 512, 125, 152, 215, 251", "531, 513, 135, 153, 315, 351", "541, 514, 145, 154, 415, 451",
        "528, 582, 825, 852, 258, 285", "538, 583, 835, 853, 358, 385", "548, 584, 845, 854, 458, 485",
        "529, 592, 925, 952, 259, 295", "539, 593, 935, 953, 359, 395", "549, 594, 945, 954, 459, 495"
    ],
    "Type 6 Dominant": [
        "621, 612, 126, 162, 216, 261", "631, 613, 136, 163, 316, 361", "641, 614, 146, 164, 416, 461",
        "628, 682, 826, 862, 268, 286", "638, 683, 836, 863, 368, 386", "648, 684, 846, 864, 468, 486",
        "629, 692, 926, 962, 269, 296", "639, 693, 936, 963, 369, 396", "649, 694, 946, 964, 469, 496"
    ],
    "Type 7 Dominant": [
        "721, 712, 127, 172, 217, 271", "731, 713, 137, 173, 317, 371", "741, 714, 147, 174, 417, 471",
        "728, 782, 827, 872, 278, 287", "738, 783, 837, 873, 378, 387", "748, 784, 847, 874, 478, 487",
        "729, 792, 927, 972, 279, 297", "739, 793, 937, 973, 379, 397", "749, 794, 947, 974, 479, 497"
    ],
    "Type 8 Dominant": [
        "825, 852, 258, 285, 528, 582", "835, 853, 358, 385, 538, 583", "845, 854, 458, 485, 548, 584",
        "826, 862, 268, 286, 628, 682", "836, 863, 368, 386, 638, 683", "846, 864, 468, 486, 648, 684",
        "827, 872, 278, 287, 728, 782", "837, 873, 378, 387, 738, 783", "847, 874, 478, 487, 748, 784"
    ],
    "Type 9 Dominant": [
        "925, 952, 259, 295, 529, 592", "935, 953, 359, 395, 539, 593", "945, 954, 459, 495, 549, 594",
        "926, 962, 269, 296, 629, 692", "936, 963, 369, 396, 639, 693", "946, 964, 469, 496, 649, 694",
        "927, 972, 279, 297, 729, 792", "937, 973, 379, 397, 739, 793", "947, 974, 479, 497, 749, 794"
    ]
};

export function TrifixSelectorModal({ isOpen, onOpenChange, onSelectTrifix }: TrifixSelectorModalProps) {
  const handleSelect = (trifix: string) => {
    onSelectTrifix(trifix);
  };

  const trifixEntries = Object.entries(trifixData);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Your Trifix</DialogTitle>
          <DialogDescription>
            Click on any number to select your Trifix. The list is organized by dominant type.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-6">
          <div className="space-y-6">
            {trifixEntries.map(([type, permutations], index) => (
              <div key={type}>
                <h3 className="text-lg font-bold font-headline text-primary mb-2">{type}</h3>
                <div className="space-y-2">
                  {permutations.map((line, lineIndex) => (
                    <div key={lineIndex} className="flex flex-wrap gap-x-2 gap-y-1 text-sm">
                      {line.split(', ').map((p) => (
                        <button
                          key={p}
                          onClick={() => handleSelect(p)}
                          className="px-2 py-0.5 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
                {index < trifixEntries.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
