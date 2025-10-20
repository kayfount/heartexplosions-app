
'use client';

import { useState, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import * as React from 'react';
import { ExternalLink, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  enneagramType: z.string().min(1, 'Required'),
  wing: z.string().min(1, 'Required'),
  subtype: z.string().min(1, 'Required'),
  instinctualStacking: z.string().min(1, 'Required'),
  trifix: z.string().min(1, 'Required'),
});

const enneagramTypes = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const wings = ['1w9', '1w2', '2w1', '2w3', '3w2', '3w4', '4w3', '4w5', '5w4', '5w6', '6w5', '6w7', '7w6', '7w8', '8w7', '8w9', '9w8', '9w1'];
const subtypes = ['SP (Self-Preservation)', 'SX (Sexual / One-to-One)', 'SO (Social)'];
const stackings = ['sp/sx', 'sp/so', 'sx/sp', 'sx/so', 'so/sp', 'so/sx'];
const tests = [
    { name: "Free Test ($0)", vendor: "Eclectic Energies", href: "#"},
    { name: "Cost-Effective Test ($$)", vendor: "Nate Bebout", href: "#"},
    { name: "Tritype Test ($$)", vendor: "Tritype Test", href: "#"},
    { name: "Comprehensive Test ($$$)", vendor: "IEQ9", href: "#"},
]

export function DriverForm() {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enneagramType: '',
      wing: '',
      subtype: '',
      instinctualStacking: '',
      trifix: '',
    },
    mode: 'onChange'
  });

  const watchedValues = useWatch({ control: form.control });
  
  const purposeArchetype = useMemo(() => {
    const { enneagramType, wing, subtype, instinctualStacking, trifix } = watchedValues;
    
    if (!enneagramType || !wing || !subtype || !instinctualStacking || !trifix) {
        return null;
    }
    
    const subtypeCode = subtype.split(' ')[0];
    const wingCode = wing.replace(enneagramType, '');

    return `Enneagram ${enneagramType}${wingCode} ${subtypeCode} ${instinctualStacking.toUpperCase()} ${trifix}`;

  }, [watchedValues]);
  
  return (
    <div className="bg-card p-8 rounded-lg shadow-sm">
        <Form {...form}>
            <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormField
                  control={form.control}
                  name="enneagramType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dominant Enneagram Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>{enneagramTypes.map(t => <SelectItem key={t} value={t}>Type {t}</SelectItem>)}</SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="wing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strongest Wing *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select Wing" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>{wings.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="subtype"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtype *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select Subtype" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>{subtypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="instinctualStacking"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instinctual Stacking *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select Stacking" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>{stackings.map(s => <SelectItem key={s} value={s}>{s.toUpperCase()}</SelectItem>)}</SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2">
                 <FormField
                  control={form.control}
                  name="trifix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trifix/Tritype *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 125, 478" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                 />
                </div>
            </div>
            </form>
        </Form>
        <AnimatePresence>
            {purposeArchetype && (
                 <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: '24px' }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="overflow-hidden"
                 >
                    <div className="bg-secondary p-6 rounded-lg text-center">
                        <p className="text-sm font-bold text-secondary-foreground">Your Unique Purpose Archetype:</p>
                        <p className="text-lg font-bold text-accent">{purposeArchetype}</p>
                    </div>
                 </motion.div>
            )}
        </AnimatePresence>
      
      <div className="mt-12">
        <Separator />
        <div className="mt-8">
            <h3 className="text-xl font-bold font-headline mb-2">Don't know your Enneagram details?</h3>
            <p className="text-muted-foreground mb-6">Take one of these recommended tests:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tests.map(test => (
                    <a href={test.href} key={test.name} target="_blank" rel="noopener noreferrer">
                        <Card className="hover:border-primary/50 transition-colors border-2">
                            <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-bold">{test.name}</p>
                                    <p className="text-sm text-muted-foreground">{test.vendor}</p>
                                </div>
                                <ExternalLink className="size-4 text-muted-foreground" />
                            </CardContent>
                        </Card>
                    </a>
                ))}
            </div>
        </div>
      </div>
      
       <div className="mt-12 flex justify-between items-center">
            <Button variant="outline" asChild>
                <Link href="/basecamp"><ArrowLeft /> Previous</Link>
            </Button>
            <Button asChild className="bg-primary-gradient text-primary-foreground font-bold">
                <Link href="/destination">
                   Next <ArrowRight />
                </Link>
            </Button>
        </div>
    </div>
  );
}
