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
          className="absolute -top-1 -right-1.5 text-lg" 
          style={{
            fontFamily: 'sans-serif',
            color: 'hsl(var(--accent))',
            textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
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
