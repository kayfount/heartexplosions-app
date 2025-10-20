
'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import { TrifixSelectorModal } from './trifix-selector-modal';

const formSchema = z.object({
  enneagramType: z.string().min(1, 'Please select your Enneagram type.'),
  wing: z.string().min(1, 'Please select your wing.'),
  instinctualStacking: z.string().min(1, 'Please select your instinctual stacking.'),
  trifix: z.string().min(1, 'Please enter your Trifix.'),
});

const enneagramTypes = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const wings = ['1w9', '1w2', '2w1', '2w3', '3w2', '3w4', '4w3', '4w5', '5w4', '5w6', '6w5', '6w7', '7w6', '7w8', '8w7', '8w9', '9w8', '9w1'];
const stackings = ['so/sp', 'so/sx', 'sp/so', 'sp/sx', 'sx/so', 'sx/sp'];

export function DriverForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<LifePurposeReportOutput | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const selectedType = useWatch({
    control: form.control,
    name: 'enneagramType',
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
    form.setValue('trifix', trifix, { shouldValidate: true });
    setIsModalOpen(false);
  };

  return (
    <>
      <TrifixSelectorModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSelectTrifix={handleSelectTrifix}
        dominantType={selectedType}
      />
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
                      <FormDescription>
                        <Button
                            type="button"
                            variant="link"
                            className="p-0 h-auto"
                            onClick={() => setIsModalOpen(true)}
                            disabled={!selectedType}
                        >
                            Need Help Choosing? See Options
                        </Button>
                      </FormDescription>
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
