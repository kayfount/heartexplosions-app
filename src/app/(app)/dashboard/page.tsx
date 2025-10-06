import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  LayoutDashboard,
  Route,
  Sparkles,
  LifeBuoy,
  MapPin,
  Tent,
} from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const features = [
  {
    href: '/basecamp',
    icon: <Tent />,
    title: 'Basecamp',
    description: 'Start here to clarify your values, strengths, and constraints.',
    image: PlaceHolderImages.find(img => img.id === 'journal-and-pen'),
  },
  {
    href: '/driver',
    icon: <LifeBuoy />,
    title: 'The Driver',
    description: "Uncover your core motivations with a personalized Life Purpose Report.",
    image: PlaceHolderImages.find(img => img.id === 'compass-on-map'),
  },
  {
    href: '/destination',
    icon: <MapPin />,
    title: 'The Destination',
    description: 'Define your focus and create an actionable Purpose Profile.',
    image: PlaceHolderImages.find(img => img.id === 'starry-sky'),
  },
  {
    href: '/route',
    icon: <Route />,
    title: 'The Route',
    description: 'Build a sustainable roadmap tailored to your real-world capacity.',
    image: PlaceHolderImages.find(img => img.id === 'mountain-path'),
  },
];

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Welcome, Explorer!
        </h1>
      </div>
      <p className="text-lg text-muted-foreground">
        Your journey to a more purposeful life starts now. Where to next?
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 mt-8">
        {features.map((feature) => (
           <Card key={feature.title} className="flex flex-col overflow-hidden rounded-xl shadow-md border-border/20 hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1">
            {feature.image && (
                <div className="relative h-48 w-full">
                    <Image
                        src={feature.image.imageUrl}
                        alt={feature.image.description}
                        fill
                        className="object-cover"
                        data-ai-hint={feature.image.imageHint}
                    />
                </div>
            )}
            <CardHeader>
              <div className="flex items-center gap-2 text-primary">
                {feature.icon}
                <CardTitle className="font-headline text-2xl text-foreground">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <Link href={feature.href}>
                  Go to {feature.title} <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
