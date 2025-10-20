
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Route, Sparkles, Car, MapPin, Tent, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/logo";

const features = [
  {
    icon: <Tent className="size-8 text-primary" />,
    title: "Basecamp",
    description: "Clarify your values, strengths, and constraints to set your starting point.",
  },
  {
    icon: <Car className="size-8 text-primary" />,
    title: "The Driver",
    description: "Discover your core motivations and natural genius with our purpose report.",
  },
  {
    icon: <MapPin className="size-8 text-primary" />,
    title: "The Destination",
    description: "Choose your focus area and create a personalized Purpose Profile.",
  },
  {
    icon: <Route className="size-8 text-primary" />,
    title: "The Route",
    description: "Build a sustainable, realistic roadmap with actionable weekly steps.",
  },
  {
    icon: <Sparkles className="size-8 text-primary" />,
    title: "Trail Angels",
    description: "Get guidance from an AI coach and access a hub of helpful resources.",
  },
];

const promises = [
  "A crystal-clear soul-aligned focus you’re excited to pursue",
  "A step-by-step roadmap built around your capacity, life season, and energy",
  "A renewed trust in your ability to finish what you start",
  "A system for choosing and building that you can use again and again"
]

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 md:py-32">
          <div className="mx-auto mb-6">
            <Logo className="justify-center" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter text-gradient-logo">
            Navigate Your Path to Purpose
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-foreground/80">
            Heart Explosions isn’t for the faint of heart. It’s for the ones standing at the edge of becoming—ready to choose, ready to build, ready to come home to their path.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg" className="bg-primary-gradient text-primary-foreground font-bold shadow-lg transition-transform hover:scale-105">
              <Link href="/signup">
                Start Your Journey <ArrowRight className="ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">
                Existing User? Log In
              </Link>
            </Button>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="bg-background/40 py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground">You don't need more content. You need a map.</h2>
                        <p className="mt-4 text-lg text-foreground/70">
                            Your audience isn't floundering because they’re lazy. They’re floundering because they:
                        </p>
                        <ul className="mt-4 space-y-2 text-foreground/80">
                            <li className="flex items-start gap-2"><CheckCircle2 className="text-destructive size-5 mt-1 shrink-0" /> Care deeply, and can't fake alignment anymore.</li>
                            <li className="flex items-start gap-2"><CheckCircle2 className="text-destructive size-5 mt-1 shrink-0" /> Are trying to make too many decisions at once.</li>
                            <li className="flex items-start gap-2"><CheckCircle2 className="text-destructive size-5 mt-1 shrink-0" /> Have too many gifts and ideas, and no system to narrow them down.</li>
                            <li className="flex items-start gap-2"><CheckCircle2 className="text-destructive size-5 mt-1 shrink-0" /> Are navigating real-world constraints like grief, burnout, or caregiving.</li>
                            <li className="flex items-start gap-2"><CheckCircle2 className="text-destructive size-5 mt-1 shrink-0" /> Know they’re meant for something more, but they’re exhausted by all the false starts.</li>
                        </ul>
                    </div>
                    <div className="text-center">
                         <p className="text-2xl font-bold text-gradient-logo italic">They don’t need more pressure. They need a bridge—from longing to clarity, from complexity to traction.</p>
                    </div>
                </div>
            </div>
        </section>


        {/* The Solution Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground">A Soul-Aligned Expedition, Not Just Another System</h2>
              <p className="mt-2 text-lg text-foreground/70">Heart Explosions works where other tools fail because it's deeply personalized and designed for the multi-passionate, neurodivergent, soul-led explorer—not the corporate clone.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="bg-background/80 transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center gap-4">
                    {feature.icon}
                    <CardTitle className="font-headline text-2xl text-foreground">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/80">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* The Promise Section */}
        <section className="bg-card/50 py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
                 <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground">You’ll finally know what to work on, <span className="text-gradient-logo">how</span> to do it, and <span className="text-gradient-logo">why</span> it matters to you.</h2>
                 <p className="mt-4 text-lg text-foreground/70">You’ll walk away with:</p>
                 <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                     {promises.map(promise => (
                         <div key={promise} className="flex items-start gap-3 p-4 bg-background/60 rounded-lg">
                             <CheckCircle2 className="text-primary size-6 mt-1 shrink-0" />
                             <p className="text-lg text-foreground/90">{promise}</p>
                         </div>
                     ))}
                 </div>
            </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl text-center">
                <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground">How It Works</h2>
                <p className="mt-2 text-lg text-foreground/70 max-w-2xl mx-auto">A choose-your-own-adventure roadmap for your most soul-aligned trajectory. Modular, flexible, and trauma-informed.</p>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    <Card className="p-6">
                        <h3 className="font-bold text-xl font-headline flex items-center gap-2"><span className="text-primary text-3xl">1.</span> Discover</h3>
                        <p className="mt-2 text-foreground/80">Start with the identity phase—who are you becoming? Clarify your non-negotiables, instincts, values, and genius.</p>
                    </Card>
                    <Card className="p-6">
                        <h3 className="font-bold text-xl font-headline flex items-center gap-2"><span className="text-primary text-3xl">2.</span> Decide</h3>
                        <p className="mt-2 text-foreground/80">Use guided prompts and AI support to generate your exact roadmap and translate your soul’s direction into an actionable plan.</p>
                    </Card>
                    <Card className="p-6">
                        <h3 className="font-bold text-xl font-headline flex items-center gap-2"><span className="text-primary text-3xl">3.</span> Do</h3>
                        <p className="mt-2 text-foreground/80">Build your next self with a visual plan, weekly actions, and a library of 'Trail Angels'—resources to support and deepen your path.</p>
                    </Card>
                </div>
            </div>
        </section>
        
        {/* Call to Action Section */}
        <section className="bg-secondary/40 py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
                <p className="text-2xl font-bold italic text-foreground/90">“I designed this guide for people like me—visionaries rebuilding from the fire. It’s not a template. It’s a torchlight.”</p>
                <p className="mt-2 text-lg font-bold text-foreground/70">– Kristy Fountain</p>
                <div className="mt-8">
                     <Button asChild size="lg" className="bg-primary-gradient text-primary-foreground font-bold shadow-lg transition-transform hover:scale-105">
                        <Link href="/signup">
                            Begin Your Expedition <ArrowRight className="ml-2" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>

      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-foreground/60">
        <p>&copy; {new Date().getFullYear()} Heart Explosions. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
