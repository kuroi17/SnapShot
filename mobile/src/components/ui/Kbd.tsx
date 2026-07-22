import { View, Text } from "react-native";
import { cn } from "../../utils/cn";

interface KbdProps {
  children: string;
  className?: string;
}

export function Kbd({ children, className }: KbdProps) {
  return (
    <View className={cn("win95-bevel-inset bg-win95Surface/80 px-2 py-0.5", className)}>
      <Text className="font-mono text-[11px] text-darkCanvas font-bold leading-tight">
        {children}
      </Text>
    </View>
  );
}
