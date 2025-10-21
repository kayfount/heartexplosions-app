
'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { coachInteractionAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser } from '@/firebase';

const formSchema = z.object({
  query: z.string().min(1, 'Message cannot be empty.'),
});

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export function CoachChat() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: "Hello! I'm your AI purpose coach. How can I support you on your journey today?" }
  ]);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { query: '' },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if(viewport) {
             viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const userMessage: Message = { sender: 'user', text: values.query };
    setMessages(prev => [...prev, userMessage]);
    form.reset();

    const result = await coachInteractionAction({ query: userMessage.text });
    
    if (result.success && result.data) {
      const aiMessage: Message = { sender: 'ai', text: result.data.response };
      setMessages(prev => [...prev, aiMessage]);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'The AI coach is unavailable right now.',
      });
       setMessages(prev => prev.slice(0, -1));
    }
    setIsLoading(false);
  }

  const userImage = user?.photoURL || "https://picsum.photos/seed/avatar1/100/100";
  const userName = user?.displayName || "Trailblazer";

  return (
    <Card className="flex flex-col h-[70vh] max-h-[700px]">
        <CardHeader>
            {/* Can be used for title if needed */}
        </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="space-y-6 pr-4">
            <AnimatePresence>
                {messages.map((message, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn('flex items-start gap-3', { 'justify-end': message.sender === 'user' })}
                >
                    {message.sender === 'ai' && (
                    <Avatar className="h-9 w-9 border-2 border-accent">
                        <AvatarFallback><Sparkles className="text-accent"/></AvatarFallback>
                    </Avatar>
                    )}
                    <div className={cn(
                        'rounded-xl px-4 py-3 max-w-[80%] whitespace-pre-wrap',
                        message.sender === 'ai' ? 'bg-secondary' : 'bg-primary text-primary-foreground'
                    )}>
                        <p className="text-sm">{message.text}</p>
                    </div>
                    {message.sender === 'user' && (
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={userImage} data-ai-hint="person portrait" />
                        <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    )}
                </motion.div>
                ))}
            </AnimatePresence>
            {isLoading && (
                 <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3"
                  >
                    <Avatar className="h-9 w-9 border-2 border-accent">
                        <AvatarFallback><Sparkles className="text-accent"/></AvatarFallback>
                    </Avatar>
                    <div className="rounded-xl px-4 py-3 bg-secondary flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin"/>
                        <span>Thinking...</span>
                    </div>
                 </motion.div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full items-start gap-2">
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Textarea 
                      placeholder="Ask for guidance, clarification, or encouragement..." 
                      className="resize-none"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (form.formState.isValid) {
                             form.handleSubmit(onSubmit)();
                          }
                        }
                      }}
                      {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Form>
      </CardFooter>
    </Card>
  );
}
