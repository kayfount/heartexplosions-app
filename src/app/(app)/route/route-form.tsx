'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Sparkles, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { createRoutePlanAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { RoutePlanOutput } from '@/ai/flows/create-realistic-route-plan';

const formSchema = z.object({
  availableHours: z.coerce.number().min(1, 'Please enter a number greater than 0.'),
  commitments: z.string().min(10, 'Please describe your commitments.'),
  timeline: z.string().min(3, 'Please specify your timeline (e.g., 3 months).'),
});

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export function RouteForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<RoutePlanOutput | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      availableHours: 10,
      commitments: '',
      timeline: '3 Months',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setPlan(null);
    setTasks([]);
    const result = await createRoutePlanAction(values);
    setIsLoading(false);

    if (result.success && result.data) {
      setPlan(result.data);
      // Rudimentary parsing of the plan into tasks
      const generatedTasks = result.data.routePlan
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
        .map((line, index) => ({ id: `task-${index}`, text: line.trim().substring(1).trim(), completed: false }));
      setTasks(generatedTasks);

      toast({
        title: 'Route Plan Created!',
        description: 'Your sustainable roadmap is ready.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Something went wrong.',
      });
    }
  }

  const toggleTask = (id: string) => {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };
  
  const completedTasks = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <>
      <Card className="rounded-xl shadow-lg border-border/30">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Plan Your Route</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="availableHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Hours per Week</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desired Timeline</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 3 months, 1 year" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="commitments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Existing Commitments</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your work, family, or other commitments..." {...field} />
                    </FormControl>
                    <FormDescription>This helps the AI create a realistic plan.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} size="lg" className="w-full md:w-auto bg-primary-gradient text-primary-foreground font-bold shadow-lg">
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Roadmap...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" /> Create My Route Plan</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <AnimatePresence>
      {plan && (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
        >
        <Card className="mt-8 rounded-xl shadow-lg border-primary/50">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-gradient-logo">Your Route Plan</CardTitle>
            <CardDescription>An interactive roadmap to keep you on track. Check off items as you complete them.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Progress value={progress} className="h-3" />
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              {tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map(task => (
                    <div key={task.id} className="flex items-center space-x-3 p-3 rounded-lg bg-background hover:bg-secondary/50 transition-colors">
                      <Checkbox id={task.id} checked={task.completed} onCheckedChange={() => toggleTask(task.id)} className="confetti-button" />
                      <label htmlFor={task.id} className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.text}</label>
                    </div>
                  ))}
                </div>
              ) : (
                 <div className="prose max-w-none text-foreground/90 whitespace-pre-wrap font-body">{plan.routePlan}</div>
              )}
            </div>
          </CardContent>
        </Card>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}
