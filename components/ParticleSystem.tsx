import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

const { width, height } = Dimensions.get("window");
const PARTICLE_COUNT = 15;

interface Particle {
  left: Animated.Value;
  top: Animated.Value;
  opacity: Animated.Value;
  size: number;
}

function createParticle(): Particle {
  return {
    left: new Animated.Value(Math.random() * width),
    top: new Animated.Value(Math.random() * height),
    opacity: new Animated.Value(0),
    size: Math.random() * 4 + 2,
  };
}

function animateParticle(particle: Particle) {
  const duration = 4000 + Math.random() * 5000;
  const targetLeft = Math.random() * width;
  const targetTop = Math.random() * height;

  particle.left.setValue(Math.random() * width);
  particle.top.setValue(Math.random() * height);

  Animated.sequence([
    Animated.parallel([
      Animated.timing(particle.opacity, {
        toValue: Math.random() * 0.5 + 0.1,
        duration: duration * 0.3,
        useNativeDriver: false,
      }),
      Animated.timing(particle.left, {
        toValue: targetLeft,
        duration,
        useNativeDriver: false,
      }),
      Animated.timing(particle.top, {
        toValue: targetTop,
        duration,
        useNativeDriver: false,
      }),
    ]),
    Animated.timing(particle.opacity, {
      toValue: 0,
      duration: duration * 0.2,
      useNativeDriver: false,
    }),
  ]).start(() => animateParticle(particle));
}

export default function ParticleSystem() {
  const { theme, particlesEnabled } = useTheme();
  const particles = useRef<Particle[]>(
    Array.from({ length: PARTICLE_COUNT }, createParticle)
  );

  useEffect(() => {
    if (!particlesEnabled) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    particles.current.forEach((p) => {
      const timer = setTimeout(() => animateParticle(p), Math.random() * 2000);
      timers.push(timer);
    });

    return () => {
      timers.forEach(clearTimeout);
      particles.current.forEach((p) => {
        p.opacity.stopAnimation();
        p.left.stopAnimation();
        p.top.stopAnimation();
      });
    };
  }, [particlesEnabled]);

  if (!particlesEnabled) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.current.map((particle, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            width: particle.size,
            height: particle.size,
            borderRadius: particle.size / 2,
            backgroundColor: theme.primary,
            opacity: particle.opacity,
            left: particle.left,
            top: particle.top,
          }}
        />
      ))}
    </View>
  );
}
