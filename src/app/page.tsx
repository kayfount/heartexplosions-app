import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Route, Sparkles, LifeBuoy, MapPin, Tent } from "lucide-react";

const features = [
  {
    icon: <Tent className="size-8 text-primary" />,
    title: "Basecamp",
    description: "Clarify your values, strengths, and constraints to set your starting point.",
  },
  {
    icon: <LifeBuoy className="size-8 text-primary" />,
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


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 md:py-32">
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter text-gradient-logo">
            Navigate Your Path to Purpose
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-foreground/80">
            Heart Explosions is your expedition partner for a life of meaning, providing AI-powered tools and compassionate guidance to help you move forward while honoring your real-world capacity.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg" className="bg-primary-gradient text-primary-foreground font-bold shadow-lg transition-transform hover:scale-105">
              <Link href="/login">
                Start Your Journey <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="bg-card/50 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground">Your Complete Toolkit for Purposeful Living</h2>
              <p className="mt-2 text-lg text-foreground/70">From initial discovery to a sustainable roadmap.</p>
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
      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-foreground/60">
        <p>&copy; {new Date().getFullYear()} Heart Explosions. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
