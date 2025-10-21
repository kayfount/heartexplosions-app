
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRight, CheckCircle, Save } from 'lucide-react';
import { useUser } from '@/firebase';
import { saveUserProfile } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const coreValues = [
    "Achievement", "Adventure", "Authenticity", "Balance", "Community", "Compassion", "Courage", "Creativity",
    "Curiosity", "Dependability", "Equality", "Fairness", "Family", "Freedom", "Friendship", "Fun",
    "Generosity", "Growth", "Honesty", "Humor", "Independence", "Influence", "Inner Peace", "Integrity",
    "Justice", "Kindness", "Knowledge", "Leadership", "Learning", "Love", "Loyalty", "Nature",
    "Optimism", "Passion", "Patriotism", "Perseverance", "Personal Development", "Power", "Recognition", "Respect"
];

export function ValuesClient() {
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const [topValues, setTopValues] = useState<string[]>(['', '', '', '', '']);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    const { user } = useUser();
    const router = useRouter();

    const handleSelectValue = (value: string) => {
        setSelectedValues(prev => {
            if (prev.includes(value)) {
                // If a value is deselected, also remove it from topValues
                setTopValues(currentTopValues => currentTopValues.map(tv => tv === value ? '' : tv));
                return prev.filter(v => v !== value);
            }
            return [...prev, value];
        });
    };
    
    const handleTopValueChange = (index: number, value: string) => {
        setTopValues(prev => {
            const newTopValues = [...prev];
            // Prevent duplicate values
            if (newTopValues.includes(value) && value !== '') {
                toast({
                    variant: 'destructive',
                    title: 'Duplicate Value',
                    description: 'This value has already been selected in your top 5.',
                });
                return prev;
            }
            newTopValues[index] = value;
            return newTopValues;
        });
    }

    const allTop5Selected = useMemo(() => {
        return topValues.every(v => v !== '') && topValues.length === 5;
    }, [topValues]);

    const handleSaveAndContinue = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'You must be logged in.' });
            return;
        }
        if (!allTop5Selected) {
            toast({ variant: 'destructive', title: 'Please select your top 5 values.'});
            return;
        }

        setIsSaving(true);
        try {
            await saveUserProfile({ uid: user.uid, profileData: { coreValues: topValues }});
            toast({ title: 'Success!', description: 'Your core values have been saved.'});
            router.push('/destination');
        } catch (error) {
            toast({ variant: 'destructive', title: 'Uh oh!', description: 'Could not save your values.'});
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="text-center text-2xl font-bold font-headline">Define Your Core Values</CardTitle>
                <CardDescription className="text-center">
                    Values are your decision-making compass. They help you stay aligned when life gets complex.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-center font-semibold mb-4">Select values that resonate with you:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-8">
                    {coreValues.map(value => (
                        <Button
                            key={value}
                            variant={selectedValues.includes(value) ? 'default' : 'outline'}
                            onClick={() => handleSelectValue(value)}
                            className={cn("w-full justify-center h-12 transition-all duration-200", selectedValues.includes(value) && "bg-primary text-primary-foreground")}
                        >
                            {value}
                        </Button>
                    ))}
                </div>

                <AnimatePresence>
                    {selectedValues.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <Card className="bg-secondary/30 p-6">
                                <CardHeader className="p-0 mb-4">
                                     <CardTitle className="text-center">Select Your Top 5</CardTitle>
                                     <CardDescription className="text-center">From the values you chose, select your top 5.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="flex flex-col items-center">
                                            <p className="font-bold text-lg mb-2">{i + 1}</p>
                                            <Select
                                                value={topValues[i]}
                                                onValueChange={(value) => handleTopValueChange(i, value)}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select value..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="" disabled>Select a value</SelectItem>
                                                    {selectedValues.map(v => (
                                                        <SelectItem key={v} value={v}>
                                                            {v}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ))}
                                </div>
                                {allTop5Selected && (
                                     <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center mt-6 font-bold text-accent flex items-center justify-center gap-2"
                                     >
                                        <CheckCircle className="size-5" />
                                        Great! You've identified your Top 5 Core Values.
                                     </motion.div>
                                )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                 <div className="mt-8 flex justify-end items-center">
                    <Button onClick={handleSaveAndContinue} disabled={!allTop5Selected || isSaving} size="lg" className="bg-primary-gradient text-primary-foreground font-bold">
                        {isSaving ? <Save className="mr-2 animate-spin" /> : <Save className="mr-2" /> }
                        Save & Continue <ArrowRight className="ml-2" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
