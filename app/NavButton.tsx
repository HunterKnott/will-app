import React, { useState } from 'react';
import { TouchableOpacity, Text, Animated, Linking } from 'react-native';
import { useRouter } from 'expo-router';

interface IntroButtonProps {
  color: string;
  text: string;
  navigateTo?: string;
  link?: string;
  onPress?: () => void;
}

export default function NavButton({ color, text, navigateTo, link, onPress }: IntroButtonProps) {
  const [scale] = useState(new Animated.Value(1));
  const router = useRouter();

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 1.1,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (link) {
        Linking.openURL(link);
    } else if (navigateTo) {
        router.push(navigateTo as any);
    } else if (onPress) {
      onPress();
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        className='py-2.5 px-5 rounded-lg flex justify-center items-center'
        style={[{ backgroundColor: color }]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text className='text-white font-bold text-3xl'>{text}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}