import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { de } from "date-fns/locale";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

 export default function Loader({ size = "md", className }: LoaderProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-blue-600", sizeClasses[size])} />
    </div>
  );
}
