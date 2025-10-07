
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Edit,
  Tent,
  ArrowRight,
  Download,
  ListMusic,
  CheckCircle2,
  GitBranch,
  Target,
  Route as RouteIcon,
  BookOpen
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Mock data and state for demonstration purposes
const initialTasks = {
  registered: false,
  quizTaken: false,
  guideDownloaded: false,
  playlistAdded: false,
};

const expeditionStages = [
  { id: 'driver', title: '01 The Driver', icon: <GitBranch />, completed: false, href: '/driver' },
  { id: 'destination', title: '02 The Destination', icon: <Target />, completed: false, href: '/destination' },
  { id: 'route', title: '03 The Route', icon: <RouteIcon />, completed: false, href: '/route' },
];

const quotes = [
  "The wilderness is not a place to escape from, but a place to return to.",
  "In every walk with nature, one receives far more than he seeks.",
  "The clearest way into the Universe is through a forest wilderness.",
  "Look deep into nature, and then you will understand everything better."
];

export default function BasecampDashboardPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [isReturningUser, setIsReturningUser] = useState(true);
  const userImage = "https://picsum.photos/seed/avatar1/100/100";
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  const allTasksCompleted = Object.values(tasks).every(Boolean);

  const getFocusText = () => {
    if (allTasksCompleted) {
      return "Excellent work! You've completed all four essential setup tasks: registered for the expedition, taken the Role Satisfaction Quiz, downloaded your guide, and added the playlist. You're fully equipped and ready for the journey ahead.";
    }
    const incompleteTasks = [];
    if (!tasks.registered) incompleteTasks.push("register for the expedition");
    if (!tasks.quizTaken) incompleteTasks.push("take the Role Satisfaction Quiz");
    if (!tasks.guideDownloaded) incompleteTasks.push("download your guide");
    if (!tasks.playlistAdded) incompleteTasks.push("add the playlist");
    return `Let's get you set up for the journey. Your next steps are to ${incompleteTasks.join(', ')}.`;
  }
  
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 bg-background">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Good morning, Keke!
        </h1>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={userImage} data-ai-hint="person portrait" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>
      
      {/* Welcome Box */}
      <Card className="w-full max-w-4xl mx-auto bg-card/80 border-border shadow-lg">
        <CardContent className="p-8 text-center">
            <Tent className="mx-auto size-12 text-accent mb-4"/>
            <h2 className="text-3xl font-bold font-headline mb-2">{isReturningUser ? "Welcome Back to Basecamp" : "Welcome to Basecamp!"}</h2>
            <p className="text-muted-foreground mb-6">This is your starting point, the place you return to between each stage of your journey.</p>
            <p className="text-foreground/80 text-center"><b className="font-bold">Your Focus:</b> {getFocusText()}</p>
            
            {allTasksCompleted && (
                 <Button asChild className="mt-6 bg-primary-gradient text-primary-foreground font-bold">
                    <Link href="/driver">
                        Continue to The Driver <ArrowRight className="ml-2"/>
                    </Link>
                </Button>
            )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            {/* Registration Section */}
            <div>
                <h3 className="text-2xl font-bold font-headline mb-4">Register for the Expedition</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatusCard
                        isComplete={tasks.registered}
                        incompleteText="Register for your Expedition"
                        completeText="Expedition Registered"
                        description="Your journey is official!"
                        onClick={() => setTasks(prev => ({...prev, registered: !prev.registered}))}
                    />
                    <StatusCard
                        isComplete={tasks.quizTaken}
                        incompleteText="Take the Role Satisfaction Quiz"
                        completeText="Retake Role Satisfaction Quiz"
                        description="Measure your new alignment"
                        onClick={() => setTasks(prev => ({...prev, quizTaken: !prev.quizTaken}))}
                    />
                </div>
            </div>

            {/* Essentials Section */}
            <div>
                <h3 className="text-2xl font-bold font-headline mb-4">Pick Up Your Essentials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatusCard
                        isComplete={tasks.guideDownloaded}
                        incompleteText="Download Your Guide"
                        completeText="Guide Downloaded"
                        description="Your expedition guide is ready!"
                        onClick={() => setTasks(prev => ({...prev, guideDownloaded: !prev.guideDownloaded}))}
                    />
                    <StatusCard
                        isComplete={tasks.playlistAdded}
                        incompleteText="Add The Playlist"
                        completeText="Playlist Added"
                        description="Your soundtrack is ready!"
                        onClick={() => setTasks(prev => ({...prev, playlistAdded: !prev.playlistAdded}))}
                    />
                </div>
            </div>
        </div>

        {/* Wisdom Widget */}
        <div className="lg:row-span-2">
            <Card className="bg-card/80 h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <BookOpen className="text-accent" /> Wisdom From The Wilderness
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg italic text-muted-foreground">"{quote}"</p>
                </CardContent>
            </Card>
        </div>

        {/* Expedition Prep Section */}
        <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold font-headline mb-4">Expedition Prep</h3>
            <div className="space-y-3">
                 {expeditionStages.map(stage => (
                    <Link href={stage.href} key={stage.id}>
                        <Card className="hover:border-primary/50 transition-colors flex items-center p-4">
                           <div className="flex items-center gap-4">
                                <div className="p-2 bg-secondary rounded-md text-primary">
                                    {stage.icon}
                                </div>
                                <p className="font-bold text-lg">{stage.title}</p>
                           </div>
                           <div className="ml-auto">
                            {stage.completed ? <CheckCircle2 className="text-primary"/> : <ArrowRight className="text-muted-foreground"/>}
                           </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
      </div>
      
      {/* Check Your Expedition Status */}
      <div>
        <h3 className="text-2xl font-bold font-headline mb-4">Check Your Expedition Status</h3>
        <Card>
            <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-8 text-center">
                    <div>
                        <p className="text-4xl font-bold text-primary">78%</p>
                        <p className="text-sm text-muted-foreground">Role Clarity Score</p>
                    </div>
                     <div>
                        <p className="text-4xl font-bold text-primary">12</p>
                        <p className="text-sm text-muted-foreground">Days on Journey</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}

// Helper component for status cards
interface StatusCardProps {
    isComplete: boolean;
    incompleteText: string;
    completeText: string;
    description: string;
    onClick: () => void;
}

function StatusCard({ isComplete, incompleteText, completeText, description, onClick }: StatusCardProps) {
    return (
        <Card onClick={onClick} className={cn("cursor-pointer transition-colors hover:border-primary/50", isComplete && 'bg-secondary/50')}>
            <CardContent className="p-6 flex items-center gap-4">
                <div>
                  {isComplete ? <CheckCircle2 className="size-8 text-primary" /> : <div className="size-8 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center"><ArrowRight className="size-4 text-muted-foreground" /></div>}
                </div>
                <div>
                    <p className="font-bold">{isComplete ? completeText : incompleteText}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </CardContent>
        </Card>
    )
}
