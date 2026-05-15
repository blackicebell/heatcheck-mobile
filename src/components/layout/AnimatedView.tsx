import { ReactNode, useEffect, useRef } from "react";
import { Animated, ViewStyle } from "react-native";

import { animation } from "@/theme";

type AnimatedViewProps = {
  children: ReactNode;
  delay?: number;
  style?: ViewStyle;
};

export function AnimatedView({ children, delay = 0, style }: AnimatedViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: animation.normal,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: animation.normal,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}
