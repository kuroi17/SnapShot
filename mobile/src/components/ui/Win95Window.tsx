import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

interface Win95WindowProps {
  title: string;
  icon?: string;
  children: ReactNode;
  className?: string;
}

export function Win95Window({ title, icon, children, className }: Win95WindowProps) {
  return (
    <View className={cn("win95-bevel-outset bg-win95Surface", className)}>
      <LinearGradient
        colors={["#000080", "#1084d0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="flex-row items-center h-8 px-1.5"
      >
        {icon ? (
          <Text className="text-white/90 mr-1.5 text-sm">{icon}</Text>
        ) : (
          <View className="w-4 h-4 mr-1.5 items-center justify-center">
            <View className="w-2.5 h-2.5 bg-white/40 rounded-sm" />
          </View>
        )}
        <Text className="flex-1 text-white font-sans text-xs font-bold tracking-tight">
          {title}
        </Text>
        <View className="flex-row items-center gap-0.5 ml-2">
          <View className="win95-bevel-outset bg-win95Surface w-[18] h-[14] items-center justify-center">
            <Text className="text-darkCanvas text-[7px] font-bold leading-none">_</Text>
          </View>
          <View className="win95-bevel-outset bg-win95Surface w-[18] h-[14] items-center justify-center">
            <Text className="text-darkCanvas text-[9px] font-bold leading-none">口</Text>
          </View>
          <View className="win95-bevel-outset bg-win95Surface w-[18] h-[14] items-center justify-center">
            <Text className="text-darkCanvas text-[9px] font-bold leading-none">✕</Text>
          </View>
        </View>
      </LinearGradient>
      <View className="p-3">{children}</View>
    </View>
  );
}
