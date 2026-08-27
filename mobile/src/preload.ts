import { StyleSheet } from "react-native-css-interop";

try {
  (StyleSheet as any).setFlag?.("darkMode", "class");
} catch {
  // Ignore if already set
}
