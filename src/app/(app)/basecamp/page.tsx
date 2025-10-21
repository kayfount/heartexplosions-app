
'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  Car,
  Target,
  Route as RouteIcon,
  BookOpen,
  Tent,
  CheckCircle2,
  ClipboardPen,
  ClipboardCheck,
  Download,
  Music
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { RegistrationModal } from './registration-modal';
import { SatisfactionQuizModal } from './satisfaction-quiz-modal';
import { useUser } from '@/firebase';
import { quotes } from '@/lib/quotes';

// Mock data and state for demonstration purposes
const initialTasks = {
  registered: false,
  quizTaken: false,
  guideDownloaded: false,
  playlistAdded: false,
};

const expeditionStages = [
  { id: 'driver', title: '01 The Driver', icon: <Car className="text-accent" />, completed: false, href: '/driver' },
  { id: 'destination', title: '02 The Destination', icon: <Target className="text-accent" />, completed: false, href: '/destination' },
  { id: 'route', title: '03 The Route', icon: <RouteIcon className="text-accent" />, completed: false, href: '/route' },
];

export default function BasecampDashboardPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [isReturningUser, setIsReturningUser] = useState(true);
  const [quote, setQuote] = useState('');
  const [isRegistrationOpen, setRegistrationOpen] = useState(false);
  const [isQuizOpen, setQuizOpen] = useState(false);
  const [roleClarityScore, setRoleClarityScore] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    // Moved quote selection into useEffect to prevent hydration errors.
    // This ensures Math.random() is only called on the client.
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote.quote);

    if (searchParams.get('register') === 'true') {
      setRegistrationOpen(true);
      // Remove the query param from the URL without reloading the page
      router.replace('/basecamp', {scroll: false});
    }
  }, [searchParams, router]);

  const userImage = user?.photoURL || "https://picsum.photos/seed/avatar1/100/100";
  const userName = user?.displayName || 'Keke';
  const allSetupTasksCompleted = Object.values(tasks).every(Boolean);
  
  const handleRegistration = (data: any) => {
    console.log("Registration data:", data);
    setTasks(prev => ({...prev, registered: true}));
  };

  const handleQuizComplete = (score: number) => {
    const totalPossibleScore = 10 * 10; // 10 questions, max score of 10
    const percentage = Math.round((score / totalPossibleScore) * 100);
    setRoleClarityScore(percentage);
    setTasks(prev => ({...prev, quizTaken: true}));
    setQuizOpen(false);
  }

  const getFocusText = () => {
    if (tasks.registered) {
      const incompleteTasks = [];
      if (!tasks.quizTaken) incompleteTasks.push("take the Role Satisfaction Quiz");
      if (!tasks.guideDownloaded) incompleteTasks.push("download your guide");
      if (!tasks.playlistAdded) incompleteTasks.push("add the playlist");
      
      if (incompleteTasks.length === 0) {
        return "Excellent work! You've completed all essential setup tasks. You're fully equipped and ready for the journey ahead.";
      }
      return `You're registered! Your next steps are to ${incompleteTasks.join(', ')}.`;
    }
    return "Let's get you set up for the journey. Your first step is to register for the expedition.";
  }
  
  return (
    <>
      <RegistrationModal 
        isOpen={isRegistrationOpen} 
        onOpenChange={setRegistrationOpen}
        onRegister={handleRegistration}
        isRegistered={tasks.registered}
      />
      <SatisfactionQuizModal
        isOpen={isQuizOpen}
        onOpenChange={setQuizOpen}
        onQuizComplete={handleQuizComplete}
      />
      <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between space-y-2 mb-8">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                <AvatarImage src={userImage} data-ai-hint="person portrait" />
                <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <h1 className="text-3xl font-bold tracking-tight font-headline">
                Good morning, {userName}!
              </h1>
            </div>
          </div>
        
          {/* Welcome Box */}
          <Card className="w-full bg-card/80 border-border shadow-lg">
            <CardContent className="p-8 text-center">
                <Tent className="mx-auto size-12 text-accent mb-4"/>
                <h2 className="text-3xl font-bold font-headline mb-2">{isReturningUser ? "Welcome Back to Basecamp" : "Welcome to Basecamp!"}</h2>
                <p className="text-muted-foreground mb-6">This is your starting point, the place you return to between each stage of your journey.</p>
                <p className="text-foreground/80 text-center"><b className="font-bold">Your Focus:</b> {getFocusText()}</p>
                
                {allSetupTasksCompleted && (
                     <Button asChild className="mt-6 bg-primary-gradient text-primary-foreground font-bold">
                        <Link href="/driver">
                            Continue to The Driver <ArrowRight className="ml-2"/>
                        </Link>
                    </Button>
                )}
            </CardContent>
          </Card>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
            {/* Registration & Essentials Section */}
            <div className="space-y-8">
                {/* Registration Section */}
                <div>
                    <h3 className="text-2xl font-bold font-headline mb-4">Register for the Expedition</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <StatusCard
                            icon={<ClipboardPen className="size-5 text-primary-foreground" />}
                            isComplete={tasks.registered}
                            incompleteText="Register for your Expedition"
                            completeText="Expedition Registered"
                            description="Your journey is official!"
                            onClick={() => setRegistrationOpen(true)}
                        />
                        <StatusCard
                            icon={<ClipboardCheck className="size-5 text-primary-foreground" />}
                            isComplete={tasks.quizTaken}
                            incompleteText="Take the Role Satisfaction Quiz"
                            completeText="Retake Role Satisfaction Quiz"
                            description={tasks.quizTaken ? "Measure your new alignment" : "Get your starting score"}
                            onClick={() => setQuizOpen(true)}
                        />
                    </div>
                </div>

                {/* Essentials Section */}
                <div>
                    <h3 className="text-2xl font-bold font-headline mb-4">Pick Up Your Essentials</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a href="/guide.pdf" download onClick={() => setTasks(prev => ({...prev, guideDownloaded: true}))}>
                            <StatusCard
                                icon={<Download className="size-5 text-primary-foreground" />}
                                isComplete={tasks.guideDownloaded}
                                incompleteText="Download Your Guide"
                                completeText="Guide Downloaded"
                                description="Your expedition guide is ready!"
                                onClick={() => {}} // The parent `a` tag handles the action
                            />
                        </a>
                         <a href="https://open.spotify.com/playlist/6CbgYjp9jZB49TYGPHOqkX?si=4df18c5c76db4bd3" target="_blank" rel="noopener noreferrer" onClick={() => setTasks(prev => ({...prev, playlistAdded: true}))}>
                            <StatusCard
                                icon={<Music className="size-5 text-primary-foreground" />}
                                isComplete={tasks.playlistAdded}
                                incompleteText="Add The Playlist"
                                completeText="Playlist Added"
                                description="Your soundtrack is ready!"
                                onClick={() => {}}
                            />
                        </a>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Expedition Prep Section */}
                <div className="lg:col-span-2">
                    <h3 className="text-2xl font-bold font-headline mb-4">Expedition Prep</h3>
                    <div className="space-y-4">
                        {expeditionStages.map(stage => (
                            <div key={stage.id}>
                                <Link href={stage.href} className="block">
                                    <Card className="hover:border-primary/50 transition-colors flex items-center p-4">
                                    <div className="flex items-center gap-4">
                                            <div className="p-2 bg-secondary rounded-md text-accent">
                                                {stage.icon}
                                            </div>
                                            <p className="font-bold text-lg">{stage.title}</p>
                                    </div>
                                    <div className="ml-auto">
                                        {stage.completed ? <CheckCircle2 className="text-accent"/> : <ArrowRight className="text-muted-foreground"/>}
                                    </div>
                                    </Card>
                                </Link>
                             </div>
                        ))}
                    </div>
                </div>

                {/* Wisdom Widget */}
                <div>
                    <h3 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2 pt-7">
                        <BookOpen className="text-accent" /> Wisdom From The Wilderness
                    </h3>
                    <p className="text-lg italic text-muted-foreground">"{quote}"</p>
                </div>
            </div>
          
          {/* Check Your Expedition Status */}
          <div>
            <h3 className="text-2xl font-bold font-headline mb-4">Check Your Expedition Status</h3>
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-8 text-center">
                        <div>
                            <p className="text-4xl font-bold text-accent">{roleClarityScore !== null ? `${roleClarityScore}%` : '--'}</p>
                            <p className="text-sm text-muted-foreground">Role Clarity Score</p>
                        </div>
                         <div>
                            <p className="text-4xl font-bold text-accent">12</p>
                            <p className="text-sm text-muted-foreground">Days on Journey</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper component for status cards
interface StatusCardProps {
    icon: ReactNode;
    isComplete: boolean;
    incompleteText: string;
    completeText: string;
    description: string;
    onClick: () => void;
}

function StatusCard({ icon, isComplete, incompleteText, completeText, description, onClick }: StatusCardProps) {
    // The component might be wrapped in an `<a>` tag, so stop propagation on the click
    // to prevent potential double-event firing.
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (onClick) {
            e.preventDefault(); // prevent navigation if it's inside an anchor
            e.stopPropagation();
            onClick();
        }
    }

    return (
        <Card onClick={handleClick} className={cn("group cursor-pointer transition-all duration-300 hover:border-primary/50 hover:scale-105", isComplete && 'bg-secondary/50')}>
            <CardContent className="p-6 flex items-center gap-4">
                 <div className={cn("flex items-center justify-center size-10 rounded-full transition-transform duration-300 group-hover:animate-shiver", isComplete ? "bg-accent" : "bg-foreground")}>
                  {isComplete ? <CheckCircle2 className="size-5 text-primary-foreground" /> : icon}
                </div>
                <div>
                    <p className="font-bold">{isComplete ? completeText : incompleteText}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </CardContent>
        </Card>
    )
}

    
