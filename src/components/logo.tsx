import { cn } from "@/lib/utils";
import { Heart, Star } from "lucide-react";

type LogoProps = {
  className?: string;
  iconOnly?: boolean;
};

export function Logo({ className, iconOnly = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <Heart className="size-8 text-primary fill-current" />
        <Star className="absolute -top-2 -right-1.5 size-4 text-accent fill-accent animate-star-float" />
      </div>
      {!iconOnly && (
        <span className="text-xl font-bold tracking-tight font-headline text-gradient-logo">
          Heart Explosions
        </span>
      )}
    </div>
  );
}
