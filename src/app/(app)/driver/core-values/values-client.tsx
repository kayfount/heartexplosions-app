
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { ArrowRight, CheckCircle, Save, PlusCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { saveUserProfile } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { doc, getFirestore } from 'firebase/firestore';
import type { UserProfile } from '@/models/user-profile';

const allCoreValues = [
    // Initial set
    "Achievement", "Adventure", "Authenticity", "Balance", "Community", "Compassion", "Courage", "Creativity",
    "Curiosity", "Dependability", "Equality", "Fairness", "Family", "Freedom", "Friendship", "Fun",
    "Generosity", "Growth", "Honesty", "Humor", "Independence", "Influence", "Inner Peace", "Integrity",
    "Justice", "Kindness", "Knowledge", "Leadership", "Learning", "Love", "Loyalty", "Nature",
    "Optimism", "Passion", "Patriotism", "Perseverance", "Personal Development", "Power", "Recognition", "Respect",
    // Additional values
    "Security", "Service", "Spirituality", "Stability", "Strength", "Success", "Teamwork", "Tradition",
    "Tranquility", "Trust", "Truth", "Wealth", "Wisdom", "Accountability", "Adaptability", "Altruism",
    "Assertiveness", "Beauty", "Belonging", "Boldness", "Calmness", "Carefulness", "Challenge", "Change",
    "Charity", "Cleanliness", "Collaboration", "Commitment", "Competence", "Confidence", "Connection", "Consciousness",
    "Consistency", "Contentment", "Contribution", "Control", "Conviction", "Cooperation", "Decisiveness", "Dedication",
    "Democracy", "Dignity", "Diligence", "Discipline", "Discovery", "Diversity", "Duty", "Effectiveness",
    "Efficiency", "Empathy", "Endurance", "Energy", "Enjoyment", "Enthusiasm", "Excellence", "Excitement",
    "Experience", "Expertise", "Exploration", "Expressiveness", "Faith", "Fame", "Flexibility", "Focus",
    "Forgiveness", "Fortitude", "Fulfillment", "Grace", "Gratitude", "Harmony", "Health", "Helpfulness",
    "Holiness", "Honor", "Hope", "Humility", "Imagination", "Impact", "Inclusiveness", "Ingenuity",
    "Initiative", "Insight", "Inspiration", "Intellect", "Intimacy", "Intuition", "Joy", "Judgement",
    "Logic", "Mastery", "Maturity", "Meaning", "Mindfulness", "Modesty", "Motivation", "Openness",
    "Originality", "Patience", "Peace", "Performance", "Persistence", "Playfulness", "Poise", "Potential",
    "Practicality", "Presence", "Privacy", "Proactivity", "Professionalism", "Prosperity", "Punctuality", "Purpose",

];

const INITIAL_VISIBLE_COUNT = 40;
const INCREMENT_COUNT = 20;


export function ValuesClient() {
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const [topValues, setTopValues] = useState<string[]>(['', '', '', '', '']);
    const [isSaving, setIsSaving] = useState(false);
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useMemo(() => user ? getFirestore() : null, [user]);

    const userProfileRef = useMemoFirebase(() => {
        if (!user?.uid || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user?.uid, firestore]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    useEffect(() => {
        if (userProfile?.coreValues && userProfile.coreValues.length > 0) {
            const currentTopValues = [...userProfile.coreValues];
            // Ensure the array has 5 elements, padding with empty strings if necessary
            while(currentTopValues.length < 5) {
                currentTopValues.push('');
            }
            setTopValues(currentTopValues.slice(0, 5));
            // Also add them to the general selected values list so they can be picked in the dropdowns
            setSelectedValues(prev => [...new Set([...prev, ...userProfile.coreValues!])]);
        }
    }, [userProfile]);

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
    
    const handleTopValueChange = async (index: number, value: string) => {
        const newTopValues = [...topValues];
        // Prevent duplicate values
        if (newTopValues.includes(value) && value !== '') {
            toast({
                variant: 'destructive',
                title: 'Duplicate Value',
                description: 'This value has already been selected in your top 5.',
            });
            return;
        }
        newTopValues[index] = value;
        setTopValues(newTopValues);
        
        // Auto-save when a value changes
        if (user) {
            await saveUserProfile({ uid: user.uid, profileData: { coreValues: newTopValues.filter(v => v) }});
        }
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
            // The values are auto-saved, so just need to confirm before navigating
            await saveUserProfile({ uid: user.uid, profileData: { coreValues: topValues }});
            toast({ title: 'Success!', description: 'Your core values have been saved.'});
            router.push('/driver/report');
        } catch (error) {
            toast({ variant: 'destructive', title: 'Uh oh!', description: 'Could not save your values.'});
        } finally {
            setIsSaving(false);
        }
    }
    
    const showMoreValues = () => {
        setVisibleCount(prev => Math.min(prev + INCREMENT_COUNT, allCoreValues.length));
    }

    const displayedValues = allCoreValues.slice(0, visibleCount);

    if (isUserLoading || isProfileLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin size-8" />
            </div>
        )
    }

    return (
        <div className="mt-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold font-headline">Define Your Core Values</CardTitle>
                    <CardDescription className="text-center">
                        Values are your decision-making compass. They help you stay aligned when life gets complex.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center font-semibold mb-4">Select values that resonate with you:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6">
                        {displayedValues.map(value => (
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

                    {visibleCount < allCoreValues.length && (
                        <div className="text-center">
                            <Button variant="link" onClick={showMoreValues} className="text-primary">
                                <PlusCircle className="mr-2"/>
                                See More Values
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
            <AnimatePresence>
                {selectedValues.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mt-8"
                    >
                        <Card className="bg-secondary/30">
                             <CardHeader>
                                    <CardTitle className="text-center">Your Top 5 Core Values</CardTitle>
                                    <CardDescription className="text-center">From your selected values, choose your top 5 most important ones:</CardDescription>
                            </CardHeader>
                            <CardContent>
                            <div className="space-y-4 max-w-md mx-auto">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <p className="font-bold text-lg">{i + 1}.</p>
                                        <Select
                                            value={topValues[i]}
                                            onValueChange={(value) => handleTopValueChange(i, value)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a value" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {selectedValues.map(v => (
                                                    <SelectItem key={v} value={v} disabled={topValues.includes(v) && topValues[i] !== v}>
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
            <div className="mt-12 flex justify-between items-center">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft /> Previous
                </Button>
                <Button onClick={handleSaveAndContinue} disabled={!allTop5Selected || isSaving} className="bg-primary-gradient text-primary-foreground font-bold">
                    {isSaving ? <Save className="mr-2 animate-spin" /> : 'Next' }
                    {!isSaving && <ArrowRight className="ml-2" />}
                </Button>
            </div>
        </div>
    );
}
