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
        <div 
          className="absolute -top-1 -right-1.5 text-lg animate-star-float text-foreground"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="size-5"
          >
            <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
            <path d="M5 5 L6 6" />
            <path d="M18 6 L19 5" />
            <path d="M5 19 L6 18" />
          </svg>
        </div>
      </div>
      {!iconOnly && (
        <span className="text-xl font-bold tracking-tight font-headline text-gradient-logo">
          Heart Explosions
        </span>
      )}
    </div>
  );
}
