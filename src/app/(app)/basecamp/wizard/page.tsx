'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Flag, PartyPopper } from 'lucide-react';

const totalSteps = 5;

const values = ["Authenticity", "Growth", "Community", "Creativity", "Freedom", "Impact", "Security", "Adventure", "Wisdom", "Kindness", "Discipline", "Joy"];

export default function BasecampWizardPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    season: '',
    values: [] as string[],
    strengths: '',
    timeBudget: '',
  });

  const handleNext = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));
  
  const handleValueChange = (value: string) => {
    setFormData(prev => {
        const newValues = prev.values.includes(value) 
            ? prev.values.filter(v => v !== value)
            : [...prev.values, value];
        return { ...prev, values: newValues };
    });
  };

  const progress = (step / totalSteps) * 100;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div key={1} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <CardHeader>
              <CardTitle>Welcome to Basecamp!</CardTitle>
              <CardDescription>Let's begin your expedition by understanding where you are right now.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg">This short wizard will help you create a snapshot of your current life landscape. This isn't a test—it's a tool for clarity.</p>
            </CardContent>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key={2} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <CardHeader>
              <CardTitle>Step 1: Your Core Values</CardTitle>
              <CardDescription>What matters most to you? Select up to 5 core values that resonate deeply.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {values.map(value => (
                <div key={value} className="flex items-center space-x-2">
                    <Checkbox id={value} checked={formData.values.includes(value)} onCheckedChange={() => handleValueChange(value)} disabled={formData.values.length >= 5 && !formData.values.includes(value)} />
                    <label htmlFor={value} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{value}</label>
                </div>
              ))}
            </CardContent>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key={3} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <CardHeader>
              <CardTitle>Step 2: Your Strengths & Interests</CardTitle>
              <CardDescription>What are you naturally good at or passionate about? List a few things.</CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea 
                    placeholder="e.g., Creative problem-solving, listening to others, learning new languages, organizing data..." 
                    value={formData.strengths}
                    onChange={(e) => setFormData({...formData, strengths: e.target.value})}
                />
            </CardContent>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key={4} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <CardHeader>
              <CardTitle>Step 3: Your Time & Energy</CardTitle>
              <CardDescription>Realistically, how many hours per week can you dedicate to this journey?</CardDescription>
            </CardHeader>
            <CardContent>
                <Input 
                    type="number"
                    placeholder="e.g., 5"
                    value={formData.timeBudget}
                    onChange={(e) => setFormData({...formData, timeBudget: e.target.value})}
                />
            </CardContent>
          </motion.div>
        );
      case 5:
        return (
          <motion.div key={5} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <CardHeader className="text-center">
              <PartyPopper className="mx-auto size-12 text-accent"/>
              <CardTitle>Your Starting Point Summary</CardTitle>
              <CardDescription>You've established your basecamp! Here is a snapshot of your current position.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-bold">Core Values:</h4>
                    <p>{formData.values.join(', ') || 'Not specified'}</p>
                </div>
                <div>
                    <h4 className="font-bold">Strengths & Interests:</h4>
                    <p>{formData.strengths || 'Not specified'}</p>
                </div>
                <div>
                    <h4 className="font-bold">Weekly Time Budget:</h4>
                    <p>{formData.timeBudget ? `${formData.timeBudget} hours` : 'Not specified'}</p>
                </div>
            </CardContent>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
        <div className="p-4">
            <Progress value={progress} className="h-2" />
        </div>
      <div className="min-h-[400px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
            {renderStep()}
        </AnimatePresence>
        <div className="p-6 border-t flex justify-between items-center">
          <Button variant="outline" onClick={handlePrev} disabled={step === 1}>
            <ArrowLeft className="mr-2 size-4" /> Previous
          </Button>
          <p className="text-sm text-muted-foreground">Step {step} of {totalSteps}</p>
          <Button onClick={handleNext} disabled={step === totalSteps} className="bg-primary-gradient text-primary-foreground">
            {step === totalSteps - 1 ? "Finish" : "Next"} <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
