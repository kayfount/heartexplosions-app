import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

type LogoProps = {
  className?: string;
  iconOnly?: boolean;
};

export function Logo({ className, iconOnly = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <Heart className="size-8 text-destructive" fill="transparent" strokeWidth={1.5} />
        <span className="absolute -top-1 -right-1.5 text-lg animate-star-float" style={{fontFamily: 'sans-serif'}}>✨</span>
      </div>
      {!iconOnly && (
        <span className="text-xl font-bold tracking-tight font-headline text-gradient-logo">
          Heart Compass
        </span>
      )}
    </div>
  );
}
