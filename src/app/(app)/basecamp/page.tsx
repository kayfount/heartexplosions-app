
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
  Tent,
  CheckCircle2,
  ClipboardPen,
  Download,
  Music,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RegistrationModal } from './registration-modal';
import { SatisfactionQuizModal } from './satisfaction-quiz-modal';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { quotes } from '@/lib/quotes';
import { doc, getFirestore } from 'firebase/firestore';
import type { UserProfile } from '@/models/user-profile';
import { useMemo } from 'react';
import { saveUserProfile } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

type StageStatus = 'locked' | 'active' | 'completed';

interface ExpeditionStage {
  id: 'driver' | 'destination' | 'route';
  title: string;
  icon: React.ReactNode;
  href: string;
  status: StageStatus;
}


export default function BasecampDashboardPage() {
  const [isReturningUser, setIsReturningUser] = useState(true);
  const [quote, setQuote] = useState('');
  const [isRegistrationOpen, setRegistrationOpen] = useState(false);
  const [isQuizOpen, setQuizOpen] = useState(false);
  const [roleClarityScore, setRoleClarityScore] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const firestore = useMemo(() => getFirestore(), []);
  
  const userProfileRef = useMemoFirebase(() => {
    if (!user?.uid || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user?.uid, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const [tasks, setTasks] = useState({
    registered: false,
    quizTaken: false,
    guideDownloaded: false,
    playlistAdded: false,
  });
  
  const allSetupTasksCompleted = Object.values(tasks).every(Boolean);

  const expeditionStages: ExpeditionStage[] = useMemo(() => {
    const driverCompleted = !!userProfile?.driverCompleted;
    const destinationCompleted = !!userProfile?.destinationCompleted;
    const routeCompleted = !!userProfile?.routeCompleted;

    let driverStatus: StageStatus = 'locked';
    if (allSetupTasksCompleted) {
        driverStatus = driverCompleted ? 'completed' : 'active';
    }

    let destinationStatus: StageStatus = 'locked';
    if (driverCompleted) {
        destinationStatus = destinationCompleted ? 'completed' : 'active';
    }
    
    let routeStatus: StageStatus = 'locked';
    if (destinationCompleted) {
        routeStatus = routeCompleted ? 'completed' : 'active';
    }

    return [
      { id: 'driver', title: '01 The Driver', icon: <Car />, href: '/driver', status: driverStatus },
      { id: 'destination', title: '02 The Destination', icon: <Target />, href: '/destination', status: destinationStatus },
      { id: 'route', title: '03 The Route', icon: <RouteIcon />, href: '/route', status: routeStatus },
    ];
  }, [userProfile, allSetupTasksCompleted]);

  useEffect(() => {
    if (userProfile) {
      setTasks({
        registered: !!(userProfile.firstName && userProfile.journeyStatus),
        quizTaken: typeof userProfile.roleClarityScore === 'number',
        guideDownloaded: !!userProfile.guideDownloaded,
        playlistAdded: !!userProfile.playlistAdded,
      });
      if (typeof userProfile.roleClarityScore === 'number') {
        setRoleClarityScore(userProfile.roleClarityScore);
      }
    }
  }, [userProfile]);

  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote.quote);

    if (searchParams.get('register') === 'true') {
      setRegistrationOpen(true);
      router.replace('/basecamp', {scroll: false});
    }
  }, [searchParams, router]);

  const userName = userProfile?.callSign || userProfile?.firstName || user?.displayName || 'Keke';
  
  const handleRegistration = (data: any) => {
    setTasks(prev => ({...prev, registered: true}));
  };

  const handleQuizComplete = (score: number) => {
    setRoleClarityScore(score);
    setTasks(prev => ({...prev, quizTaken: true}));
  }

  const handleTaskCompletion = async (task: 'guideDownloaded' | 'playlistAdded') => {
    if (!user || tasks[task]) return; 

    if (task === 'guideDownloaded') {
        window.open('/guide.pdf', '_blank');
    } else if (task === 'playlistAdded') {
        window.open('https://open.spotify.com/playlist/6CbgYjp9jZB49TYGPHOqkX?si=554ea16099804f4a', '_blank', 'noopener,noreferrer');
    }

    setTasks(prev => ({...prev, [task]: true}));
    
    try {
        await saveUserProfile({ uid: user.uid, profileData: { [task]: true }});
    } catch(e) {
        console.error(`Failed to save ${task} status`, e);
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: `Could not save your progress for ${task}.`,
        });
        setTasks(prev => ({...prev, [task]: false}));
    }
  }

  const getFocusText = () => {
    if (allSetupTasksCompleted) {
      return "Excellent work! You've completed all essential setup tasks. You're ready to begin your expedition. Start with 01 The Driver.";
    }
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
            <h1 className="text-3xl font-bold tracking-tight font-headline">
              Good morning, {userName}!
            </h1>
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
                            Start Stage 01: The Driver <ArrowRight className="ml-2"/>
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
                            completeText="Edit Your Expedition Details"
                            description={tasks.registered ? "Update your profile anytime" : "Your journey is official!"}
                            onClick={() => setRegistrationOpen(true)}
                        />
                        <StatusCard
                            icon={<ClipboardPen className="size-5 text-primary-foreground" />}
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
                       <StatusCard
                            icon={<Download className="size-5 text-primary-foreground" />}
                            isComplete={tasks.guideDownloaded}
                            incompleteText="Download Your Guide"
                            completeText="Guide Downloaded"
                            description="Your expedition guide is ready!"
                            onClick={() => handleTaskCompletion('guideDownloaded')}
                        />
                         <StatusCard
                            icon={<Music className="size-5 text-primary-foreground" />}
                            isComplete={tasks.playlistAdded}
                            incompleteText="Add The Playlist"
                            completeText="Playlist Added"
                            description="Your soundtrack is ready!"
                             onClick={() => handleTaskCompletion('playlistAdded')}
                        />
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
                                <Link href={stage.status !== 'locked' ? stage.href : '#'} className={cn(stage.status === 'locked' && 'pointer-events-none')}>
                                    <Card className={cn(
                                        "transition-all flex items-center p-4",
                                        stage.status === 'locked' && 'bg-muted/30 text-muted-foreground',
                                        stage.status === 'active' && 'border-primary/50 ring-2 ring-primary/50 animate-blink-and-pause',
                                        stage.status === 'completed' && 'bg-secondary/50',
                                        stage.status !== 'locked' && 'hover:border-primary/50'
                                    )}>
                                    <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "p-2 rounded-md",
                                                stage.status === 'locked' && 'bg-muted/50',
                                                stage.status === 'active' && 'bg-primary text-primary-foreground',
                                                stage.status === 'completed' && 'bg-accent text-accent-foreground',
                                            )}>
                                                {stage.icon}
                                            </div>
                                            <p className="font-bold text-lg">{stage.title}</p>
                                    </div>
                                    <div className="ml-auto">
                                        {stage.status === 'completed' && <CheckCircle2 className="text-accent"/>}
                                        {stage.status === 'active' && <ArrowRight />}
                                        {stage.status === 'locked' && <Lock />}
                                    </div>
                                    </Card>
                                </Link>
                             </div>
                        ))}
                    </div>
                </div>

                {/* Wisdom Widget */}
                <div className="lg:mt-11">
                    <h3 className="text-2xl font-bold font-headline mb-4 pt-[0.3%]">
                        Wisdom from The Wilderness
                    </h3>
                    <p className="text-lg italic text-muted-foreground pl-4">"{quote}"</p>
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
    onClick?: () => void;
}

function StatusCard({ icon, isComplete, incompleteText, completeText, description, onClick }: StatusCardProps) {
    const content = (
        <CardContent className="p-6 flex items-center gap-4">
            <div className={cn(
                "flex items-center justify-center size-10 rounded-full transition-colors duration-300 group-hover:animate-shiver",
                isComplete ? "bg-accent" : "bg-foreground"
            )}>
                {isComplete ? <CheckCircle2 className="size-6 text-primary-foreground" /> : icon}
            </div>
            <div>
                <p className="font-bold">{isComplete ? completeText : incompleteText}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </CardContent>
    );

    const commonClass = "group cursor-pointer transition-all duration-300 hover:border-primary/50 hover:scale-105";

    return (
        <Card onClick={onClick} className={commonClass}>
            {content}
        </Card>
    );
}

    