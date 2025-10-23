
'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Flame, ArrowRight, ArrowLeft, X, User } from 'lucide-react';
import { useUser } from '@/firebase';
import { saveUserProfile } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

const quizQuestions = [
  { topic: 'Purpose', statement: 'I feel a deep sense of meaning and calling in the role I currently play.' },
  { topic: 'Growth', statement: 'My role challenges me in a way that feels expansive, not overwhelming.' },
  { topic: 'Autonomy', statement: 'I have the freedom to shape how I do my work or contribution.' },
  { topic: 'Mastery', statement: 'I feel skillful, competent, and capable in this role.' },
  { topic: 'Belonging', statement: 'I feel seen, valued, and respected by others in this role.' },
  { topic: 'Nervous System', statement: 'My role feels regulating to my nervous system—not draining.' },
  { topic: 'Values', statement: 'My role aligns with my core values and personal truth.' },
  { topic: 'Authenticity', statement: 'I bring my true self, creativity, and weirdness into this role.' },
  { topic: 'Impact', statement: 'I feel that my work makes a real difference to others or something I care about.' },
  { topic: 'Future Self', statement: 'I can see myself growing into my next self through this role.' },
];


type QuizStage = 'intro' | 'quiz' | 'results';

interface SatisfactionQuizModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onQuizComplete: () => void;
}

export function SatisfactionQuizModal({ isOpen, onOpenChange, onQuizComplete }: SatisfactionQuizModalProps) {
  const [stage, setStage] = useState<QuizStage>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [sliderValue, setSliderValue] = useState(5);
  const { user } = useUser();
  const { toast } = useToast();

  const totalQuestions = quizQuestions.length;
  
  const finalScore = useMemo(() => {
    if (answers.length !== totalQuestions) return 0;
    return answers.reduce((sum, val) => sum + val, 0);
  }, [answers, totalQuestions]);

  const handleNextQuestion = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = sliderValue;
    setAnswers(newAnswers);

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSliderValue(newAnswers[currentQuestion + 1] ?? 5);
    } else {
      setStage('results');
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = sliderValue;
        setAnswers(newAnswers);
        setCurrentQuestion(prev => prev - 1);
        setSliderValue(newAnswers[currentQuestion - 1] ?? 5);
    }
  };
  
  const handleStart = () => {
    setAnswers(Array(totalQuestions).fill(5));
    setCurrentQuestion(0);
    setSliderValue(5);
    setStage('quiz');
  };

  const handleClose = () => {
    setStage('intro');
    onOpenChange(false);
  };
  
  const handleFinish = async () => {
    const percentage = Math.round((finalScore / (totalQuestions * 10)) * 100)
    
    if (user) {
      try {
        await saveUserProfile({ uid: user.uid, profileData: { roleClarityScore: percentage } });
        toast({
          title: "Score Saved",
          description: "Your Role Clarity Score has been saved to your profile.",
        });
        onQuizComplete();
      } catch (error) {
         toast({
          variant: "destructive",
          title: "Uh oh!",
          description: "Could not save your score.",
        });
      }
    }
    handleClose();
  }

  const renderContent = () => {
    switch (stage) {
      case 'intro':
        return (
          <div className="text-center">
             <div className="mx-auto flex items-center justify-center size-14 rounded-full bg-destructive/10 mb-4">
                <Flame className="size-8 text-destructive"/>
             </div>
            <DialogTitle className="text-2xl font-bold font-headline text-foreground">Soul Temperature Check</DialogTitle>
            <DialogDescription className="text-lg text-foreground/80 mt-2 mb-6">Want to see how aligned your current role really is?</DialogDescription>
            <div className="bg-card/80 p-4 rounded-lg text-sm text-foreground/90">
                <p className="font-bold mb-2">This 10-question self-assessment helps you evaluate how aligned your current role (career, calling, or contribution) is with your nervous system, values, purpose, and long-term soul direction.</p>
                <p>Reflect on the role you currently play in your life, whether that's a job, identity, business, vocation, or contribution. Focus on the role that you most want to pivot from or change.</p>
            </div>
            <DialogFooter className="mt-6 sm:justify-center gap-2">
                <Button onClick={handleStart} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold">Take the Quiz</Button>
                <Button onClick={handleClose} variant="outline">Skip for Now</Button>
            </DialogFooter>
          </div>
        );

      case 'quiz':
        const question = quizQuestions[currentQuestion];
        return (
          <div>
            <DialogHeader>
                <div className='flex items-center gap-2 text-sm text-destructive font-bold'>
                    <User className='size-4'/>
                    Question {currentQuestion + 1} of {totalQuestions}
                </div>
            </DialogHeader>
            
            <p className="text-sm font-bold text-destructive uppercase tracking-wider text-center mt-6 mb-2">{question.topic}</p>
            <p className="text-lg font-semibold text-center mb-6 min-h-[5rem] flex items-center justify-center">{question.statement}</p>
            
            <div className="my-8">
               <p className="text-center font-bold text-lg mb-4">{sliderValue}/10</p>
              <Slider
                value={[sliderValue]}
                onValueChange={(value) => setSliderValue(value[0])}
                max={10}
                step={1}
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>Not at all</span>
                <span>Fully true</span>
              </div>
            </div>

            <div className="flex justify-between w-full">
                <Button onClick={handlePreviousQuestion} variant="outline" disabled={currentQuestion === 0} className="disabled:opacity-100">
                    <ArrowLeft className="mr-2"/> Previous
                </Button>
                <Button onClick={handleNextQuestion} className="bg-destructive hover:bg-destructive/80 text-destructive-foreground">
                    {currentQuestion < totalQuestions - 1 ? 'Next' : 'See My Score'} <ArrowRight className="ml-2"/>
                </Button>
            </div>
          </div>
        );
      
      case 'results':
        return (
             <div className="text-center">
                 <DialogTitle className="text-2xl font-bold font-headline text-foreground mb-2">Your Role Clarity Score</DialogTitle>
                 <div className="my-6">
                    <p className="text-7xl font-bold text-accent">{Math.round((finalScore / (totalQuestions * 10)) * 100)}%</p>
                 </div>
                 <p className="text-foreground/80 mb-6">This score is a snapshot of your current alignment. It's a starting point for your journey, not a final judgment.</p>
                 <DialogFooter>
                     <Button onClick={handleFinish} className="w-full bg-primary-gradient text-primary-foreground font-bold">Done & Save Score</Button>
                 </DialogFooter>
             </div>
        )
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md bg-card border-foreground/20"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={stage + currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
         <button onClick={handleClose} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  );
}
