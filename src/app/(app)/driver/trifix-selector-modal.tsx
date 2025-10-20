
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const trifixData = [
  {
    type: '1',
    groups: [
      { permutations: ['125', '152', '215', '251', '512', '521'] },
      { permutations: ['126', '162', '216', '261', '612', '621'] },
      { permutations: ['127', '172', '217', '271', '712', '721'] },
      { permutations: ['135', '153', '315', '351', '513', '531'] },
      { permutations: ['136', '163', '316', '361', '613', '631'] },
      { permutations: ['137', '173', '317', '371', '713', '731'] },
      { permutations: ['145', '154', '415', '451', '514', '541'] },
      { permutations: ['146', '164', '416', '461', '614', '641'] },
      { permutations: ['147', '174', '417', '471', '714', '741'] },
    ],
  },
  {
    type: '2',
    groups: [
      { permutations: ['251', '215', '521', '512', '125', '152'] },
      { permutations: ['261', '216', '621', '612', '126', '162'] },
      { permutations: ['271', '217', '721', '712', '127', '172'] },
      { permutations: ['258', '285', '528', '582', '825', '852'] },
      { permutations: ['268', '286', '628', '682', '826', '862'] },
      { permutations: ['278', '287', '728', '782', '827', '872'] },
      { permutations: ['259', '295', '529', '592', '925', '952'] },
      { permutations: ['269', '296', '629', '692', '926', '962'] },
      { permutations: ['279', '297', '729', '792', '927', '972'] },
    ],
  },
  {
    type: '3',
    groups: [
        { permutations: ['351', '315', '531', '513', '135', '153'] },
        { permutations: ['361', '316', '631', '613', '136', '163'] },
        { permutations: ['371', '317', '731', '713', '137', '173'] },
        { permutations: ['358', '385', '538', '583', '835', '853'] },
        { permutations: ['368', '386', '638', '683', '836', '863'] },
        { permutations: ['378', '387', '738', '783', '837', '873'] },
        { permutations: ['359', '395', '539', '593', '935', '953'] },
        { permutations: ['369', '396', '639', '693', '936', '963'] },
        { permutations: ['379', '397', '739', '793', '937', '973'] },
    ]
  },
  {
    type: '4',
    groups: [
        { permutations: ['451', '415', '541', '514', '145', '154'] },
        { permutations: ['461', '416', '641', '614', '146', '164'] },
        { permutations: ['471', '417', '741', '714', '147', '174'] },
        { permutations: ['458', '485', '548', '584', '845', '854'] },
        { permutations: ['468', '486', '648', '684', '846', '864'] },
        { permutations: ['478', '487', '748', '784', '847', '874'] },
        { permutations: ['459', '495', '549', '594', '945', '954'] },
        { permutations: ['469', '496', '649', '694', '946', '964'] },
        { permutations: ['479', '497', '749', '794', '947', '974'] },
    ]
  },
  {
    type: '5',
    groups: [
        { permutations: ['521', '512', '125', '152', '215', '251'] },
        { permutations: ['531', '513', '135', '153', '315', '351'] },
        { permutations: ['541', '514', '145', '154', '415', '451'] },
        { permutations: ['528', '582', '825', '852', '258', '285'] },
        { permutations: ['538', '583', '835', '853', '358', '385'] },
        { permutations: ['548', '584', '845', '854', '458', '485'] },
        { permutations: ['529', '592', '925', '952', '259', '295'] },
        { permutations: ['539', '593', '935', '953', '359', '395'] },
        { permutations: ['549', '594', '945', '954', '459', '495'] },
    ]
  },
  {
    type: '6',
    groups: [
        { permutations: ['621', '612', '126', '162', '216', '261'] },
        { permutations: ['631', '613', '136', '163', '316', '361'] },
        { permutations: ['641', '614', '146', '164', '416', '461'] },
        { permutations: ['628', '682', '826', '862', '268', '286'] },
        { permutations: ['638', '683', '836', '863', '368', '386'] },
        { permutations: ['648', '684', '846', '864', '468', '486'] },
        { permutations: ['629', '692', '926', '962', '269', '296'] },
        { permutations: ['639', '693', '936', '963', '369', '396'] },
        { permutations: ['649', '694', '946', '964', '469', '496'] },
    ]
  },
  {
    type: '7',
    groups: [
        { permutations: ['721', '712', '127', '172', '217', '271'] },
        { permutations: ['731', '713', '137', '173', '317', '371'] },
        { permutations: ['741', '714', '147', '174', '417', '471'] },
        { permutations: ['728', '782', '827', '872', '278', '287'] },
        { permutations: ['738', '783', '837', '873', '378', '387'] },
        { permutations: ['748', '784', '847', '874', '478', '487'] },
        { permutations: ['729', '792', '927', '972', '279', '297'] },
        { permutations: ['739', '793', '937', '973', '379', '397'] },
        { permutations: ['749', '794', '947', '974', '479', '497'] },
    ]
  },
  {
    type: '8',
    groups: [
        { permutations: ['825', '852', '258', '285', '528', '582'] },
        { permutations: ['835', '853', '358', '385', '538', '583'] },
        { permutations: ['845', '854', '458', '485', '548', '584'] },
        { permutations: ['826', '862', '268', '286', '628', '682'] },
        { permutations: ['836', '863', '368', '386', '638', '683'] },
        { permutations: ['846', '864', '468', '486', '648', '684'] },
        { permutations: ['827', '872', '278', '287', '728', '782'] },
        { permutations: ['837', '873', '378', '387', '738', '783'] },
        { permutations: ['847', '874', '478', '487', '748', '784'] },
    ]
  },
  {
    type: '9',
    groups: [
        { permutations: ['925', '952', '259', '295', '529', '592'] },
        { permutations: ['935', '953', '359', '395', '539', '593'] },
        { permutations: ['945', '954', '459', '495', '549', '594'] },
        { permutations: ['926', '962', '269', '296', '629', '692'] },
        { permutations: ['936', '963', '369', '396', '639', '693'] },
        { permutations: ['946', '964', '469', '496', '649', '694'] },
        { permutations: ['927', '972', '279', '297', '729', '792'] },
        { permutations: ['937', '973', '379', '397', '739', '793'] },
        { permutations: ['947', '974', '479', '497', '749', '794'] },
    ]
  }
];

interface TrifixSelectorModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelect: (trifix: string) => void;
}

export function TrifixSelectorModal({ isOpen, onOpenChange, onSelect }: TrifixSelectorModalProps) {
  const handleSelect = (trifix: string) => {
    onSelect(trifix);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Your Trifix</DialogTitle>
          <DialogDescription>
            Click on any number to select your Trifix. The list is organized by dominant type.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow min-h-0">
          <ScrollArea className="h-full">
            <div className="space-y-6 pr-6">
              {trifixData.map((typeGroup, index) => (
                <div key={typeGroup.type}>
                  <h3 className="text-lg font-bold mb-3 font-headline">Type {typeGroup.type} Dominant</h3>
                  <div className="space-y-2">
                    {typeGroup.groups.map((group, groupIndex) => (
                      <p key={groupIndex} className="text-base text-foreground/80 leading-relaxed">
                        {group.permutations.map((p, pIndex) => (
                          <button
                            key={p}
                            onClick={() => handleSelect(p)}
                            className="hover:underline hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring rounded"
                          >
                            {p}{pIndex < group.permutations.length - 1 ? ', ' : ''}
                          </button>
                        ))}
                      </p>
                    ))}
                  </div>
                  {index < trifixData.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

    