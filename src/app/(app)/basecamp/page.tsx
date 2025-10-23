
'use client';

import { useState, useEffect, type ReactNode, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  Car,
  MapPin,
  Route as RouteIcon,
  BookOpen,
  Tent,
  CheckCircle2,
  ClipboardPen,
  Download,
  Music,
  Flame,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RegistrationModal } from './registration-modal';
import { SatisfactionQuizModal } from './satisfaction-quiz-modal';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { quotes } from '@/lib/quotes';
import { doc, getFirestore } from 'firebase/firestore';
import type { UserProfile } from '@/models/user-profile';
import { saveUserProfile } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

type StageStatus = 'locked' | 'active' | 'completed';

const initialTasks = {
  registered: false,
  quizTaken: false,
  guideDownloaded: false,
  playlistAdded: false,
};

const guideUrl = "https://www.canva.com/design/DAGZDvGfwkc/ptwWB6lPjTmt4j-sAslcWQ/view?utm_content=DAGZDvGfwkc&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hac7d68a9e2";
const playlistUrl = "https://open.spotify.com/playlist/6CbgYjp9jZB49TYGPHOqkX?si=3872886ff0374df2";


export default function BasecampDashboardPage() {
  const [isReturningUser, setIsReturningUser] = useState(true);
  const [quote, setQuote] = useState('');
  const [isRegistrationOpen, setRegistrationOpen] = useState(false);
  const [isQuizOpen, setQuizOpen] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useMemo(() => getFirestore(), []);
  const { toast } = useToast();
  
  const userProfileRef = useMemoFirebase(() => {
    if (!user?.uid || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user?.uid, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const tasks = useMemo(() => {
    if (!userProfile) return initialTasks;
    return {
      registered: !!(userProfile.firstName && userProfile.journeyStatus),
      quizTaken: typeof userProfile.roleClarityScore === 'number',
      guideDownloaded: !!userProfile.guideDownloaded,
      playlistAdded: !!userProfile.playlistAdded,
    };
  }, [userProfile]);

  const allSetupTasksCompleted = Object.values(tasks).every(Boolean);

  const expeditionStages = useMemo(() => {
    const driverStatus: StageStatus = userProfile?.driverCompleted ? 'completed' : allSetupTasksCompleted ? 'active' : 'locked';
    const destinationStatus: StageStatus = userProfile?.destinationCompleted ? 'completed' : driverStatus === 'completed' ? 'active' : 'locked';
    const routeStatus: StageStatus = userProfile?.routeCompleted ? 'completed' : destinationStatus === 'completed' ? 'active' : 'locked';
      
    return [
      { id: 'driver', title: '01 The Driver', icon: <Car />, href: '/driver', status: driverStatus, description: "Uncover your core motivations and natural genius with our purpose report." },
      { id: 'destination', title: '02 The Destination', icon: <MapPin />, href: '/destination', status: destinationStatus, description: "Choose your focus area and create a personalized Purpose Profile." },
      { id: 'route', title: '03 The Route', icon: <RouteIcon />, href: '/route', status: routeStatus, description: "Build a sustainable, realistic roadmap with actionable weekly steps." },
    ]
  }, [allSetupTasksCompleted, userProfile]);

  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote.quote);

    const showRegistration = searchParams.get('register') === 'true';
    if (showRegistration && !isRegistrationOpen) {
      setRegistrationOpen(true);
      router.replace('/basecamp', {scroll: false});
    }
  }, [searchParams, router, isRegistrationOpen]);


  const handleRegistration = () => {
    // The revalidation is handled by the server action
  };

  const handleQuizComplete = () => {
    // The revalidation is handled by the server action
  }
  
  const handleMarkAsComplete = async (task: 'guideDownloaded' | 'playlistAdded') => {
    if (!user) return;
    try {
      await saveUserProfile({ uid: user.uid, profileData: { [task]: true }});
      toast({
        title: 'Progress Saved!',
        description: 'Your essentials checklist has been updated.',
      });
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: e.message || 'Could not save your progress.',
      })
    }
  };

  const userName = userProfile?.callSign || userProfile?.firstName || user?.displayName || 'Keke';

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
  
  const handleExternalLinkClick = (url: string, task?: 'guideDownloaded' | 'playlistAdded') => {
    window.open(url, '_blank', 'noopener,noreferrer');
    if (task) {
      handleMarkAsComplete(task);
    }
  };

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
        
          <Card className="w-full bg-card/80 border-border shadow-lg">
            <CardContent className="p-8 text-center">
                <Tent className="mx-auto size-12 text-accent mb-4"/>
                <h2 className="text-3xl font-bold font-headline mb-2">{isReturningUser ? "Welcome Back to Basecamp" : "Welcome to Basecamp!"}</h2>
                <p className="text-muted-foreground mb-6">This is your starting point, the place you return to between each stage of your journey.</p>
                <p className="text-foreground/80 text-center"><b className="font-bold">Your Focus:</b> {getFocusText()}</p>
                
                {allSetupTasksCompleted && (
                     <Button asChild className="mt-6 bg-primary-gradient text-primary-foreground font-bold">
                        <Link href="/driver">
                            You're ready to begin. Start with Phase 01 - The Driver <ArrowRight className="ml-2"/>
                        </Link>
                    </Button>
                )}
            </CardContent>
          </Card>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
            <div className="space-y-8">
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
                            icon={<Flame className="size-5 text-primary-foreground" />}
                            isComplete={tasks.quizTaken}
                            incompleteText="Take the Role Satisfaction Quiz"
                            completeText="Retake Role Satisfaction Quiz"
                            description={tasks.quizTaken ? "Measure your new alignment" : "Get your starting score"}
                            onClick={() => setQuizOpen(true)}
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-bold font-headline mb-4">Pick Up Your Essentials</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <StatusCard
                            icon={<Download className="size-5 text-primary-foreground" />}
                            isComplete={tasks.guideDownloaded}
                            incompleteText="Download Your Guide"
                            completeText="Guide Downloaded"
                            description="Your expedition guide is ready!"
                            onClick={() => handleExternalLinkClick(guideUrl, 'guideDownloaded')}
                        />
                        <StatusCard
                            icon={<Music className="size-5 text-primary-foreground" />}
                            isComplete={tasks.playlistAdded}
                            incompleteText="Add The Playlist"
                            completeText="Playlist Added"
                            description="Your soundtrack is ready!"
                            onClick={() => handleExternalLinkClick(playlistUrl, 'playlistAdded')}
                        />
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h3 className="text-2xl font-bold font-headline mb-4">Expedition Prep</h3>
                    <div className="space-y-4">
                        {expeditionStages.map(stage => (
                            <div key={stage.id}>
                                <Link href={stage.href} className={cn("block", stage.status === 'locked' && "pointer-events-none")}>
                                    <Card className={cn(
                                        "transition-all duration-300 flex items-center p-4", 
                                        stage.status === 'locked' ? 'bg-muted/30 border-muted/50' : 'hover:border-primary/50',
                                        stage.status === 'active' && 'border-accent border-2 shadow-lg shadow-accent/20'
                                    )}>
                                        <div className="flex items-center gap-4">
                                            <div className={cn("p-2 rounded-md", stage.status === 'locked' ? 'bg-muted/50 text-muted-foreground' : 'bg-secondary text-accent')}>
                                                {stage.icon}
                                            </div>
                                            <div>
                                                <p className={cn("font-bold text-lg", stage.status === 'locked' && 'text-muted-foreground')}>{stage.title}</p>
                                                <p className="text-sm text-muted-foreground">{stage.description}</p>
                                            </div>
                                        </div>
                                        <div className="ml-auto">
                                            {stage.status === 'completed' && <CheckCircle2 className="text-accent"/>}
                                            {stage.status === 'active' && 
                                                <motion.div
                                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                                    transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
                                                >
                                                     <ArrowRight className="text-accent"/>
                                                </motion.div>
                                            }
                                            {stage.status === 'locked' && <Lock className="text-muted-foreground" />}
                                        </div>
                                    </Card>
                                </Link>
                             </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2 pt-7">
                        <BookOpen className="text-accent" /> Wisdom From The Wilderness
                    </h3>
                    <p className="text-lg italic text-muted-foreground">"{quote}"</p>
                </div>
            </div>
          
          <div>
            <h3 className="text-2xl font-bold font-headline mb-4">Check Your Expedition Status</h3>
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-8 text-center">
                        <div>
                            <p className="text-4xl font-bold text-accent">{userProfile?.roleClarityScore !== undefined ? `${userProfile.roleClarityScore}%` : '--'}</p>
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

interface StatusCardProps {
    icon: ReactNode;
    isComplete: boolean;
    incompleteText: string;
    completeText: string;
    description: string;
    onClick?: () => void;
}

function StatusCard({ icon, isComplete, incompleteText, completeText, description, onClick }: StatusCardProps) {
    return (
        <Card onClick={onClick} className={cn("group cursor-pointer transition-all duration-300 hover:border-primary/50 hover:scale-[1.02]")}>
            <CardContent className="p-6 flex items-center gap-4">
                 <div className={cn(
                    "flex items-center justify-center size-10 rounded-full transition-all duration-300",
                    isComplete ? "bg-accent" : "bg-foreground"
                 )}>
                  {isComplete ? <CheckCircle2 className="size-5 text-primary-foreground" /> : icon}
                </div>
                <div>
                    <p className="font-bold text-lg">{isComplete ? completeText : incompleteText}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </CardContent>
        </Card>
    )
}
