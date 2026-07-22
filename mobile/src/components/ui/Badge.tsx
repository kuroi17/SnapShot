import { View, Text } from "react-native";
import { cn } from "../../utils/cn";

type BadgeVariant = "default" | "success" | "cyan" | "win95" | "outline";

interface BadgeProps {
  variant?: BadgeVariant;
  children: string;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-win95Surface rounded-sm",
  success: "bg-accentGreen rounded-sm",
  cyan: "bg-accentCyan rounded-sm",
  win95: "bg-win95Surface rounded-none",
  outline: "bg-transparent border border-win95Shadow rounded-sm",
};

const textStyles: Record<BadgeVariant, string> = {
  default: "text-darkCanvas",
  success: "text-white",
  cyan: "text-darkCanvas",
  win95: "text-darkCanvas",
  outline: "text-textMuted",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <View
      className={cn(
        "self-start px-2 py-0.5",
        variantStyles[variant],
        variant === "win95" && "win95-bevel-outset",
        className
      )}
    >
      <Text className={cn("font-mono text-[10px] uppercase tracking-[0.12em]", textStyles[variant])}>
        {children}
      </Text>
    </View>
  );
}
