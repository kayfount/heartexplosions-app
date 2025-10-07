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
        <span 
          className="absolute -top-1 -right-1.5 text-lg animate-star-float"
          style={{
            fontFamily: 'sans-serif',
            color: 'transparent',
            textShadow: '0 0 2px hsl(var(--accent)), -1px -1px 0 hsl(var(--accent)), 1px -1px 0 hsl(var(--accent)), -1px 1px 0 hsl(var(--accent)), 1px 1px 0 hsl(var(--accent))',
          }}
        >
          ✨
        </span>
      </div>
      {!iconOnly && (
        <span className="text-xl font-bold tracking-tight font-headline text-gradient-logo">
          Heart Explosions
        </span>
      )}
    </div>
  );
}
