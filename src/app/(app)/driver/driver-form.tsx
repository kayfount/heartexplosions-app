
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Download } from 'lucide-react';
import { generateReportAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { LifePurposeReportOutput } from '@/ai/flows/generate-life-purpose-report';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  enneagramType: z.string().min(1, 'Please select your Enneagram type.'),
  wing: z.string().min(1, 'Please select your wing.'),
  instinctualStacking: z.string().min(1, 'Please select your instinctual stacking.'),
  trifix: z.string().min(1, 'Please enter your Trifix.'),
});

const enneagramTypes = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const wings = ['1w9', '1w2', '2w1', '2w3', '3w2', '3w4', '4w3', '4w5', '5w4', '5w6', '6w5', '6w7', '7w6', '7w8', '8w7', '8w9', '9w8', '9w1'];
const stackings = ['so/sp', 'so/sx', 'sp/so', 'sp/sx', 'sx/so', 'sx/sp'];

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


export function DriverForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<LifePurposeReportOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enneagramType: '',
      wing: '',
      instinctualStacking: '',
      trifix: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setReport(null);
    const result = await generateReportAction(values);
    setIsLoading(false);

    if (result.success && result.data) {
      setReport(result.data);
      toast({
        title: 'Report Generated!',
        description: 'Your Life Purpose Report is ready.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Something went wrong.',
      });
    }
  }

  const handleSelectTrifix = (trifix: string) => {
    form.setValue('trifix', trifix);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Enter Your Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="enneagramType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enneagram Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select your core type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>{enneagramTypes.map(t => <SelectItem key={t} value={t}>Type {t}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="wing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wing</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select your wing" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>{wings.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="instinctualStacking"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instinctual Stacking</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select your stacking" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>{stackings.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="trifix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trifix</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 125, 478" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isLoading} size="lg" className="w-full md:w-auto bg-primary-gradient text-primary-foreground font-bold shadow-lg">
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" /> Generate My Report</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="mt-8">
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>
                    <span className="font-bold text-lg">Need Help Choosing Your Trifix? See Options</span>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-6 p-4">
                        {trifixData.map((typeGroup, index) => (
                        <div key={typeGroup.type}>
                            <h3 className="text-lg font-bold mb-3 font-headline">Type {typeGroup.type} Dominant</h3>
                            <div className="space-y-2">
                            {typeGroup.groups.map((group, groupIndex) => (
                                <p key={groupIndex} className="text-base text-foreground/80 leading-relaxed">
                                {group.permutations.map((p, pIndex) => (
                                    <React.Fragment key={p}>
                                    <button
                                        onClick={() => handleSelectTrifix(p)}
                                        className="hover:underline hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring rounded"
                                    >
                                        {p}
                                    </button>
                                    {pIndex < group.permutations.length - 1 ? ', ' : ''}
                                    </React.Fragment>
                                ))}
                                </p>
                            ))}
                            </div>
                            {index < trifixData.length - 1 && <Separator className="mt-6" />}
                        </div>
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </div>

      <AnimatePresence>
      {report && (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
        >
        <Card className="mt-8 border-primary/50">
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle>Your Life Purpose Report</CardTitle>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> PDF</Button>
                <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Audio</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg max-w-none text-foreground/90 whitespace-pre-wrap font-body">
              {report.report}
            </div>
          </CardContent>
        </Card>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}

    