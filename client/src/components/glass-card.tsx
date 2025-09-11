import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function GlassCard({ children, className, onClick }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-effect rounded-2xl p-8 hover:shadow-xl transition-all cursor-pointer group",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
