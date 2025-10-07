import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Edit,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export default function BasecampDashboardPage() {
  const userImage = "https://picsum.photos/seed/avatar1/100/100";
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 bg-background">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Good afternoon, Trailblazer!
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
      <Separator className="bg-accent h-0.5" />

      {/* Content removed to start from scratch */}
    </div>
  );
}
