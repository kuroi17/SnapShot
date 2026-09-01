import { View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

interface Win95WindowProps {
  title: string;
  icon?: string;
  showIcon?: boolean;
  children: ReactNode;
  className?: string;
}

export function Win95Window({ title, icon, showIcon = true, children, className }: Win95WindowProps) {
  return (
    <View
      className={cn("w-full", className)}
      style={{
        backgroundColor: "#d4d0c8",
        borderWidth: 2,
        borderTopColor: "#ffffff",
        borderLeftColor: "#ffffff",
        borderRightColor: "#404040",
        borderBottomColor: "#404040",
        shadowColor: "#000000",
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 6,
      }}
    >
      {/* Title Bar */}
      <LinearGradient
        colors={["#000080", "#1084d0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flexDirection: "row", alignItems: "center", height: 28, paddingHorizontal: 6, gap: 6 }}
      >
        {/* Logo Icon */}
        {showIcon && !icon && (
          <Image
            source={require("../../../assets/snapshot_icon.png")}
            style={{ width: 16, height: 16 }}
            resizeMode="contain"
          />
        )}
        {icon && (
          <Text style={{ fontSize: 14, lineHeight: 16 }}>{icon}</Text>
        )}

        {/* Title */}
        <Text
          style={{
            flex: 1,
            color: "#ffffff",
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 0.2,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>

        {/* Window Control Buttons */}
        <View style={{ flexDirection: "row", gap: 2 }}>
          {["_", "□", "×"].map((label, i) => (
            <View
              key={i}
              style={{
                width: 16,
                height: 14,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#d4d0c8",
                borderWidth: 1.5,
                borderTopColor: "#ffffff",
                borderLeftColor: "#ffffff",
                borderRightColor: "#404040",
                borderBottomColor: "#404040",
              }}
            >
              <Text style={{ fontSize: 7, fontWeight: "700", color: "#000000", lineHeight: 8 }}>
                {label}
              </Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={{ padding: 12 }}>{children}</View>
    </View>
  );
}
