import { View, Text, ScrollView, Pressable, Platform, Image } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Win95Window } from "../components/ui/Win95Window";
import { useToast } from "../services/ToastContext";
import { useService } from "../services/ServiceContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ServiceButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const bevel = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const bevelStyle = useAnimatedStyle(() => ({
    borderTopColor: (bevel.value === 1 ? "#404040" : "#ffffff") as any,
    borderLeftColor: (bevel.value === 1 ? "#404040" : "#ffffff") as any,
    borderRightColor: (bevel.value === 1 ? "#ffffff" : "#404040") as any,
    borderBottomColor: (bevel.value === 1 ? "#ffffff" : "#404040") as any,
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(0.98, { stiffness: 300, damping: 20 });
        bevel.value = 1;
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { stiffness: 300, damping: 20 });
        bevel.value = 0;
      }}
      onPress={onPress}
      style={[animStyle, { width: "100%", backgroundColor: active ? "#e6ded1" : "#d4d0c8" }]}
    >
      <Animated.View
        style={[
          bevelStyle,
          {
            paddingVertical: 12,
            paddingHorizontal: 20,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
          },
        ]}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: "700",
            color: active ? "#b91c1c" : "#111111",
            letterSpacing: 0.3,
          }}
        >
          {label}
        </Text>
      </Animated.View>
    </AnimatedPressable>
  );
}

const FEATURES = [
  { icon: "⚡", label: "Auto Background Removal", sub: "Local AI • No cloud" },
  { icon: "📋", label: "Direct Clipboard Copy", sub: "Transparent PNG output" },
  { icon: "🎨", label: "Precision Brush Refine", sub: "Restore or remove edges" },
];

export default function IndexScreen() {
  const { showToast } = useToast();
  const { serviceActive, startService, stopService } = useService();

  const handleToggle = () => {
    if (serviceActive) {
      stopService();
      showToast("Service stopped.", "error");
    } else {
      startService();
      showToast("Service started — capture bubble is active!", "success");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0c0d0e" }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Logo */}
        <View style={{ alignItems: "center", gap: 12, marginBottom: 4 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#0c0d0e",
              borderWidth: 2,
              borderColor: "#00f0ff",
              shadowColor: "#00f0ff",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.35,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Image
              source={require("../../assets/snapshot_icon.png")}
              style={{ width: 48, height: 48 }}
              resizeMode="contain"
            />
          </View>
          <View style={{ alignItems: "center", gap: 4 }}>
            <Text
              style={{
                fontSize: 26,
                fontWeight: "800",
                color: "#f3f4f6",
                letterSpacing: -0.5,
              }}
            >
              SnapShot
            </Text>
            <Text style={{ fontSize: 11, color: "#9ca3af", letterSpacing: 0.3 }}>
              Local AI Screen-to-Object Capture
            </Text>
          </View>
        </View>

        {/* Win95 Window: Status + Controls */}
        <Win95Window title="SnapShot Mobile v1.0.0" className="w-full max-w-sm">
          {/* Status Row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 8,
              paddingHorizontal: 10,
              marginBottom: 10,
              borderWidth: 2,
              borderTopColor: "#404040",
              borderLeftColor: "#404040",
              borderRightColor: "#ffffff",
              borderBottomColor: "#ffffff",
              backgroundColor: "#c8c4bc",
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#111111" }}>
              Service Status
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                paddingHorizontal: 8,
                paddingVertical: 2,
                backgroundColor: serviceActive ? "#d4f5d4" : "#f5d4d4",
                borderWidth: 1,
                borderColor: serviceActive ? "#28a745" : "#cc3333",
              }}
            >
              <View
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 3.5,
                  backgroundColor: serviceActive ? "#28a745" : "#cc3333",
                }}
              />
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  color: serviceActive ? "#155724" : "#721c24",
                  letterSpacing: 0.5,
                }}
              >
                {serviceActive ? "ACTIVE" : "STOPPED"}
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text
            style={{
              fontSize: 11,
              color: "#444444",
              lineHeight: 17,
              marginBottom: 12,
              paddingHorizontal: 2,
            }}
          >
            {serviceActive
              ? "The floating capture bubble is active. Switch to any app and tap the bubble to draw a custom selection."
              : "Tap Start Service to activate the floating capture bubble over other apps."}
          </Text>

          {/* Single Dynamic Action Button */}
          <View style={{ width: "100%" }}>
            <ServiceButton
              label={serviceActive ? "Stop Service" : "Start Service"}
              active={serviceActive}
              onPress={handleToggle}
            />
          </View>
        </Win95Window>

        {/* Feature Cards */}
        <View style={{ width: "100%", maxWidth: 352, gap: 8 }}>
          {FEATURES.map((f, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: 12,
                backgroundColor: "#141517",
                borderWidth: 1,
                borderColor: "rgba(0, 240, 255, 0.12)",
                borderRadius: 4,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 4,
                  backgroundColor: "rgba(0, 240, 255, 0.08)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 18 }}>{f.icon}</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#f3f4f6" }}>
                  {f.label}
                </Text>
                <Text style={{ fontSize: 10, color: "#9ca3af" }}>{f.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* How-to footer */}
        <Text
          style={{
            fontSize: 10,
            color: "#6b7280",
            textAlign: "center",
            lineHeight: 15,
            maxWidth: 280,
            marginTop: 4,
          }}
        >
          Start Service → tap bubble → draw crop → refine → copy to clipboard
        </Text>
      </ScrollView>
    </View>
  );
}
