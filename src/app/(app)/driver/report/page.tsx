
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Sparkles, Car } from 'lucide-react';

function ReportContent() {
    const searchParams = useSearchParams();
    const upa = searchParams.get('upa') || 'Enneagram 4w5 SX SX/SP 451';

    return (
        <div className="container mx-auto max-w-3xl p-4 md:p-8">
            <div className="flex items-center gap-4 mb-6">
                <Car className="size-10 text-primary" />
                <div>
                    <p className="text-sm font-bold text-primary">01 THE DRIVER</p>
                    <h1 className="text-4xl font-bold font-headline">Discover what truly motivates you.</h1>
                </div>
            </div>
            
            <Card className="bg-card/80 border-border/50 shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold font-headline">Your Life Purpose Report</CardTitle>
                    <CardDescription>Using your UPA, we'll create your personalized compass for aligned decision-making.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-[#d2f0dc] p-6 rounded-lg text-center my-4">
                        <p className="text-sm font-bold text-foreground/80">Your UPA:</p>
                        <p className="text-lg font-bold text-foreground">{upa}</p>
                    </div>
                    <p className="text-center text-muted-foreground mb-6">This one-time report will unveil your unique essence, core energies, and how you're wired to thrive.</p>
                    <div className="text-center">
                        <Button className="bg-primary-gradient text-primary-foreground font-bold shadow-lg" size="lg">
                            <Sparkles className="mr-2 size-4" />
                            Generate My Life Purpose Report
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-8 flex justify-between items-center">
                <Button variant="outline" asChild>
                    <Link href="/driver"><ArrowLeft className="mr-2" /> Previous</Link>
                </Button>
                <Button asChild className="bg-primary-gradient text-primary-foreground font-bold">
                    <Link href="/destination">Next <ArrowRight className="ml-2" /></Link>
                </Button>
            </div>
        </div>
    );
}

export default function ReportPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ReportContent />
        </Suspense>
    );
}
